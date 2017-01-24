import { ProjectFields } from "./entities/project"
import { TaskFields } from "./entities/task"

export interface Entities {
  Project?: ProjectFields[]
  Task?: TaskFields[]
}

export type Identifier = string | { [field: string]: string }

export interface EntityRef {
  type: keyof Entities
  id: Identifier
}

export interface EntitiesRef {
  type: keyof Entities
  list: Identifier[]
}

export interface DataResult {
  type: "data"
  val: any
}

export interface EntityResult {
  type: "entity"
  val: EntityRef
}

export interface EntitiesResult {
  type: "entities"
  val: EntitiesRef
}

export type Result = DataResult | EntityResult | EntitiesResult

export interface Cargo {
  done: boolean
  displayError?: string | string[]
  debugData?: any
  result?: Result
  entities?: Entities
}