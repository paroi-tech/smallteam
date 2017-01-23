import { ProjectFields } from "./entities/project"
import { TaskFields } from "./entities/task"

export interface Cargo {
  entities: {
    Project?: ProjectFields[]
    Task?: TaskFields[]
  }
}