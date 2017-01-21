import { Meta } from "../validation"

export interface ProjectFields {
  id: string
  code: string
  archived: boolean
  rootTaskId: string
}

export interface ProjectModel extends ProjectFields {
  //readonly rootTask: TaskModel
  //readonly steps: StepModel[]
}

export const projectMeta: Meta = {
  type: "Project",
  fields: {
    id: {
      dataType: "string",
    },
    code: {
      dataType: "string",
    },
    archived: {
      dataType: "boolean",
    },
    rootTaskId: {
      dataType: "string",
    }
  }
}
