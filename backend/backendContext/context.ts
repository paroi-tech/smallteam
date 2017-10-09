import CargoLoader from "./CargoLoader";

export { CargoLoader }

export interface SessionData {
  contributorId: string
}

export interface BackendContext {
  readonly sessionData: SessionData
  readonly loader: CargoLoader
}
