import { EntityMeta } from "./EntityMeta"

export interface TaskFields {
  id: string
  code: string
  label: string
  description?: string
  createTs: number
  updateTs: number
}

export const taskMeta: EntityMeta = {
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
