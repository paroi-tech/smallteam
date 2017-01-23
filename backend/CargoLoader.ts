import { ProjectFields } from "../isomorphic/entities/project"
import { TaskFields } from "../isomorphic/entities/task"

export interface Cargo {
  entities: {
    Project?: ProjectFields[]
    Task?: TaskFields[]
  }
}

export default class CargoLoader {

  public add(type: "Task" | "Project", data) {

  }

  public toCargo(): Cargo {
    return null as any; // TODO
  }
}