import { EntityMeta } from "../validation"
import { TaskModel } from "./task"

export interface NewProjectFields {
  code: string
  name: string
}

export interface ProjectFields {
  id: string
  code: string
  archived: boolean
  rootTaskId: string
}

export interface ProjectModel extends ProjectFields {
  readonly rootTask: TaskModel
  //readonly steps: StepModel[]
}

const projectMeta: EntityMeta = {
  type: "Project",
  fields: {
    id: {
      dataType: "string",
      id: true
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

const taskMeta: EntityMeta = {
  type: "Task",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    code: {
      dataType: "string",
    },
    label: {
      dataType: "string",
    },
    description: {
      dataType: "string",
      nullable: true
    },
    createTs: {
      dataType: "number",
    },
    updateTs: {
      dataType: "number",
    }
  }
}

export const meta = {
  Project: projectMeta,
  Task: taskMeta
}