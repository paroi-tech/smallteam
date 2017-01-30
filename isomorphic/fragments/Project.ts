import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface ProjectFragment {
  readonly id: string
  code: string
  name: string
  description?: string
  archived: boolean
  readonly rootTaskId: string
}

export const projectMeta: FragmentMeta = {
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

export const newProjectMeta = pickFragmentMeta("New", projectMeta, ["code", "name", "description"])
