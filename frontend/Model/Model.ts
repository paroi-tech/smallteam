import { FragmentMeta } from "../../isomorphic/FragmentMeta"
import { validateDataArray } from "../../isomorphic/validation"
import { ProjectFragment, NewProjectFragment } from "../../isomorphic/fragments/Project"
import { meta } from "../../isomorphic/meta"
import { ProjectModel, TaskModel } from "./FragmentsModel"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { Cargo, FragmentRef, FragmentsRef, Fragments, Identifier } from "../../isomorphic/Cargo"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

export async function queryProjects(filters: AsFilter<ProjectFragment>): Promise<ProjectModel[]> {
  let projects: ProjectFragment[] = await httpPostAndUpdate("/api/query", {
    type: "Project",
    filters
  }, "fragments")
  let list: ProjectModel[] = []
  for (let p of projects)
    list.push(getProjectModel(p))
  return list
}

export async function createProject(values: NewProjectFragment): Promise<ProjectModel> {
  let project: ProjectFragment = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Project",
    values
  }, "fragment")
  return getProjectModel(project)
}

function getProjectModel(data: ProjectFragment): ProjectModel {
  let model = {
    get rootTask() {
      return getTaskModel(data.rootTaskId)
    }
  }
  addModelGetters(model, meta.Project, data)
  return model as any
}

function getTaskModel(taskId: string): TaskModel {
  let data = getFragment({
    id: taskId,
    type: "Task"
  })
  let model = {}
  addModelGetters(model, meta.Task, data)
  return model as any
}

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

// interface ProjectFragment {
//   id: string
//   code: string
//   archived: boolean
//   rootTaskId: string
// }
//
// interface ProjectModel extends ProjectFragment {
//   readonly rootTask: TaskModel
//   readonly steps: StepModel[]
// }

// export default class Model {
//   get()
// }

const store = {
  Project: new Map<Identifier, ProjectFragment>(),
  Task: new Map<Identifier, TaskFragment>()
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

function getFragments(ref: FragmentsRef) {
  if (!store[ref.type])
    throw new Error(`Unknown type: ${ref.type}`)
  let map = store[ref.type],
    list: (ProjectFragment | TaskFragment)[] = []
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
        return getFragment(cargo.result.val)
      case "fragments":
        return getFragments(cargo.result.val)
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
