export interface Cargo {
  entities: {
    Project?: ProjectFields[]
    Task?: TaskFields[]
  }
}

interface TaskFields {
  id: string
  code: string
  label: string
  description?: string
  createTs: number
  updateTs: number
}
interface ProjectFields {
  id: string
  code: string
  archived: boolean
  rootTaskId: string
}

export default class CargoLoader {

  public add(type: "Task" | "Project", data) {

  }

  public toCargo(): Cargo {
    return null as any; // TODO
  }
}