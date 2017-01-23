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

export interface Cargo {
  done: boolean
  error?: string
  errorData?: any
  result?: any
  ref?: EntityRef | EntitiesRef
  entities?: Entities
}