import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { getFragmentMeta } from "../../isomorphic/meta"
import { Cargo, Type, FragmentRef, FragmentsRef, Fragments, Deleted, Identifier } from "../../isomorphic/Cargo"
import { makeHKMap, makeHKSet, HKMap, HKSet } from "../../isomorphic/libraries/HKCollections"
//import { validateDataArray } from "../../isomorphic/validation"

const store = makeHKMap<Type, TypeStorage>()

// --
// -- Execute an API command
// --

export type CommandType = "create" | "update" | "delete"

export async function apiExec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> { // FIXME
  let del = cmd === "delete"
  let resultFrag = await httpPostAndUpdate("/api/exec", {
    cmd,
    type,
    [del ? "id" : "frag"]: fragOrId
  }, del ? "none" : "fragment")
  if (!del)
    return getModel(type, toIdentifier(resultFrag, getFragmentMeta(type)))
}

// --
// -- Query the API
// --

export async function apiQuery(type: Type, filters?: any): Promise<any[]> {
  let data: any = { type }
  if (filters)
    data.filters = filters
  let fragments: any[] = await httpPostAndUpdate("/api/query", data, "fragments"),
    fragMeta = getFragmentMeta(type)
  return fragments.map(frag => getModel(type, toIdentifier(frag, fragMeta)))
}

// --
// -- The common fragment store
// --

interface Entity {
  fragment: any
  model?: any
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

interface TypeStorage {
  /**
   * Keys are `Identifier` as string
   */
  entities: HKMap<Identifier, Entity>
  /**
   * Keys are `Index` as string
   */
  indexes: HKMap<Index, IndexMap>
  modelMaker: (frag) => any
}

export function registerType(type: Type, modelMaker: (frag) => any) {
  store.set(type, {
    entities: makeHKMap<any, any>(),
    indexes: makeHKMap<any, any>(),
    modelMaker
  })
}

// --
// -- Model tools
// --

function getTypeStorage(type: Type): TypeStorage {
  let storage = store.get(type)
  if (!storage)
    throw new Error(`Unknown type: ${type}`)
  return storage
}

interface ModelsQuery {
  type: Type
  index: Index
  key: IndexKey
  orderBy: [string, "asc" | "desc"] | ((a, b) => number)
}

// function keyStr(key: {}): string {
//   return JSON.stringify(key)
// }

export function getModels({type, index, key, orderBy}: ModelsQuery): any[] {
  index = cleanIndex(index)
  let storage = getTypeStorage(type)
  let indexMap = storage.indexes.get(index)
  //console.log("getModels A", index, storage, indexMap)
  if (!indexMap) {
    storage.indexes.set(index, indexMap = makeHKMap<any, any>())
//console.log("[storage.indexes] getModels A", toDebugStr(storage.indexes))
    fillIndex(storage, index, indexMap)
//console.log("[storage.indexes] getModels B", toDebugStr(storage.indexes))
// console.log("==> AFTER FILL", index, "ENTITIES:", type, toDebugStr(storage.entities), "INDEXES:", toDebugStr(storage.indexes), "INDEXMAP", toDebugStr(indexMap))
  }

  let identifiers = indexMap.get(key)

// console.log("==>", toDebugStr(indexMap), toDebugStr(identifiers), key)

// let yesy = makeHkMap<any, any>()
// yesy.set({"a": 123, "b": 123}, "boum")
// yesy.set({"a": undefined, "b": 123}, "boum")
// let za = yesy.get({"b": 123, "a": 123})
// console.log("+++==>", toDebugStr(yesy), "resp", za, JSON.stringify({"b": 123, "a": 123}), JSON.stringify({"a": 123, "b": 123}))

// for (let [key, val] of yesy) {
//   console.log("  ...", key, val)
// }

  if (!identifiers)
    return []

  let list: any[] = []
  for (let id of identifiers)
    list.push(getModel(type, id))

  let sortFn = Array.isArray(orderBy) ? makeDefaultSortFn(orderBy) : orderBy;
  list.sort(sortFn)
  return list
}

function cleanIndex(index: Index): Index {
  if (Array.isArray(index)) {
    if (index.length === 1)
      index = index[0]
    else
      index.sort()
  }
  return index
}

function fillIndex(storage: TypeStorage, index: Index, indexMap: IndexMap) {
  // console.log("fillIndex A", index, storage, toDebugStr(indexMap), toDebugStr(storage.entities))
  for (let [id, entity] of storage.entities)
    tryToAddToIndex(index, indexMap, id, entity.fragment)
}

function addFragmentToIndexes(storage: TypeStorage, id: Identifier, frag) {
  for (let [index, indexMap] of storage.indexes)
    tryToAddToIndex(index, indexMap, id, frag)
}

function tryToAddToIndex(index: Index, indexMap: IndexMap, id: Identifier, frag: any) {
  let fieldNames = typeof index === "string" ? [index] : index,
    key = {}
//console.log("tryToAddToIndex", fieldNames, index)
  for (let name of fieldNames)
    key[name] = frag[name]
  let identifiers = indexMap.get(key)
  if (!identifiers)
    indexMap.set(key, identifiers = makeHKSet<any>())
  identifiers.add(id)
  // console.log("tryToAddToIndex A", index, key, toDebugStr(indexMap), toDebugStr(identifiers), "ID=", id)
}

export function getModel(type: Type, id: Identifier): any {
  let storage = getTypeStorage(type),
    entity = storage.entities.get(id)
  if (!entity)
    throw new Error(`Unknown ID "${id}" in type: ${type}`)
  if (!entity.model)
    entity.model = storage.modelMaker(entity.fragment)
  return entity.model
}

function makeDefaultSortFn([fieldName, direction]: [string, "asc" | "desc"]) {
  // TODO: check that the fieldName is in meta
  return function (a, b) {
    let diff = a[fieldName] - b[fieldName]
    return direction === "asc" ? diff : -diff
  }
}

export function appendGettersToModel(model, type: Type, frag) {
  let fragMeta = getFragmentMeta(type)
  for (let fieldName in fragMeta.fields) {
    if (!fragMeta.fields.hasOwnProperty(fieldName))
      continue
    Object.defineProperty(model, fieldName, {
      get: function () { return frag[fieldName] },
      configurable: false
    })
  }
}

function updateStore(fragments: Fragments) {
  for (let type in fragments) {
    if (!fragments.hasOwnProperty(type))
      continue
    let storage = getTypeStorage(type as Type)
    let fragMeta = getFragmentMeta(type as Type)
    for (let frag of fragments[type]) {
      let id = toIdentifier(frag, fragMeta)
      storage.entities.set(id, {
        fragment: frag
      })
      addFragmentToIndexes(storage, id, frag)
    }
  }
}

function deleteFromStore(deleted: Deleted) {
  for (let type in deleted) {
    if (!deleted.hasOwnProperty(type))
      continue
    let storage = getTypeStorage(type as Type)
    for (let id of deleted[type])
      storage.entities.delete(id)
    rmFragmentFromIndexes(storage, deleted[type])
  }
}

function rmFragmentFromIndexes(storage: TypeStorage, idList: Identifier[]) {
  for (let [index, indexMap] of storage.indexes) {
    for (let identifiers of indexMap.values()) {
      for (let id of idList)
        identifiers.delete(id)
    }
  }
}

function toIdentifier(frag: any, fragMeta: FragmentMeta): Identifier {
  let singleVal: string | undefined,
    values: { [fieldName: string]: string } | undefined
  for (let fieldName in fragMeta.fields) {
    if (fragMeta.fields.hasOwnProperty(fieldName) && fragMeta.fields[fieldName].id) {
      if (frag[fieldName] === undefined)
        throw new Error(`[${fragMeta.type}] Missing value for field: ${fieldName}`)
      if (values)
        singleVal = undefined
      else {
        singleVal = frag[fieldName]
        values = {}
      }
      values[fieldName] = frag[fieldName]
    }
  }
  if (!values)
    throw new Error(`[${fragMeta.type}] No identifier`)
  return singleVal !== undefined ? singleVal : values
}

function getFragment(ref: FragmentRef) {
  let storage = getTypeStorage(ref.type)
  let entity = storage.entities.get(ref.id)
  if (!entity)
    throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
  return entity.fragment
}

function getFragments(ref: FragmentsRef): any[] {
  let storage = getTypeStorage(ref.type)
  let list: any[] = []
  for (let id of ref.list) {
    let entity = storage.entities.get(id)
    if (!entity)
      throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
    list.push(entity.fragment)
  }
  return list
}

async function httpPostAndUpdate(url, data, resultType?: "data" | "fragment" | "fragments" | "none"): Promise<any> {
  let cargo: Cargo = await httpPostJson(url, data)
  if (cargo.modelUpd) {
    if (cargo.modelUpd.fragments)
      updateStore(cargo.modelUpd.fragments)
    if (cargo.modelUpd.deleted)
      deleteFromStore(cargo.modelUpd.deleted)
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
        return getFragment(cargo.result.val)
      case "fragments":
        return cargo.result.val ? getFragments(cargo.result.val) : []
    }
  }
  if (resultType && resultType !== "none")
    throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
}

function isFragmentRef(ref: FragmentRef | FragmentsRef): ref is FragmentRef {
  return !ref['list']
}

async function httpPostJson(url, data): Promise<any> {
  console.log(">> POST", url, data)
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
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
