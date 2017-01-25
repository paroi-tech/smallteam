import { EntityMeta } from "./EntityMeta"

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

export const projectMeta: EntityMeta = {
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
