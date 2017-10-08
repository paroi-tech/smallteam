import config from "../../isomorphic/config"
import { Dash } from "bkb"
import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { getFragmentMeta, toIdentifier } from "../../isomorphic/meta"
import { Cargo, Type, FragmentRef, FragmentsRef, Fragments, Changed, PartialFragments, Identifier, BatchCargo, ModelUpdate, Identifiers, Dependencies } from "../../isomorphic/Cargo"
import { makeHKMap, makeHKSet, HKMap, HKSet } from "../../isomorphic/libraries/HKCollections"
import Deferred from "../libraries/Deferred"
import { toDebugStr } from "../../isomorphic/libraries/helpers"
import { Collection } from "./modelDefinitions"

// --
// -- Public types
// --

export type CommandType = "create" | "update" | "delete"

type GetDependencies = (fragOrOrderProps: object | OrderProperties) => Dependencies | undefined

export type OrderProperties = { idList: Identifier[], groupName?: string, groupId?: Identifier }

export interface IndexCallbacks {
  [name: string]: (frag: object) => boolean
}

export interface IndexQuery {
  type: Type
  index: Index
  indexCb?: IndexCallbacks
  key: IndexKey
}

export interface ModelsQuery extends IndexQuery {
  orderBy?: [string, "asc" | "desc"] | ((a, b) => number)
}

export interface ReorderModelEvent {
  type: Type
  cmd: "reorder"
  orderedIds: Identifier[]
}

export interface UpdateModelEvent {
  type: Type
  cmd: CommandType
  id: Identifier
  /**
   * Defined if the cmd is not 'delete'
   */
  model?: any
}
//type ModelEvent = ReorderModelEvent | UpdateModelEvent

// --
// -- Private types
// --

interface Entity {
  fragment: object
  model?: object
  deleted?: boolean
}

type Index = string | string[]

interface IndexKey {
  [fieldName: string]: string
}

/**
 * Map keys are `IndexKey` as string
 *
 * Set keys are `Identifier` as string
 */
type IndexMap = HKMap<IndexKey, HKSet<Identifier>>

interface IndexData {
  map: IndexMap
  indexCb?: IndexCallbacks
}

interface TypeStorage {
  /**
   * Keys are `Identifier` as string
   */
  entities: HKMap<Identifier, Entity>
  /**
   * Keys are `Index` as string
   */
  indexes: HKMap<Index, IndexData>
  modelMaker: (getFrag: () => object) => object
}

export type HttpMethod = "POST" | "GET"

// --
// -- Class ModelEngine
// --

interface Batch {
  httpMethod?: HttpMethod
  list: any[]
  deferred: Deferred<BatchCargo>
}

export default class ModelEngine {
  private store = makeHKMap<Type, TypeStorage>()
  private dependencies = new Map<string, GetDependencies[]>()
  private batch: Batch | null = null

  constructor(private dash: Dash<object>) {
    this.dash.exposeEvents(`change`, `create`, `update`, `delete`, `reorder`)
  }

  public registerType(type: Type, modelMaker: (getFrag: () => object) => object) {
    this.store.set(type, {
      entities: makeHKMap<any, any>(),
      indexes: makeHKMap<any, any>(),
      modelMaker
    })
    this.dash.exposeEvents(`change${type}`, `create${type}`, `update${type}`, `delete${type}`, `reorder${type}`)
  }

  public registerDependency(cmd: CommandType | "reorder", dependOf: Type, getDependencies: GetDependencies) {
    let depKey = JSON.stringify([cmd, dependOf])
    let list = this.dependencies.get(depKey)
    if (!list)
      this.dependencies.set(depKey, list = [])
    list.push(getDependencies)
  }

  public startBatchRecord(httpMethod?: HttpMethod) {
    if (this.batch)
      throw new Error(`Invalid call to startBatchRecord: the engine is already in batch mode`)
    let batch: Batch = this.batch = {
      httpMethod,
      list: [],
      deferred: new Deferred()
    }
  }

  public async sendBatchRecord(): Promise<void> {
    if (!this.batch)
      throw new Error(`Invalid call to sendBatchRecord: the engine is not in batch mode`)
    let batch = this.batch
    this.batch = null
    if (batch.list.length > 0)
      await batch.deferred.pipeTo(httpSendJson(batch.httpMethod!, "/api/batch", batch.list))
  }

  public cancelBatchRecord(err?: any) {
    if (this.batch) {
      this.batch.deferred.reject(err || new Error(`Batch record is canceled`))
      this.batch = null
    }
  }

  public async exec(cmd: CommandType, type: Type, frag: object): Promise<any> {
    let del = cmd === "delete"
    let dependencies = this.getExecDependencies(cmd, type, frag)
    let resultFrag = await this.httpSendAndUpdate(
      "POST",
      "/api/exec",
      { cmd, type, frag, dependencies },
      del ? "none" : "fragment"
    )
    if (!del)
      return this.getModel(type, toIdentifier(resultFrag, getFragmentMeta(type)))
  }

  public async reorder(type: Type, orderedIds: OrderProperties): Promise<Identifier[]> {
    let orderFieldName = getFragmentMeta(type).orderFieldName
    if (!orderFieldName)
      throw new Error(`Cannot reorder type ${type}, missing orderFieldName in meta`)
    if (orderedIds.idList.length === 0)
      return []
    let dependencies = this.getExecDependencies("reorder", type, orderedIds)
    await this.httpSendAndUpdate("POST", "/api/exec", { cmd: "reorder", type, ...orderedIds, dependencies }, "none")
    return orderedIds.idList
      .map(id => ({ id, frag: this.getFragment({ id, type }) }))
      .sort((a, b) => a.frag[orderFieldName!] - b.frag[orderFieldName!])
      .map(obj => obj.id)
  }

  public async query(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    let data: any = { cmd: "query", type }
    if (filters)
      data.filters = filters
    let fragments: any[] = await this.httpSendAndUpdate("POST", "/api/query", data, "fragments"),
      fragMeta = getFragmentMeta(type)
    return toCollection(fragments.map(frag => this.getModel(type, toIdentifier(frag, fragMeta))), type)
  }

  public getModel(type: Type, id: Identifier): any {
    let storage = this.getTypeStorage(type),
      entity = storage.entities.get(id)
    if (!entity)
      throw new Error(`Unknown ID "${id}" in type: ${type}`)
    if (!entity.model) {
      entity.model = storage.modelMaker(() => {
        if (entity!.deleted)
          throw new Error(`Cannot access to the deleted model ${type}.${id}`)
        return entity!.fragment
      })
    }
    return entity.model
  }

  public getModels<M = any>(query: ModelsQuery, onEmptyVal: any = []): Collection<M, Identifier> {
    let identifiers = this.findIdentifiersFromIndex(query)
    let list: any[] = []
    if (identifiers) {
      for (let id of identifiers)
        list.push(this.getModel(query.type, id))

      if (query.orderBy) {
        let sortFn = Array.isArray(query.orderBy) ? makeDefaultSortFn(query.orderBy) : query.orderBy
        list.sort(sortFn)
      }
    }
    if (list.length === 0)
      return Array.isArray(onEmptyVal) ? toCollection(onEmptyVal, query.type) : onEmptyVal
    return toCollection(list, query.type)
  }

  public getAllModels<M = any>(type: Type, onEmptyVal = []): M[] {
    let storage = this.getTypeStorage(type),
      identifiers = storage.entities.keys()
    let list: any[] = []
    for (let id of identifiers)
      list.push(this.getModel(type, id))
    return toCollection(list.length === 0 ? onEmptyVal : list, type)
  }

  public countModels(query: IndexQuery): number {
    let identifiers = this.findIdentifiersFromIndex(query)
    return identifiers ? identifiers.size : 0
  }

  public findSingleFromIndex(query: IndexQuery): any | undefined {
    let identifiers = this.findIdentifiersFromIndex(query)
    //console.log(`  > findSingleFromIndex A`, query, identifiers)
    if (!identifiers)
      return undefined
    if (identifiers.size > 1)
      throw new Error(`Invalid call to "findSingleFromIndex", there are ${identifiers.size} results`)
    // console.log(`  > findSingleFromIndex B`, query, identifiers)
    for (let id of identifiers)
      return this.getModel(query.type, id)
    // console.log(`  > findSingleFromIndex C`, query, identifiers)
    return undefined
  }

  private getExecDependencies(cmd: CommandType | "reorder", type: Type, data: object | OrderProperties): Dependencies[] | undefined {
    let depKey = JSON.stringify([cmd, type])
    let cbList = this.dependencies.get(depKey)
    if (!cbList)
      return
    let result: Dependencies[] = []
    for (let cb of cbList) {
      let dep = cb(data)
      if (dep)
        result.push(dep)
    }
    return result.length > 0 ? result : undefined
  }

  private findIdentifiersFromIndex({ type, index, key, indexCb }: IndexQuery): HKSet<Identifier> | undefined {
    index = cleanIndex(index, indexCb)
    let storage = this.getTypeStorage(type)
    let indexData = storage.indexes.get(index)
    // console.log("  > findIdentifiersFromIndex A", index, storage, indexData)
    if (!indexData) {
      checkColumnsAreInMeta(type, indexToFieldNames(index, indexCb))
      storage.indexes.set(index, indexData = {
        map: makeHKMap<any, any>(),
        indexCb
      })
      // console.log("  > findIdentifiersFromIndex B", toDebugStr(storage.indexes))
      fillIndex(storage, index, indexData)
      //console.log("[storage.indexes] getModels B", toDebugStr(storage.indexes))
      // console.log("==> AFTER FILL", index, "ENTITIES:", type, toDebugStr(storage.entities), "INDEXES:", toDebugStr(storage.indexes), "INDEXMAP", toDebugStr(indexMap))
    }

    return indexData.map.get(key)
  }

  private getTypeStorage(type: Type): TypeStorage {
    let storage = this.store.get(type)
    if (!storage)
      throw new Error(`Unknown type: ${type}`)
    return storage
  }

  private updateStore(fragments: Fragments) {
    for (let type in fragments) {
      if (!fragments.hasOwnProperty(type))
        continue
      let storage = this.getTypeStorage(type as Type)
      let fragMeta = getFragmentMeta(type as Type)
      for (let frag of fragments[type]) {
        let id = toIdentifier(frag, fragMeta),
          prevEntity = storage.entities.get(id)
        if (prevEntity) {
          if (prevEntity.deleted)
            prevEntity.deleted = false
          prevEntity.fragment = frag
        } else {
          storage.entities.set(id, {
            fragment: frag
          })
        }
        addFragmentToIndexes(storage, id, frag, !!prevEntity)
        // console.log(`## updateStore`, type, id)
      }
    }
  }

  private updateStoreFromPartial(partial: PartialFragments) {
    for (let type in partial) {
      if (!partial.hasOwnProperty(type))
        continue
      let storage = this.getTypeStorage(type as Type)
      let fragMeta = getFragmentMeta(type as Type)
      for (let partialFrag of partial[type]) {
        let id = toIdentifier(partialFrag, fragMeta)
        let entity = storage.entities.get(id)
        if (entity && !entity.deleted)
          updateEntityFromPartial(storage, id, partialFrag, entity, fragMeta)
      }
    }
  }

  private deleteFromStore(deleted: Changed) {
    for (let type in deleted) {
      if (!deleted.hasOwnProperty(type))
        continue
      let storage = this.getTypeStorage(type as Type)
      for (let id of deleted[type]) {
        let entity = storage.entities.get(id)
        if (entity) {
          storage.entities.delete(id)
          entity.deleted = true
          entity.model = undefined
        }
      }
      rmFragmentFromIndexes(storage, deleted[type])
    }
  }

  private emitEvents(changed: Changed, cmd: CommandType) {
    const that = this
    for (let [type, idList] of Object.entries<any>(changed)) {
      let storage = this.getTypeStorage(type as Type)
      for (let id of idList) {
        this.dash.emit(["change", `${cmd}`, `change${type}`, `${cmd}${type}`], {
          type,
          cmd,
          id,
          get model() {
            return cmd === "delete" ? undefined : that.getModel(type as Type, id)
          }
        } as UpdateModelEvent)
      }
    }
  }

  private emitEventReordered(reordered: Changed) {
    const that = this,
      cmd = "reorder"
    for (let [type, orderedIds] of Object.entries<any>(reordered)) {
      let storage = this.getTypeStorage(type as Type)
      this.dash.emit(["change", `${cmd}`, `change${type}`, `${cmd}${type}`], {
        type,
        cmd,
        orderedIds
      } as ReorderModelEvent)
    }
  }

  private getFragment(ref: FragmentRef) {
    let storage = this.getTypeStorage(ref.type)
    let entity = storage.entities.get(ref.id)
    if (!entity)
      throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
    return entity.fragment
  }

  private getFragments(ref: FragmentsRef): any[] {
    let storage = this.getTypeStorage(ref.type)
    let list: any[] = []
    for (let id of ref.list) {
      let entity = storage.entities.get(id)
      if (!entity) {
        //console.log('=======>', Array.from(storage.entities.keys()))
        throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
      }
      list.push(entity.fragment)
    }
    return list
  }

  private async httpSendAndUpdate(method: HttpMethod, url, data, resultType?: "data" | "fragment" | "fragments" | "none"): Promise<any> {
    let cargo = await this.httpSendOrBatch(method, url, data)
    if (cargo.modelUpd)
      this.processModelUpdate(cargo.modelUpd)
    if (!cargo.done) {
      console.log("Error on server", cargo.displayError, cargo.debugData)
      throw new Error("Error on server")
    }
    if (cargo.result) {
      if (resultType && resultType !== cargo.result.type)
        throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
      switch (cargo.result.type) {
        case "data":
          return cargo.result.val
        case "fragment":
          if (!cargo.result.val)
            throw new Error(`Missing fragment result for HTTP query`)
          return this.getFragment(cargo.result.val)
        case "fragments":
          return cargo.result.val ? this.getFragments(cargo.result.val) : []
      }
    }
    if (resultType && resultType !== "none")
      throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
  }

  private processModelUpdate(modelUpd: ModelUpdate) {
    if (modelUpd.fragments)
      this.updateStore(modelUpd.fragments)
    if (modelUpd.partial)
      this.updateStoreFromPartial(modelUpd.partial)
    if (modelUpd.deleted) {
      this.deleteFromStore(modelUpd.deleted)
      this.emitEvents(modelUpd.deleted, "delete")
    }
    if (modelUpd.updated)
      this.emitEvents(modelUpd.updated, "update")
    if (modelUpd.created)
      this.emitEvents(modelUpd.created, "create")
    if (modelUpd.reordered)
      this.emitEventReordered(modelUpd.reordered)
  }

  private httpSendOrBatch(method: HttpMethod, url, data): Promise<Cargo> {
    if (!this.batch)
      return httpSendJson(method, url, data)
    if (!this.batch.httpMethod || (this.batch.httpMethod === "GET" && method === "POST"))
      this.batch.httpMethod = method
    let batchIndex = this.batch.list.length
    this.batch.list.push(data)
    return this.batch.deferred.promise.then(result => {
      if (batchIndex === 0 && result.modelUpd) // process modelUpd once (is there a better place?)
        this.processModelUpdate(result.modelUpd)
      if (!result.responses || result.responses.length <= batchIndex)
        throw new Error(`The batch command is canceled due to a previous command error`)
      //console.log(`.............${batchIndex} // `, result)
      return result.responses[batchIndex]
    })
  }
}

// --
// -- Public tools
// --

export function appendGettersToModel(model: object, type: Type, getFrag: () => object) {
  let fragMeta = getFragmentMeta(type)
  for (let fieldName of Object.keys(fragMeta.fields)) {
    Object.defineProperty(model, fieldName, {
      get: function () { return getFrag()[fieldName] },
      configurable: false
    })
  }
}

// --
// -- Private tools
// --

function indexToFieldNames(index: Index, indexCallbacks?: IndexCallbacks) {
  let names = typeof index === "string" ? [index] : index
  return indexCallbacks ? names.filter(name => !indexCallbacks[name]) : names
}

function checkColumnsAreInMeta(type: Type, fieldNames: string[]) {
  let fragMeta = getFragmentMeta(type)
  for (let name of fieldNames) {
    if (!fragMeta.fields[name])
      throw new Error(`Unknown field ${name} in ${type}`)
  }
}

function cleanIndex(index: Index, indexCb?: IndexCallbacks): Index {
  if (typeof index === "string")
    index = [index]
  index = indexCb ? [...index, ...Object.keys(indexCb)] : [...index]
  index.sort()
  return index
}

function fillIndex(storage: TypeStorage, index: Index, indexData: IndexData) {
  //console.log("  ** fillIndex A", index, toDebugStr(indexData.map)) // , toDebugStr(storage.entities)
  for (let [id, entity] of storage.entities)
    tryToAddToIndex(index, indexData, id, entity.fragment)
  //console.log("  ** fillIndex B", index, toDebugStr(indexData.map)) // , toDebugStr(storage.entities)
}

function addFragmentToIndexes(storage: TypeStorage, id: Identifier, frag: object, removeOld = false) {
  if (removeOld)
    rmFragmentFromIndexes(storage, [id])
  for (let [index, indexData] of storage.indexes)
    tryToAddToIndex(index, indexData, id, frag)
}

function tryToAddToIndex(index: Index, indexData: IndexData, id: Identifier, frag: object) {
  if (indexData.indexCb && !canBeAddedToIndex(frag, indexData.indexCb))
    return
  let fieldNames = indexToFieldNames(index, indexData.indexCb)
  let key = {}
  //console.log("  && tryToAddToIndex a", fieldNames, index, id, frag)
  for (let name of fieldNames)
    key[name] = frag[name]
  let identifiers = indexData.map.get(key)
  if (!identifiers)
    indexData.map.set(key, identifiers = makeHKSet<any>())
  identifiers.add(id)
  //console.log("  && tryToAddToIndex b", index, key, toDebugStr(indexData.map), toDebugStr(identifiers), "ID=", id)
}

function canBeAddedToIndex(frag: object, indexCb: IndexCallbacks) {
  for (let name of Object.keys(indexCb)) {
    if (indexCb.hasOwnProperty(name) && !indexCb[name](frag))
      return false
  }
  return true
}

function rmFragmentFromIndexes(storage: TypeStorage, idList: Identifier[]) {
  for (let [index, indexMap] of storage.indexes) {
    for (let identifiers of indexMap.map.values()) {
      for (let id of idList)
        identifiers.delete(id)
    }
  }
}

function updateEntityFromPartial(storage: TypeStorage, id: Identifier, partialFrag: object, entity: Entity, fragMeta: FragmentMeta) {
  for (let fieldName of Object.keys(partialFrag)) {
    if (partialFrag[fieldName] === null)
      delete entity.fragment[fieldName]
    else
      entity.fragment[fieldName] = partialFrag[fieldName]
  }
  addFragmentToIndexes(storage, id, partialFrag, true)
}

function makeDefaultSortFn([fieldName, direction]: [string, "asc" | "desc"]) {
  // TODO: check that the fieldName is in meta
  return function (a, b) {
    let diff = a[fieldName] - b[fieldName]
    return direction === "asc" ? diff : -diff
  }
}

function isFragmentRef(ref: FragmentRef | FragmentsRef): ref is FragmentRef {
  return !ref["list"]
}

async function httpSendJson(method: HttpMethod, url: string, data): Promise<any> {
  url = `${config.urlPrefix}${url}`
  console.log(`>> ${method}`, url, data)
  let response = await fetch(url, {
    method: method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: data ? JSON.stringify(data) : undefined
  })
  try {
    let respData = await response.json()
    console.log("  ... FETCHED:", respData)
    return respData
  } catch (err) {
    console.log("Parsing failed", err)
    throw err
  }
}

export function toCollection<M extends object, ID extends Identifier>(models: M[], type: Type): Collection<M, ID> {
  let map: HKMap<ID, M>,
    alias: any = models
  alias.get = id => {
    if (!map) {
      map = makeHKMap<ID, M>()
      for (let model of models)
        map.set(toIdentifier(model, type) as ID, model)
    }
    return map.get(id)
  }
  return alias
}
