import Deferred from "@smallteam/shared-ui/libraries/Deferred"
import { BatchCargo, Cargo, Changed, Dependencies, FragmentRef, Fragments, FragmentsRef, Identifier, ModelUpdate, PartialFragments, Type } from "@smallteam/shared/dist/Cargo"
import { HKMap, HKSet, makeHKMap, makeHKSet } from "@smallteam/shared/dist/libraries/HKCollections"
import { getFragmentMeta, toIdentifier, TypeVariant } from "@smallteam/shared/dist/meta"
import { WhoUseItem } from "@smallteam/shared/dist/transfers"
import { Dash } from "bkb"
import GenericBgCommandManager from "./BgCommandManager"
import { Collection } from "./modelDefinitions"

// --
// -- Public types
// --

export type CommandType = "create" | "update" | "delete"

type GetDependencies = (fragOrOrderProps: any | OrderProperties) => Dependencies | undefined  // FIXME: Why 'any' instead of 'object'?

export interface OrderProperties {
  idList: Identifier[]
  groupName?: string
  groupId?: Identifier
}

export interface IndexCallbacks<M = any> {
  [name: string]: (frag: M) => boolean
}

export interface IndexQuery<M = any> {
  type: Type
  index: Index
  indexCb?: IndexCallbacks<M>
  key: IndexKey
}

export interface ModelsQuery<M = any> extends IndexQuery<M> {
  orderBy?: [string, "asc" | "desc"] | ((a, b) => number)
}

export interface ReorderModelEvent {
  type: Type
  cmd: "reorder"
  orderedIds: Identifier[]
}

export interface UpdateModelEvent<M = any> {
  type: Type
  cmd: CommandType
  id: Identifier
  /**
   * Defined if the cmd is not 'delete'
   */
  model: M
}
// type ModelEvent = ReorderModelEvent | UpdateModelEvent

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

export type Trigger = (cmd: CommandType, id: string) => void

export default class ModelEngine {
  readonly bgManager: GenericBgCommandManager

  private store = makeHKMap<Type, TypeStorage>()
  private dependencies = new Map<string, GetDependencies[]>()
  private triggers = {
    before: new Map<Type, Trigger[]>(),
    after: new Map<Type, Trigger[]>()
  }
  private batch: Batch | null = null
  private processing = new Set<string>()

  constructor(private dash: Dash, private baseUrl: string) {
    this.dash.exposeEvent("change", "create", "update", "delete", "reorder", "processing", "endProcessing")
    this.bgManager = new GenericBgCommandManager(dash)
  }

  registerType(type: Type, modelMaker: (getFrag: () => any) => object) { // FIXME: Why 'any' instead of 'object'?
    this.store.set(type, {
      entities: makeHKMap<any, any>(),
      indexes: makeHKMap<any, any>(),
      modelMaker
    })
    this.dash.exposeEvent(
      `change${type}`, `create${type}`, `update${type}`, `delete${type}`, `reorder${type}`,
      `processing${type}`, `endProcessing${type}`
    )
  }

  registerDependency(cmd: CommandType | "reorder", dependOf: Type, getDependencies: GetDependencies) {
    const depKey = JSON.stringify([cmd, dependOf])
    let list = this.dependencies.get(depKey)
    if (!list)
      this.dependencies.set(depKey, list = [])
    list.push(getDependencies)
  }

  registerTriggerBefore(type: Type, trigger: Trigger) {
    let list = this.triggers.before.get(type)
    if (!list)
      this.triggers.before.set(type, list = [])
    list.push(trigger)
  }

  registerTriggerAfter(type: Type, trigger: Trigger) {
    let list = this.triggers.after.get(type)
    if (!list)
      this.triggers.after.set(type, list = [])
    list.push(trigger)
  }

  startBatchRecord(httpMethod?: HttpMethod) {
    if (this.batch)
      throw new Error("Invalid call to startBatchRecord: the engine is already in batch mode")
    this.batch = {
      httpMethod,
      list: [],
      deferred: new Deferred()
    }
  }

  async sendBatchRecord(): Promise<void> {
    if (!this.batch)
      throw new Error("Invalid call to sendBatchRecord: the engine is not in batch mode")
    const batch = this.batch
    this.batch = null
    if (batch.list.length > 0)
      await batch.deferred.pipeTo(httpSendJson(batch.httpMethod!, `${this.baseUrl}/api/model/batch`, batch.list))
  }

  cancelBatchRecord(err?: any) {
    if (this.batch) {
      this.batch.deferred.reject(err || new Error("Batch record is canceled"))
      this.batch = null
    }
  }

  exec(cmd: CommandType, type: Type, frag: object): Promise<any> {
    return this.bgManager.add(this.doExec(cmd, type, frag), `${cmd} ${type}`).promise
  }

  isProcessing(id: Identifier, type: Type): boolean {
    return this.processing.has(JSON.stringify([type, id]))
  }

  reorder(type: Type, orderedIds: OrderProperties): Promise<Identifier[]> {
    return this.bgManager.add(this.doReorder(type, orderedIds), `reorder ${type}`).promise
  }

  async doReorder(type: Type, orderedIds: OrderProperties): Promise<Identifier[]> {
    const orderFieldName = getFragmentMeta(type).orderFieldName
    if (!orderFieldName)
      throw new Error(`Cannot reorder type ${type}, missing orderFieldName in meta`)
    if (orderedIds.idList.length === 0)
      return []
    const dependencies = this.getExecDependencies("reorder", type, orderedIds)
    await this.httpSendAndUpdate("POST", `${this.baseUrl}/api/model/exec`, { cmd: "reorder", type, ...orderedIds, dependencies }, "none")
    return orderedIds.idList
      .map(id => ({ id, frag: this.getFragment({ id, type }) }))
      .sort((a, b) => a.frag[orderFieldName!] - b.frag[orderFieldName!])
      .map(obj => obj.id)
  }

  fetch(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    return this.bgManager.add(this.doFetch(type, filters), `fetch ${type}`).promise
  }

  async doFetch(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    const data: any = { cmd: "fetch", type }
    if (filters)
      data.filters = filters
    const fragments: any[] = await this.httpSendAndUpdate("POST", `${this.baseUrl}/api/model/query`, data, "fragments")
    getFragmentMeta(type)
    return toCollection(fragments.map(frag => this.getModel(type, toIdentifier(frag, type))), type)
  }

  getModel<M = any>(type: Type, id: Identifier): M {
    const storage = this.getTypeStorage(type)
    const entity = storage.entities.get(id)
    if (!entity)
      throw new Error(`Unknown ID "${id}" in type: ${type}`)
    if (!entity.model) {
      entity.model = storage.modelMaker(() => {
        if (entity!.deleted)
          throw new Error(`Cannot access to the deleted model ${type}.${id}`)
        return entity!.fragment
      })
    }
    return entity.model as any
  }

  getModels<M = any>(query: ModelsQuery<M>, onEmptyVal: any = []): Collection<M, Identifier> {
    const identifiers = this.findIdentifiersFromIndex(query)
    const list: any[] = []
    if (identifiers) {
      for (const id of identifiers)
        list.push(this.getModel(query.type, id))

      if (query.orderBy) {
        const sortFn = Array.isArray(query.orderBy) ? makeDefaultSortFn(query.orderBy) : query.orderBy
        list.sort(sortFn)
      }
    }
    if (list.length === 0)
      return Array.isArray(onEmptyVal) ? toCollection(onEmptyVal, query.type) : onEmptyVal
    return toCollection(list, query.type)
  }

  getAllModels<M = any>(type: Type, orderBy?: [string, "asc" | "desc"] | ((a, b) => number)): M[] {
    const storage = this.getTypeStorage(type)
    const identifiers = storage.entities.keys()
    const list: any[] = []
    for (const id of identifiers)
      list.push(this.getModel(type, id))
    if (orderBy) {
      const sortFn = Array.isArray(orderBy) ? makeDefaultSortFn(orderBy) : orderBy
      list.sort(sortFn)
    }
    return toCollection(list, type)
  }

  countModels(query: IndexQuery): number {
    const identifiers = this.findIdentifiersFromIndex(query)
    return identifiers ? identifiers.size : 0
  }

  findSingleFromIndex(query: IndexQuery): any | undefined {
    const identifiers = this.findIdentifiersFromIndex(query)
    // console.log(`  > findSingleFromIndex A`, query, identifiers)
    if (!identifiers)
      return undefined
    if (identifiers.size > 1)
      throw new Error(`Invalid call to "findSingleFromIndex", there are ${identifiers.size} results`)
    // console.log(`  > findSingleFromIndex B`, query, identifiers)
    for (const id of identifiers)
      return this.getModel(query.type, id)
    // console.log(`  > findSingleFromIndex C`, query, identifiers)
    return undefined
  }

  /**
   * Called by triggers. Remove dependencies from the store. No effect on the backend.
   */
  removeFrontendModels(query: ModelsQuery) {
    const identifiers = this.findIdentifiersFromIndex(query)
    if (identifiers) {
      this.deleteFromStore({
        [query.type]: identifiers
      })
    }
  }

  /**
   * Can be called by triggers.
   */
  emitEvents(changed: Changed, cmd: CommandType) {
    const that = this
    for (const [type, idList] of Object.entries<any>(changed)) {
      this.getTypeStorage(type as Type)
      for (const id of idList) {
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

  processModelUpdate(modelUpd: ModelUpdate) {
    this.processModelUpdateTriggers("before", modelUpd)

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

    this.processModelUpdateTriggers("after", modelUpd)
  }

  private async doExec(cmd: CommandType, type: Type, frag: object): Promise<any | undefined> {
    const dependencies = this.getExecDependencies(cmd, type, frag)
    const del = cmd === "delete"
    let processingKey: string | undefined
    let id: Identifier | undefined
    if (cmd === "delete" || cmd === "update") {
      id = toIdentifier(frag, type)
      processingKey = this.startProcessing(type, cmd, id)
    }
    try {
      const resultFrag = await this.httpSendAndUpdate(
        "POST",
        `${this.baseUrl}/api/model/exec`,
        { cmd, type, frag, dependencies },
        del ? "none" : "fragment"
      )
      if (!del)
        return this.getModel(type, toIdentifier(resultFrag, type))
    } finally {
      if (processingKey)
        this.endProcessing(type, cmd, id!, processingKey)
    }
  }

  private endProcessing(type: Type, cmd: CommandType, id: Identifier, processingKey: string) {
    const that = this
    this.processing.delete(processingKey)
    this.dash.emit(["endProcessing", `endProcessing${type}`], {
      type, cmd, id,
      get model() {
        return cmd === "delete" ? undefined : that.getModel(type, id)
      }
    } as UpdateModelEvent)
  }

  private startProcessing(type: Type, cmd: CommandType, id: Identifier): string {
    const processingKey = JSON.stringify([type, id])
    const that = this
    this.processing.add(processingKey)
    this.dash.emit(["processing", `processing${type}`], {
      type, cmd, id,
      get model() {
        return cmd === "delete" ? undefined : that.getModel(type, id)
      }
    } as UpdateModelEvent)
    return processingKey
  }

  private getExecDependencies(cmd: CommandType | "reorder", type: Type, data: object | OrderProperties): Dependencies[] | undefined {
    const depKey = JSON.stringify([cmd, type])
    const cbList = this.dependencies.get(depKey)
    if (!cbList)
      return
    const result: Dependencies[] = []
    for (const cb of cbList) {
      const dep = cb(data)
      if (dep)
        result.push(dep)
    }
    return result.length > 0 ? result : undefined
  }

  private findIdentifiersFromIndex({ type, index, key, indexCb }: IndexQuery): HKSet<Identifier> | undefined {
    index = cleanIndex(index, indexCb)
    const storage = this.getTypeStorage(type)
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
      // console.log("[storage.indexes] getModels B", toDebugStr(storage.indexes))
      // console.log("==> AFTER FILL", index, "ENTITIES:", type, toDebugStr(storage.entities), "INDEXES:", toDebugStr(storage.indexes), "INDEXMAP", toDebugStr(indexMap))
    }

    return indexData.map.get(key)
  }

  private getTypeStorage(type: Type): TypeStorage {
    const storage = this.store.get(type)
    if (!storage)
      throw new Error(`Unknown type: ${type}`)
    return storage
  }

  private updateStore(fragments: Fragments) {
    for (const [type, list] of Object.entries(fragments)) {
      const storage = this.getTypeStorage(type as Type)
      getFragmentMeta(type as Type)
      for (const frag of list) {
        const id = toIdentifier(frag, type as Type)
        const prevEntity = storage.entities.get(id)
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
    for (const [type, list] of Object.entries(partial)) {
      const storage = this.getTypeStorage(type as Type)
      // const fragMeta = getFragmentMeta(type as Type)
      for (const partialFrag of list!) {
        const id = toIdentifier(partialFrag, type as Type)
        const entity = storage.entities.get(id)
        if (entity && !entity.deleted)
          updateEntityFromPartial(storage, id, partialFrag, entity)
      }
    }
  }

  private deleteFromStore(deleted: Changed) {
    for (const [type, list] of Object.entries(deleted)) {
      if (!list)
        continue
      const storage = this.getTypeStorage(type as Type)
      for (const id of list) {
        const entity = storage.entities.get(id)
        if (entity) {
          storage.entities.delete(id)
          entity.deleted = true
          entity.model = undefined
        }
      }
      rmFragmentFromIndexes(storage, deleted[type])
    }
  }

  private execTriggers(triggerType: "before" | "after", cmd: CommandType, changed: Changed) {
    const map = this.triggers[triggerType]
    for (const [type, list] of Object.entries(changed)) {
      if (!list)
        continue
      const triggers = map.get(type as Type)
      if (triggers) {
        for (const trigger of triggers) {
          for (const id of list)
            trigger(cmd, id as string)
        }
      }
    }
  }

  private emitEventReordered(reordered: Changed) {
    const cmd = "reorder"
    for (const [type, orderedIds] of Object.entries<any>(reordered)) {
      this.getTypeStorage(type as Type)
      this.dash.emit(["change", `${cmd}`, `change${type}`, `${cmd}${type}`], {
        type,
        cmd,
        orderedIds
      } as ReorderModelEvent)
    }
  }

  private getFragment(ref: FragmentRef) {
    const storage = this.getTypeStorage(ref.type)
    const entity = storage.entities.get(ref.id)
    if (!entity)
      throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
    return entity.fragment
  }

  private getFragments(ref: FragmentsRef): any[] {
    const storage = this.getTypeStorage(ref.type)
    const list: any[] = []
    for (const id of ref.list) {
      const entity = storage.entities.get(id)
      if (!entity) {
        // console.log('=======>', Array.from(storage.entities.keys()))
        throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
      }
      list.push(entity.fragment)
    }
    return list
  }

  private async httpSendAndUpdate(method: HttpMethod, url, data, resultType?: "data" | "fragment" | "fragments" | "none"): Promise<any> {
    const cargo = await this.httpSendOrBatch(method, url, data)
    if (cargo.modelUpd)
      this.processModelUpdate(cargo.modelUpd)
    if (!cargo.done) {
      // eslint-disable-next-line no-console
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
            throw new Error("Missing fragment result for HTTP query")
          return this.getFragment(cargo.result.val)
        case "fragments":
          return cargo.result.val ? this.getFragments(cargo.result.val) : []
      }
    }
    if (resultType && resultType !== "none")
      throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
  }

  private processModelUpdateTriggers(triggerType: "before" | "after", modelUpd: ModelUpdate) {
    if (modelUpd.deleted)
      this.execTriggers(triggerType, "delete", modelUpd.deleted)
    if (modelUpd.updated)
      this.execTriggers(triggerType, "update", modelUpd.updated)
    if (modelUpd.created)
      this.execTriggers(triggerType, "create", modelUpd.created)
  }

  private httpSendOrBatch(method: HttpMethod, url, data): Promise<Cargo> {
    if (!this.batch)
      return httpSendJson(method, url, data)
    if (!this.batch.httpMethod || (this.batch.httpMethod === "GET" && method === "POST"))
      this.batch.httpMethod = method
    const batchIndex = this.batch.list.length
    this.batch.list.push(data)
    return this.batch.deferred.promise.then(result => {
      if (batchIndex === 0 && result.modelUpd) // process modelUpd once (is there a better place?)
        this.processModelUpdate(result.modelUpd)
      if (!result.responses || result.responses.length <= batchIndex)
        throw new Error("The batch command is canceled due to a previous command error")
      // console.log(`.............${batchIndex} // `, result)
      return result.responses[batchIndex]
    })
  }
}

// --
// -- Public tools
// --

export function appendGettersToModel(output: object, type: Type, getFrag: () => object) {
  const fragMeta = getFragmentMeta(type)
  for (const fieldName of Object.keys(fragMeta.fields)) {
    Object.defineProperty(output, fieldName, {
      get() { return getFrag()[fieldName] },
      configurable: false
    })
  }
}

export interface UpdateToolsOptions {
  processing?: boolean
  whoUse?: boolean
  toFragment?: boolean
  diffToUpdate?: boolean
}

export function appendUpdateToolsToModel(output: any, type: Type, getFrag: () => object, engine: ModelEngine, opt: UpdateToolsOptions) {
  output.updateTools = {}

  if (opt.processing) {
    Object.defineProperty(output.updateTools, "processing", {
      get() {
        return engine.isProcessing(toIdentifier(getFrag(), type), type)
      },
      configurable: false
    })
  }

  if (opt.whoUse) {
    output.updateTools.whoUse = () => engine.bgManager.add((async () => {
      const fetched = await httpSendJson("POST", `${this.baseUrl}/api/model/who-use`, {
        type,
        id: toIdentifier(getFrag(), type)
      })
      if (!fetched.done)
        throw new Error(`Error on server: ${fetched.error}`)
      return (fetched.result || null) as WhoUseItem[] | null
    })(), `who-use ${type}`).promise
  }

  if (opt.toFragment) {
    output.updateTools.toFragment = (variant: TypeVariant) => {
      const input = getFrag()
      const result: any = {}
      const meta = getFragmentMeta(type, variant)
      for (const fieldName of Object.keys(meta.fields))
        result[fieldName] = input[fieldName]
      return result
    }
  }

  if (opt.diffToUpdate) {
    output.updateTools.isModified = (updFrag: any) => {
      const orig = getFrag()
      const meta = getFragmentMeta(type, "update")
      for (const fieldName of Object.keys(meta.fields)) {
        if (updFrag[fieldName] !== undefined && updFrag[fieldName] !== orig[fieldName])
          return true
      }
      return false
    }
    output.updateTools.getDiffToUpdate = (updFrag: any) => {
      const orig = getFrag()
      const diff: any = {}
      const meta = getFragmentMeta(type, "update")
      for (const fieldName of Object.keys(meta.fields)) {
        if (updFrag[fieldName] !== undefined && updFrag[fieldName] !== orig[fieldName])
          diff[fieldName] = updFrag[fieldName]
      }
      return diff
    }
  }
}

// --
// -- Private tools
// --

function indexToFieldNames(index: Index, indexCallbacks?: IndexCallbacks) {
  const names = typeof index === "string" ? [index] : index
  return indexCallbacks ? names.filter(name => !indexCallbacks[name]) : names
}

function checkColumnsAreInMeta(type: Type, fieldNames: string[]) {
  const fragMeta = getFragmentMeta(type)
  for (const name of fieldNames) {
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
  // console.log("  ** fillIndex A", index, toDebugStr(indexData.map)) // , toDebugStr(storage.entities)
  for (const [id, entity] of storage.entities)
    tryToAddToIndex(index, indexData, id, entity.fragment)
  // console.log("  ** fillIndex B", index, toDebugStr(indexData.map)) // , toDebugStr(storage.entities)
}

function addFragmentToIndexes(storage: TypeStorage, id: Identifier, frag: object, removeOld = false) {
  if (removeOld)
    rmFragmentFromIndexes(storage, [id])
  for (const [index, indexData] of storage.indexes)
    tryToAddToIndex(index, indexData, id, frag)
}

function tryToAddToIndex(index: Index, indexData: IndexData, id: Identifier, frag: object) {
  if (indexData.indexCb && !canBeAddedToIndex(frag, indexData.indexCb))
    return
  const fieldNames = indexToFieldNames(index, indexData.indexCb)
  const key = {}
  // console.log("  && tryToAddToIndex a", fieldNames, index, id, frag)
  for (const name of fieldNames)
    key[name] = frag[name]
  let identifiers = indexData.map.get(key)
  if (!identifiers)
    indexData.map.set(key, identifiers = makeHKSet<any>())
  identifiers.add(id)
  // console.log("  && tryToAddToIndex b", index, key, toDebugStr(indexData.map), toDebugStr(identifiers), "ID=", id)
}

function canBeAddedToIndex(frag: object, indexCb: IndexCallbacks) {
  for (const name of Object.keys(indexCb)) {
    if (indexCb.hasOwnProperty(name) && !indexCb[name](frag))
      return false
  }
  return true
}

function rmFragmentFromIndexes(storage: TypeStorage, idList: Identifier[]) {
  for (const [, indexMap] of storage.indexes) {
    for (const identifiers of indexMap.map.values()) {
      for (const id of idList)
        identifiers.delete(id)
    }
  }
}

function updateEntityFromPartial(storage: TypeStorage, id: Identifier, partialFrag: object, entity: Entity) {
  for (const fieldName of Object.keys(partialFrag)) {
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
    const diff = a[fieldName] - b[fieldName]
    return direction === "asc" ? diff : -diff
  }
}

// function isFragmentRef(ref: FragmentRef | FragmentsRef): ref is FragmentRef {
//   return !ref["list"]
// }

export async function httpSendJson(method: HttpMethod, url: string, data: unknown): Promise<any> {
  // console.log(`>> ${method}`, url, data)
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: data ? JSON.stringify(data) : undefined
  })
  // try {
  const respData = await response.json()
  // console.log("  ... FETCHED:", respData)
  return respData
  // } catch (err) {
  //   console.log("Parsing failed", err)
  //   throw err
  // }
}

export function toCollection<M extends object, ID extends Identifier>(models: M[], type: Type): Collection<M, ID> {
  let map: HKMap<ID, M>
  const alias: any = models
  alias.get = id => {
    if (!map) {
      map = makeHKMap<ID, M>()
      for (const model of models)
        map.set(toIdentifier(model, type) as ID, model)
    }
    return map.get(id)
  }
  alias.has = id => alias.get(id) !== undefined
  return alias
}
