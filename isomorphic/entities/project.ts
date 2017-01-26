import { EntityMeta, pickEntityMeta } from "./EntityMeta"

export interface ProjectFragment {
  id: string
  code: string
  name: string
  description?: string
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
      update: true
    },
    name: {
      dataType: "string",
      update: true
    },
    description: {
      dataType: "string",
      optional: true,
      update: true
    },
    archived: {
      dataType: "boolean",
      update: true
    },
    rootTaskId: {
      dataType: "string"
    }
  }
}

export type NewProjectFragment = Pick<ProjectFragment, "code" | "name" | "description">

export const newProjectMeta = pickEntityMeta("NewProject", projectMeta, ["code", "name", "description"])
