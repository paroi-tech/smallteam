import { CommentFragment } from "./fragments/Comment"
import { ContributorFragment } from "./fragments/Contributor"
import { FlagFragment } from "./fragments/Flag"
import { ProjectFragment } from "./fragments/Project"
import { StepFragment } from "./fragments/Step"
import { TaskFragment } from "./fragments/Task"
import { TaskLogFragment } from "./fragments/TaskLog"

export interface Fragments {
  Comment?: CommentFragment[]
  Contributor?: ContributorFragment[]
  Flag?: FlagFragment[]
  Project?: ProjectFragment[]
  Step?: StepFragment[]
  Task?: TaskFragment[]
  TaskLog?: TaskLogFragment[]
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