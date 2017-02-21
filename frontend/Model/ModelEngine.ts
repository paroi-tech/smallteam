import { Dash } from "bkb"
import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { getFragmentMeta, toIdentifier } from "../../isomorphic/meta"
import { Cargo, Type, FragmentRef, FragmentsRef, Fragments, Changed, PartialFragments, Identifier } from "../../isomorphic/Cargo"
import { makeHKMap, makeHKSet, HKMap, HKSet } from "../../isomorphic/libraries/HKCollections"
import Deferred from "../libraries/Deferred"
//import { validateDataArray } from "../../isomorphic/validation"

// --
// -- Public types
// --

export type CommandType = "create" | "update" | "delete"

export interface IndexCallbacks {
  [name: string]: (frag: {}) => boolean
}

export interface ModelsQuery {
  type: Type
  index: Index
  indexCb?: IndexCallbacks
  key: IndexKey
  orderBy: [string, "asc" | "desc"] | ((a, b) => number)
}

export interface ModelEvent {
  type: Type
  id: Identifier
  cmd: CommandType
  model: any
}

// --
// -- Private types
// --

interface Entity {
  fragment: {}
  model?: {}
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
  modelMaker: (getFrag: () => {}) => {}
}

export type HttpMethod = "POST" | "GET"

// --
// -- Class ModelEngine
// --

interface Batch {
  httpMethod?: HttpMethod
  list: any[]
  deferred: Deferred<any[]>
}

export default class ModelEngine {
  private store = makeHKMap<Type, TypeStorage>()
  private batch: Batch | null

  constructor(private dash: Dash<{}>) {
    this.dash.exposeEvents(`change`, `create`, `update`, `delete`)
  }

  public registerType(type: Type, modelMaker: (getFrag: () => {}) => {}) {
    this.store.set(type, {
      entities: makeHKMap<any, any>(),
      indexes: makeHKMap<any, any>(),
      modelMaker
    })
    this.dash.exposeEvents(`change${type}`, `create${type}`, `update${type}`, `delete${type}`)
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

  public async exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    let del = cmd === "delete"
    let resultFrag = await this.httpSendAndUpdate("POST", "/api/exec", {
      cmd,
      type,
      [del ? "id" : "frag"]: fragOrId
    }, del ? "none" : "fragment")
    if (!del)
      return this.getModel(type, toIdentifier(resultFrag, getFragmentMeta(type)))
  }

  public async reorder(type: Type, orderedIds: { idList: Identifier[], groupId?: Identifier }): Promise<Identifier[]> {
    let orderFieldName = getFragmentMeta(type).orderFieldName
    if (!orderFieldName)
      throw new Error(`Cannot reorder type ${type}, missing orderFieldName in meta`)
    if (orderedIds.idList.length === 0)
      return []
    await this.httpSendAndUpdate("POST", "/api/exec", { cmd: "reorder", type, ...orderedIds }, "none")
    return orderedIds.idList
      .map(id => { return { id, frag: this.getFragment({ id, type }) } })
      .sort((a, b) => a.frag[orderFieldName!] - b.frag[orderFieldName!])
      .map(obj => obj.id)
  }

  public async query(type: Type, filters?: any): Promise<any[]> {
    let data: any = { type }
    if (filters)
      data.filters = filters
    let fragments: any[] = await this.httpSendAndUpdate("POST", "/api/query", data, "fragments"),
      fragMeta = getFragmentMeta(type)
    return fragments.map(frag => this.getModel(type, toIdentifier(frag, fragMeta)))
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

  public getModels({type, index, indexCb, key, orderBy}: ModelsQuery): any[] {
    index = cleanIndex(index, indexCb)
    let storage = this.getTypeStorage(type)
    let indexData = storage.indexes.get(index)
    //console.log("getModels A", index, storage, indexMap)
    if (!indexData) {
      storage.indexes.set(index, indexData = {
        map: makeHKMap<any, any>(),
        indexCb
      })
      //console.log("[storage.indexes] getModels A", toDebugStr(storage.indexes))
      fillIndex(storage, index, indexData)
      //console.log("[storage.indexes] getModels B", toDebugStr(storage.indexes))
      // console.log("==> AFTER FILL", index, "ENTITIES:", type, toDebugStr(storage.entities), "INDEXES:", toDebugStr(storage.indexes), "INDEXMAP", toDebugStr(indexMap))
    }

    let identifiers = indexData.map.get(key)
    if (!identifiers)
      return []

    let list: any[] = []
    for (let id of identifiers)
      list.push(this.getModel(type, id))

    let sortFn = Array.isArray(orderBy) ? makeDefaultSortFn(orderBy) : orderBy;
    list.sort(sortFn)
    return list
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
    for (let type in changed) {
      if (!changed.hasOwnProperty(type))
        continue
      let storage = this.getTypeStorage(type as Type)
      for (let id of changed[type]) {
        this.dash.emit(["change", `${cmd}`, `change${type}`, `${cmd}${type}`], {
          type,
          id,
          cmd,
          get model() {
            return that.getModel(type as Type, id)
          }
        } as ModelEvent)
      }
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
      if (!entity)
        throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
      list.push(entity.fragment)
    }
    return list
  }

  private async httpSendAndUpdate(method: HttpMethod, url, data, resultType?: "data" | "fragment" | "fragments" | "none"): Promise<any> {
    let cargo = await this.httpSendOrBatch(method, url, data)
    if (cargo.modelUpd) {
      if (cargo.modelUpd.fragments)
        this.updateStore(cargo.modelUpd.fragments)
      if (cargo.modelUpd.partial)
        this.updateStoreFromPartial(cargo.modelUpd.partial)
      if (cargo.modelUpd.deleted) {
        this.deleteFromStore(cargo.modelUpd.deleted)
        this.emitEvents(cargo.modelUpd.deleted, "delete")
      }
      if (cargo.modelUpd.updated)
        this.emitEvents(cargo.modelUpd.updated, "update")
      if (cargo.modelUpd.created)
        this.emitEvents(cargo.modelUpd.created, "create")
    }
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

  private httpSendOrBatch(method: HttpMethod, url, data): Promise<Cargo> {
    if (!this.batch)
      return httpSendJson(method, url, data)
    if (!this.batch.httpMethod || this.batch.httpMethod === "GET" && method === "POST")
      this.batch.httpMethod = method
    let batchId = this.batch.list.length
    this.batch.list.push(data)
    return this.batch.deferred.promise.then(results => results[batchId])
  }
}

// --
// -- Public tools
// --

export function appendGettersToModel(model, type: Type, getFrag: () => {}) {
  let fragMeta = getFragmentMeta(type)
  for (let fieldName in fragMeta.fields) {
    if (!fragMeta.fields.hasOwnProperty(fieldName))
      continue
    Object.defineProperty(model, fieldName, {
      get: function () { return getFrag()[fieldName] },
      configurable: false
    })
  }
}

// --
// -- Private tools
// --

function cleanIndex(index: Index, indexCb?: IndexCallbacks): Index {
  if (typeof index === "string")
    index = [index]
  index = indexCb ? [...index, ...Object.keys(indexCb)] : [...index]
  index.sort()
  return index
}

function fillIndex(storage: TypeStorage, index: Index, indexData: IndexData) {
  // console.log("fillIndex A", index, storage, toDebugStr(indexMap), toDebugStr(storage.entities))
  for (let [id, entity] of storage.entities)
    tryToAddToIndex(index, indexData, id, entity.fragment)
}

function addFragmentToIndexes(storage: TypeStorage, id: Identifier, frag: {}, removeOld = false) {
  if (removeOld)
    rmFragmentFromIndexes(storage, [id])
  for (let [index, indexData] of storage.indexes)
    tryToAddToIndex(index, indexData, id, frag)
}

function tryToAddToIndex(index: Index, indexData: IndexData, id: Identifier, frag: {}) {
  if (indexData.indexCb && !canBeAddedToIndex(frag, indexData.indexCb))
    return
  let fieldNames: string[] = []
  let names = typeof index === "string" ? [index] : index
  for (let name of names) {
    if (!indexData[name])
      fieldNames.push(name)
  }
  let key = {}
  //console.log("tryToAddToIndex", fieldNames, index)
  for (let name of fieldNames)
    key[name] = frag[name]
  let identifiers = indexData.map.get(key)
  if (!identifiers)
    indexData.map.set(key, identifiers = makeHKSet<any>())
  identifiers.add(id)
  // console.log("tryToAddToIndex A", index, key, toDebugStr(indexMap), toDebugStr(identifiers), "ID=", id)
}

function canBeAddedToIndex(frag: {}, indexCb: IndexCallbacks) {
  for (let name in indexCb) {
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

function updateEntityFromPartial(storage: TypeStorage, id: Identifier, partialFrag: {}, entity: Entity, fragMeta: FragmentMeta) {
  for (let fieldName in partialFrag) {
    if (!partialFrag.hasOwnProperty(fieldName))
      continue
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
  return !ref['list']
}

async function httpSendJson(method: HttpMethod, url: string, data): Promise<any> {
  console.log(`>> ${method}`, url, data)
  let response = await fetch(url, {
    method: method,
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
