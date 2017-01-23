import { EntityMeta, validateDataArray } from "../../isomorphic/validation"
import { ProjectFields, ProjectModel, meta, NewProjectFields } from "../../isomorphic/entities/project"
import { TaskFields, TaskModel } from "../../isomorphic/entities/task"
import { Cargo, EntityRef, EntitiesRef, Entities, Identifier } from "../../isomorphic/Cargo"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

export async function queryProjects(filters: AsFilter<ProjectFields>): Promise<ProjectModel[]> {
  let projects: ProjectFields[] = await httpPostAndUpdate("/api/exec", {
    type: "Project",
    filters
  }, "list")
  let list = []
  for (let p of projects)
    list.push(getProjectModel(p))
  return list
}

export async function createProject(values: NewProjectFields): Promise<ProjectModel> {
  let project: ProjectFields = await httpPostAndUpdate("/api/exec", {
    cmd: "create",
    type: "Project",
    values
  }, "entity")
  return getProjectModel(project)
}

function getProjectModel(data: ProjectFields): ProjectModel {
  let model = {
    get rootTask() {
      return getTaskModel(data.rootTaskId)
    }
  }
  addModelGetters(model, meta.Project, data)
  return model as any
}

function getTaskModel(taskId: string): TaskModel {
  let data = getEntity({
    id: taskId,
    type: "Task"
  })
  let model = {}
  addModelGetters(model, meta.Task, data)
  return model as any
}

function addModelGetters(model, entityMeta: EntityMeta, data) {
  for (let fieldName in entityMeta.fields) {
    if (!entityMeta.fields.hasOwnProperty(fieldName))
      continue
    Object.defineProperty(model, fieldName, {
      get: function () { return data[fieldName] },
      configurable: false,
      writable: false
    })
  }
}

// interface ProjectFields {
//   id: string
//   code: string
//   archived: boolean
//   rootTaskId: string
// }
//
// interface ProjectModel extends ProjectFields {
//   readonly rootTask: TaskModel
//   readonly steps: StepModel[]
// }

// export default class Model {
//   get()
// }

const store = {
  Project: new Map<Identifier, ProjectFields>(),
  Task: new Map<Identifier, TaskFields>()
}

function updateStore(entities: Entities) {
  for (let type in entities) {
    if (!entities.hasOwnProperty(type))
      continue
    if (!store[type])
      throw new Error(`Unknown type: ${type}`)
    for (let data of entities[type]) {
      let id = toIdentifier(data, meta[type])
      store[type].set(id, data)
    }
  }
}

function toIdentifier(data: any, entityMeta: EntityMeta): Identifier {
  let singleVal: string,
    values: { [fieldName: string]: string }
  for (let fieldName in entityMeta.fields) {
    if (entityMeta.fields.hasOwnProperty(fieldName) && entityMeta.fields[fieldName].id) {
      if (data[fieldName] === undefined)
        throw new Error(`[${entityMeta.type}] Missing value for field: ${fieldName}`)
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
    throw new Error(`[${entityMeta.type}] No identifier`)
  return singleVal !== undefined ? singleVal : values
}

function getEntity(ref: EntityRef) {
  if (!store[ref.type])
    throw new Error(`Unknown type: ${ref.type}`)
  let data = store[ref.type].get(ref.id)
  if (!data)
    throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(ref.id)}`)
  return data
}

function getEntities(ref: EntitiesRef) {
  if (!store[ref.type])
    throw new Error(`Unknown type: ${ref.type}`)
  let map = store[ref.type],
    list = []
  for (let id of ref.list) {
    let data = map.get(id)
    if (!data)
      throw new Error(`[${ref.type}] Missing data for: ${JSON.stringify(id)}`)
    list.push(data)
  }
  return list
}

async function httpPostAndUpdate(url, data, resultType?: "result" | "entity" | "list" | "none"): Promise<any> {
  let cargo: Cargo = await httpPostJson(url, data)
  if (cargo.entities)
    updateStore(cargo.entities)
  if (!cargo.done) {
    console.log("Error on server", cargo.error, cargo.errorData)
    throw new Error("Error on server: " + cargo.error)
  }
  if (cargo.result) {
    if (resultType && resultType !== "result")
      throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
    return cargo.result
  }
  if (cargo.ref) {
    if (isEntityRef(cargo.ref)) {
      if (resultType && resultType !== "entity")
        throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
      return getEntity(cargo.ref)
    } else {
      if (resultType && resultType !== "list")
        throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
      return getEntities(cargo.ref)
    }
  }
  if (resultType && resultType !== "none")
    throw new Error(`Result type "${resultType}" doesn't match with cargo: ${JSON.stringify(cargo)}`)
}

function isEntityRef(ref: EntityRef | EntitiesRef): ref is EntityRef {
  return !ref['list']
}

async function httpPostJson(url, data): Promise<any> {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  try {
    return await response.json()
  } catch (err) {
    console.log("Parsing failed", err)
    throw err
  }
}
