import { SBMainConnection } from "@ladc/sql-bricks-modifier"
import { SessionData } from "../../../session"
import { BackendContext } from "../../../utils/serverUtils"
import { MediaEngine } from "../../createMediaEngine"
import CargoLoader from "./CargoLoader"

export { CargoLoader }

export interface ModelContext extends BackendContext {
  readonly subdomain: string
  readonly cn: SBMainConnection
  readonly mediaEngine: MediaEngine
  readonly sessionData: SessionData
  readonly loader: CargoLoader
}
