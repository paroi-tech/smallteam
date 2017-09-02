import { FragmentMeta, pickFragmentMeta, UpdPick, updPickFragmentMeta } from "../FragmentMeta"

export interface ContributorFragment {
  readonly id: string
  name: string
  login: string
  email: string
}

export const contributorMeta: FragmentMeta = {
  type: "Contributor",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    name: {
      dataType: "string",
      update: true
    },
    login: {
      dataType: "string",
      update: true
    },
    email: {
      dataType: "string",
      update: true
    }
  }
}

export type NewContributorFragment = Pick<ContributorFragment, "name" | "login" | "email">
export const newContributorMeta = pickFragmentMeta("New", contributorMeta, ["name", "login", "email"])

export type UpdContributorFragment = UpdPick<ContributorFragment, "id", "name" | "login" | "email">
export const updContributorMeta = updPickFragmentMeta("Upd", contributorMeta, ["id"], ["name", "login", "email"])

export type ContributorIdFragment = Pick<ContributorFragment, "id">
export const ContributorIdMeta = pickFragmentMeta("Id", contributorMeta, ["id"])
