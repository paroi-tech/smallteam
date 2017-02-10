import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { validateDataArray } from "../../isomorphic/validation"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment, ProjectQuery } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment } from "../../isomorphic/fragments/Task"
import meta from "../../isomorphic/meta"
import { ProjectModel, TaskModel, StepModel, StepTypeModel } from "./FragmentsModel"
import { Cargo, Type, FragmentRef, FragmentsRef, Fragments, Identifier } from "../../isomorphic/Cargo"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

interface Entity {
  fragment: any
  model?: any
}

interface IndexKey {
  index: string,
  key: any
}

interface TypeStorage {
  entities: Map<Identifier, Entity>
  indexes: Map<IndexKey, Set<Identifier>>
  modelMaker: (frag) => any
}

const store = new Map<Type, TypeStorage>()

// --
// -- Project
// --

export async function queryProjects(filters: AsFilter<ProjectQuery>): Promise<ProjectModel[]> {
  let projects: ProjectFragment[] = await httpPostAndUpdate("/api/query", {
    type: "Project",
    filters
  }, "fragments")
  let list: ProjectModel[] = []
  for (let p of projects)
    list.push(getModel("Project", p.id))
  return list
}

export async function createProject(values: NewProjectFragment): Promise<ProjectModel> {
  let project: ProjectFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Project",
    values
  }, "fragment")
  return getModel("Project", project.id)
}

export async function updateProject(values: UpdProjectFragment): Promise<ProjectModel> {
  let project: ProjectFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Project",
    values
  }, "fragment")
  return getModel("Project", project.id)
}

registerType("Project", function (frag: ProjectFragment): ProjectModel {
  let model = {
    get rootTask() {
      return getModel("Task", frag.rootTaskId)
    },
    get steps() {
      return getModels({
        type: "Step",
        index: "projectId",
        key: frag.id,
        orderBy: ["orderNum", "asc"]
      })
    }
  }
  addModelGetters(model, meta.Project, frag)
  return model as any
})

// --
// -- Task
// --

export async function createTask(values: NewTaskFragment): Promise<TaskModel> {
  let frag: TaskFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Task",
    values
  }, "fragment")
  return getModel("Task", frag.id)
}

export async function updateTask(values: UpdTaskFragment): Promise<TaskModel> {
  let frag: TaskFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Task",
    values
  }, "fragment")
  return getModel("Task", frag.id)
}

registerType("Task", function (frag: TaskFragment): TaskModel {
  let model = {
    get currentStep() {
      return getModel("Step", frag.curStepId)
    }
  }
  addModelGetters(model, meta.Task, frag)
  return model as any
})

// --
// -- Step
// --

export async function createStep(values: NewStepFragment): Promise<StepModel> {
  let frag: StepFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Step",
    values
  }, "fragment")
  return getModel("Step", frag.id)
}

export async function deleteStep(stepId: string): Promise<void> {
  let frag: StepFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Step",
    id: stepId
  }, "fragment")
}

registerType("Step", function (frag: StepFragment): StepModel {
  let model = {
    get project() {
      return getModel("Project", frag.projectId)
    }
  }
  addModelGetters(model, meta.Step, frag)
  return model as any
})

// --
// -- StepType
// --

export async function queryStepTypes(): Promise<StepTypeModel[]> {
  let fragments: StepTypeFragment[] = await httpPostAndUpdate("/api/query", {
    type: "StepType"
  }, "fragments")
  let list: StepTypeModel[] = []
  for (let item of fragments)
    list.push(getModel("StepType", item.id))
  return list
}

export async function createStepType(values: NewStepTypeFragment): Promise<StepTypeModel> {
  let frag: StepTypeFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "StepType",
    values
  }, "fragment")
  return getModel("StepType", frag.id)
}

export async function updateStepType(values: UpdStepTypeFragment): Promise<StepTypeModel> {
  let frag: StepTypeFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "StepType",
    values
  }, "fragment")
  return getModel("StepType", frag.id)
}

registerType("StepType", function (frag: StepTypeFragment): StepTypeModel {
  let model = {}
  addModelGetters(model, meta.StepType, frag)
  return model as any
})

// --
// -- The common fragment store
// --

function registerType(type: Type, modelMaker: (frag) => any) {
  store.set(type, {
    entities: new Map(),
    indexes: new Map(),
    modelMaker
  })
}

// const store = {
//   Project: new Map<Identifier, Entity>(),
//   Task: new Map<Identifier, Entity>(),
//   Step: new Map<Identifier, Entity>(),
//   StepType: new Map<Identifier, Entity>(),
// }
//const indexes = new Map<IndexKey, Set<Identifier>>()

// --
// -- Model tools
// --

function getTypeStorage(type: Type): TypeStorage {
  let storage = store.get(type)
  if (!storage)
    throw new Error(`Unknown type: ${type}`)
  return storage
}

interface ModelsQuery extends IndexKey {
  type: Type
  orderBy: [string, "asc" | "desc"] | ((a, b) => number)
}

function getModels({type, index, key, orderBy}: ModelsQuery): any[] {
  let storage = getTypeStorage(type)

  let identifiers = storage.indexes.get({index, key})
  if (!identifiers)
    return []

  let list: any[] = []
  for (let id of Array.from(identifiers))
    list.push(getModel(type, id))

  let sortFn = Array.isArray(orderBy) ? makeDefaultSortFn(orderBy) : orderBy;
  list.sort(sortFn)
  return list
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

function addItemToIndex(type: Type, indexKey: IndexKey, itemId: Identifier) {
  let indexes = getTypeStorage(type).indexes
  let identifiers = indexes.get(indexKey)
  if (!identifiers)
    indexes.set(indexKey, identifiers = new Set())
  identifiers.add(itemId)
}

function addModelGetters(model, fragMeta: FragmentMeta, frag) {
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
    for (let data of fragments[type]) {
      let id = toIdentifier(data, meta[type])
      storage.entities.set(id, {
        fragment: data
      })
    }
  }
}

function toIdentifier(data: any, FragmentMeta: FragmentMeta): Identifier {
  let singleVal: string | undefined,
    values: { [fieldName: string]: string } | undefined
  for (let fieldName in FragmentMeta.fields) {
    if (FragmentMeta.fields.hasOwnProperty(fieldName) && FragmentMeta.fields[fieldName].id) {
      if (data[fieldName] === undefined)
        throw new Error(`[${FragmentMeta.type}] Missing value for field: ${fieldName}`)
      if (values)
        singleVal = undefined
      else {
        singleVal = data[fieldName]
        values = {}
      }
      values[fieldName] = data[fieldName]
    }
  }
  if (!values)
    throw new Error(`[${FragmentMeta.type}] No identifier`)
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
