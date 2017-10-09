import { FragmentMeta } from "./index"
import { pickFragmentMeta, PickUpdate, pickUpdateFragmentMeta, SearchPick, searchPickFragmentMeta } from "./metaHelpers"

export interface ProjectFragment {
  readonly id: string
  code: string
  name: string
  description?: string | null
  archived: boolean
  readonly rootTaskId: string
}

const meta: FragmentMeta = {
  type: "Project",
  variant: "read",
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

export type ProjectCreateFragment = Pick<ProjectFragment, "code" | "name" | "description">
export type ProjectUpdateFragment = PickUpdate<ProjectFragment, "id", "code" | "name" | "description" | "archived">
export type ProjectIdFragment = Pick<ProjectFragment, "id">
export type ProjectFetchFragment = SearchPick<ProjectFragment, "code" | "name" | "description" | "archived">

export default {
  read: meta,
  create: pickFragmentMeta("create", meta, ["code", "name", "description"]),
  update: pickUpdateFragmentMeta("update", meta, ["id"], ["code", "name", "description", "archived"]),
  id: pickFragmentMeta("id", meta, ["id"]),
  fetch: searchPickFragmentMeta("fetch", meta, ["code", "name", "description", "archived"])
}
