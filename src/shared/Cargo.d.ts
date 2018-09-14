import { CommentFragment } from "./meta/Comment"
import { AccountFragment } from "./meta/Account"
import { FlagFragment } from "./meta/Flag"
import { ProjectFragment } from "./meta/Project"
import { StepFragment } from "./meta/Step"
import { TaskFragment } from "./meta/Task"
import { TaskLogEntryFragment } from "./meta/TaskLogEntry"
import { MediaFragment } from "./meta/Media"
import { MediaVariantFragment } from "./meta/MediaVariant"
import { GitCommitFragment } from "./meta/GitCommit"

export interface Fragments {
  Comment?: CommentFragment[]
  Account?: AccountFragment[]
  Flag?: FlagFragment[]
  Project?: ProjectFragment[]
  Step?: StepFragment[]
  Task?: TaskFragment[]
  TaskLogEntry?: TaskLogEntryFragment[]
  Media?: MediaFragment[]
  MediaVariant?: MediaVariantFragment[]
  GitCommit?: GitCommitFragment[]
}

export type Type = keyof Fragments

export type Identifier = string | { [fieldName: string]: string }
export type Identifiers = string[] | Array<{ [fieldName: string]: string }>

export type ResultType = "data" | "fragment" | "fragments" | "none"

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
  val?: any
}

export interface FragmentResult {
  type: "fragment"
  val?: FragmentRef
}

export interface FragmentsResult {
  type: "fragments"
  val?: FragmentsRef
}

export type Result = DataResult | FragmentResult | FragmentsResult

export type Changed = {
  [K in Type]?: Identifier[]
}

/**
 * Each partial fragment contains the ID (required) and optional fields
 */
export type PartialFragments = {
  [K in Type]?: object[]
}

export interface ModelUpdate {
  fragments?: Fragments
  /**
   * Used to update fields in fragments that are already loaded
   */
  partial?: PartialFragments
  created?: Changed
  updated?: Changed
  deleted?: Changed
  reordered?: Changed
}

export interface CargoResponse {
  done: boolean
  displayError?: string | string[]
  debugData?: any
  result?: Result
}

export interface Cargo extends CargoResponse {
  modelUpd?: ModelUpdate
}

export interface BatchCargo {
  responses?: CargoResponse[]
  modelUpd?: ModelUpdate
}

// --
// -- Backend input
// --

export interface Dependencies {
  type: Type
  idList: Identifier[]
}
