import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { validateDataArray } from "../../isomorphic/validation"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment, ProjectQuery, projectMeta } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment, stepMeta } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment, taskMeta } from "../../isomorphic/fragments/Task"
import { getFragmentMeta } from "../../isomorphic/meta"
import { ProjectModel, TaskModel, StepModel, StepTypeModel } from "./FragmentsModel"
import { Cargo, Type, FragmentRef, FragmentsRef, Fragments, Identifier } from "../../isomorphic/Cargo"
import { makeJkMap, makeJkSet } from "../libraries/JsonKeyCollections"

const store = makeJkMap<Type, TypeStorage>()

// --
// -- Project
// --

registerType("Project", function (frag: ProjectFragment): ProjectModel {
  let model = {
    get rootTask() {
      return getModel("Task", frag.rootTaskId)
    },
    get steps() {
      return getModels({
        type: "Step",
        index: "projectId",
        key: {
          projectId: frag.id
        },
        orderBy: ["orderNum", "asc"]
      })
    },
    get tasks() {
      return getModels({
        type: "Task",
        index: ["projectId", "parentTaskId"],
        key: {
          projectId: frag.id,
          parentTaskId: frag.rootTaskId
        },
        orderBy: ["orderNum", "asc"]
      })
    }
  }
  appendGettersToModel(model, "Project", frag)
  return model as any
})

// --
// -- Task
// --

registerType("Task", function (frag: TaskFragment): TaskModel {
  let model = {
    get project() {
      return getModel("Project", frag.projectId)
    },
    get currentStep() {
      return getModel("Step", frag.curStepId)
    },
    get parent() {
      if (frag.parentTaskId === undefined)
        return undefined
      return getModel("Task", frag.parentTaskId)
    },
    get children() {
      return getModels({
        type: "Task",
        index: "parentTaskId",
        key: {
          parentTaskId: frag.id
        },
        orderBy: ["orderNum", "asc"]
      })
    }
  }
  appendGettersToModel(model, "Task", frag)
  return model as any
})

// --
// -- Step
// --

registerType("Step", function (frag: StepFragment): StepModel {
  let model = {
    get project() {
      return getModel("Project", frag.projectId)
    },
    get tasks() {
      return getModels({
        type: "Task",
        index: "curStepId",
        key: {
          curStepId: frag.id
        },
        orderBy: ["orderNum", "asc"]
      })
    }
  }
  appendGettersToModel(model, "Step", frag)
  return model as any
})

// --
// -- StepType
// --

registerType("StepType", function (frag: StepTypeFragment): StepTypeModel {
  let model = {
    get tasks() {
      return getModels({
        type: "Step",
        index: "stepTypeId",
        key: {
          stepTypeId: frag.id
        },
        orderBy: ["projectId", "asc"] // TODO: implement a function here => sort on project name
      })
    }
  }
  appendGettersToModel(model, "StepType", frag)
  return model as any
})

// --
// -- Execute an API command
// --

type CommandType = "create" | "update" | "delete"

export async function exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
export async function exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>

export async function exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
export async function exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
//export async function exec(cmd: "delete", type: "Task", taskId: string): Promise<void>

export async function exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
export async function exec(cmd: "delete", type: "Step", stepId: string): Promise<void>

export async function exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
export async function exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

export async function exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> { // FIXME
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

export async function query(type: "Project", filters: ProjectQuery): Promise<ProjectModel[]>
export async function query(type: "StepType"): Promise<StepTypeModel[]>

export async function query(type: Type, filters?: any): Promise<any[]> {
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
type IndexMap = Map<IndexKey, Set<Identifier>>

interface TypeStorage {
  /**
   * Keys are `Identifier` as string
   */
  entities: Map<Identifier, Entity>
  /**
   * Keys are `Index` as string
   */
  indexes: Map<Index, IndexMap>
  modelMaker: (frag) => any
}

function registerType(type: Type, modelMaker: (frag) => any) {
  store.set(type, {
    entities: makeJkMap<any, any>(),
    indexes: makeJkMap<any, any>(),
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

function getModels({type, index, key, orderBy}: ModelsQuery): any[] {
  index = cleanIndex(index)
  let storage = getTypeStorage(type)
  let indexMap = storage.indexes.get(index)
  //console.log("getModels A", index, storage, indexMap)
  if (!indexMap) {
    storage.indexes.set(index, indexMap = makeJkMap<any, any>())
    fillIndex(storage, index, indexMap)
  }

  let identifiers = indexMap.get(key)

  if (!identifiers)
    return []

  let list: any[] = []
  for (let id of Array.from(identifiers))
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
  //console.log("fillIndex A", index, storage, indexMap)
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
  for (let name of fieldNames)
    key[name] = frag[name]
  let identifiers = indexMap.get(key)
  if (!identifiers)
    indexMap.set(key, identifiers = makeJkSet<any>())
  identifiers.add(id)
  // console.log("tryToAddToIndex A", key, identifiers, id, frag)
}

function getModel(type: Type, id: Identifier): any {
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

function appendGettersToModel(model, type: Type, frag) {
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
    let storage = store.get(type as Type)
    if (!storage)
      throw new Error(`Unknown fragment type: ${type}`)
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
  let storage = store.get(ref.type)
  if (!storage)
    throw new Error(`Unknown type: ${ref.type}`)
  let entity = storage.entities.get(ref.id)
  if (!entity)
    throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
  return entity.fragment
}

function getFragments(ref: FragmentsRef): any[] {
  let storage = store.get(ref.type)
  if (!storage)
    throw new Error(`Unknown type: ${ref.type}`)
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
  if (cargo.fragments)
    updateStore(cargo.fragments)
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
