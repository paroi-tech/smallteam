import { ProjectFragment } from "./fragments/Project"
import { TaskFragment } from "./fragments/Task"

export interface Fragments {
  Project?: ProjectFragment[]
  Task?: TaskFragment[]
}

export type Type = keyof Fragments

export type Identifier = string | { [fieldName: string]: string }

export interface FragmentRef {
  type: Type
  id: Identifier
}

export interface FragmentsRef {
  type: Type
  list: Identifier[]
}

export interface DataResult {
  type: "data"
  val: any
}

export interface FragmentResult {
  type: "fragment"
  val: FragmentRef
}

export interface FragmentsResult {
  type: "fragments"
  val: FragmentsRef
}

export type Result = DataResult | FragmentResult | FragmentsResult

export interface Cargo {
  done: boolean
  displayError?: string | string[]
  debugData?: any
  result?: Result
  fragments?: Fragments
}