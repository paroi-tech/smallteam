import { Meta, validateDataArray } from "./validation"
import { ProjectFields, ProjectModel, projectMeta } from "./entities/project"

type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

export async function queryProjects(filters: AsFilter<ProjectFields>): Promise<ProjectModel[]> {
  let response = await fetch("/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "Project",
      filters
    })
  })
  try {
    return createProjectModel(validateDataArray<ProjectFields>(projectMeta, await response.json()))
  } catch (err) {
    console.log("parsing failed", err)
    throw err
  }
}

function createProjectModel(data: ProjectFields[]): ProjectModel[] {
  return data;
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

