import { Meta, validateDataArray } from "../../isomorphic/validation"
import { ProjectFields, ProjectModel, projectMeta, NewProjectFields } from "../../isomorphic/entities/project"
import { Cargo } from "../../isomorphic/Cargo"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

// export async function queryProjects(filters: AsFilter<ProjectFields>): Promise<ProjectModel[]> {
//   let cargo: Cargo = await httpPostJson("/api/exec", {
//       type: "Project",
//       filters
//     })
//   return createProjectModel(validateDataArray<ProjectFields>(projectMeta, cargo.entities.))
// }

// export async function createProject(values: NewProjectFields): Promise<ProjectModel[]> {
//   let cargo: Cargo = await httpPostJson("/api/exec", {
//     cmd: "create",
//     type: "Project",
//     values
//   })
//   return createProjectModel(validateDataArray<ProjectFields>(projectMeta, ))
// }

function createProjectModel(data: ProjectFields[]): ProjectModel[] {
  return data as any; // TODO
  // for (let item of data) {
  //   item.rootTask =
  // }
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
