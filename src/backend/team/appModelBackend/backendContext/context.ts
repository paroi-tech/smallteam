import CargoLoader from "./CargoLoader"
import { SessionData } from "../../../session"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { MediaEngine } from "../../createMediaEngine"
import { BackendContext } from "../../../utils/serverUtils"

export { CargoLoader }

export interface ModelContext extends BackendContext {
  readonly subdomain: string
  readonly cn: DatabaseConnectionWithSqlBricks
  readonly mediaEngine: MediaEngine
  readonly sessionData: SessionData
  readonly loader: CargoLoader
}
