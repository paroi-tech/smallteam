import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { validateDataArray } from "../../isomorphic/validation"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment } from "../../isomorphic/fragments/Task"
import meta from "../../isomorphic/meta"
import { ProjectModel, TaskModel, StepModel, StepTypeModel } from "./FragmentsModel"
import { Cargo, FragmentRef, FragmentsRef, Fragments, Identifier } from "../../isomorphic/Cargo"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

// --
// -- Project
// --

export async function queryProjects(filters: AsFilter<ProjectFragment>): Promise<ProjectModel[]> {
  let projects: ProjectFragment[] = await httpPostAndUpdate("/api/query", {
    type: "Project",
    filters
  }, "fragments")
  let list: ProjectModel[] = []
  for (let p of projects)
    list.push(toProjectModel(p))
  return list
}

export async function createProject(values: NewProjectFragment): Promise<ProjectModel> {
  let project: ProjectFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Project",
    values
  }, "fragment")
  return toProjectModel(project)
}

export async function updateProject(values: UpdProjectFragment): Promise<ProjectModel> {
  let project: ProjectFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Project",
    values
  }, "fragment")
  return toProjectModel(project)
}

function toProjectModel(data: ProjectFragment): ProjectModel {
  let model = {
    get rootTask() {
      return getTaskModel(data.rootTaskId)
    }
  }
  addModelGetters(model, meta.Project, data)
  return model as any
}

function getProjectModel(projectId: string): ProjectModel {
  let data: ProjectFragment = getFragment({
    id: projectId,
    type: "Project"
  })
  return toProjectModel(data)
}

// --
// -- Task
// --

export async function createTask(values: NewTaskFragment): Promise<TaskModel> {
  let frag: TaskFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Task",
    values
  }, "fragment")
  return getTaskModel(frag.id)
}

export async function updateTask(values: UpdTaskFragment): Promise<TaskModel> {
  let frag: TaskFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Task",
    values
  }, "fragment")
  return getTaskModel(frag.id)
}

function getTaskModel(taskId: string): TaskModel {
  let data: TaskFragment = getFragment({
    id: taskId,
    type: "Task"
  })
  let model = {
    get currentStep() {
      return getStepModel(data.curStepId)
    }
  }
  addModelGetters(model, meta.Task, data)
  return model as any
}

// --
// -- Step
// --

export async function createStep(values: NewStepFragment): Promise<StepModel> {
  let frag: StepFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Step",
    values
  }, "fragment")
  return getStepModel(frag.id)
}

export async function deleteStep(stepId: string): Promise<void> {
  let frag: StepFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "Step",
    id: stepId
  }, "fragment")
}

function getStepModel(stepId: string): StepModel {
  let data: StepFragment = getFragment({
    id: stepId,
    type: "Step"
  })
  let model = {
    get project() {
      return getProjectModel(data.projectId)
    }
  }
  addModelGetters(model, meta.Step, data)
  return model as any
}

// --
// -- StepType
// --

export async function queryStepTypes(): Promise<StepTypeModel[]> {
  let fragments: StepTypeFragment[] = await httpPostAndUpdate("/api/query", {
    type: "StepType"
  }, "fragments")
  let list: StepTypeModel[] = []
  for (let item of fragments)
    list.push(getStepTypeModel(item.id))
  return list
}

export async function createStepType(values: NewStepTypeFragment): Promise<StepTypeModel> {
  let frag: StepTypeFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "StepType",
    values
  }, "fragment")
  return getStepTypeModel(frag.id)
}

export async function updateStepType(values: UpdStepTypeFragment): Promise<StepTypeModel> {
  let frag: StepTypeFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "update",
    type: "StepType",
    values
  }, "fragment")
  return getStepTypeModel(frag.id)
}

function getStepTypeModel(stepTypeId: string): StepTypeModel {
  let data: StepTypeFragment = getFragment({
    id: stepTypeId,
    type: "StepType"
  })
  let model = {}
  addModelGetters(model, meta.StepType, data)
  return model as any
}

// --
// -- The common fragment store
// --

const store = {
  Project: new Map<Identifier, ProjectFragment>(),
  Task: new Map<Identifier, TaskFragment>(),
  Step: new Map<Identifier, StepFragment>(),
  StepType: new Map<Identifier, StepTypeFragment>(),
}

// --
// -- Model tools
// --

function addModelGetters(model, FragmentMeta: FragmentMeta, data) {
  for (let fieldName in FragmentMeta.fields) {
    if (!FragmentMeta.fields.hasOwnProperty(fieldName))
      continue
    Object.defineProperty(model, fieldName, {
      get: function () { return data[fieldName] },
      configurable: false
    })
  }
}

function updateStore(fragments: Fragments) {
  for (let type in fragments) {
    if (!fragments.hasOwnProperty(type))
      continue
    if (!store[type])
      throw new Error(`Unknown type: ${type}`)
    for (let data of fragments[type]) {
      let id = toIdentifier(data, meta[type])
      store[type].set(id, data)
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
  if (!store[ref.type])
    throw new Error(`Unknown type: ${ref.type}`)
  let data = store[ref.type].get(ref.id)
  if (!data)
    throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
  return data
}

function getFragments(ref: FragmentsRef): any[] {
  if (!store[ref.type])
    throw new Error(`Unknown type: ${ref.type}`)
  let map = store[ref.type],
    list: any[] = []
  for (let id of ref.list) {
    let data = map.get(id)
    if (!data)
      throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
    list.push(data)
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
