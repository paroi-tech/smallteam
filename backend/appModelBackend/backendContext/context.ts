import CargoLoader from "./CargoLoader"
import { SessionData } from "../../session"

export { CargoLoader }

export interface BackendContext {
  readonly sessionData: SessionData
  readonly loader: CargoLoader
}
