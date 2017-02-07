import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta, SearchPick, searchPickFragmentMeta } from "../FragmentMeta"

export interface ProjectFragment {
  readonly id: string
  code: string
  name: string
  description?: string | null
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

export type UpdProjectFragment = UpdPick<ProjectFragment, "id", "code" | "name" | "description" | "archived">
export const updProjectMeta = updPickFragmentMeta("Upd", projectMeta, ["id"], ["code", "name", "description", "archived"])

export type ProjectQuery = SearchPick<ProjectFragment, "code" | "name" | "description" | "archived">
export const projectQueryMeta = searchPickFragmentMeta("New", projectMeta, ["code", "name", "description", "archived"])
