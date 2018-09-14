import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { SessionData } from "../../../session"
import { BackendContext } from "../../../utils/serverUtils"
import { MediaEngine } from "../../createMediaEngine"
import CargoLoader from "./CargoLoader"

export { CargoLoader }

export interface ModelContext extends BackendContext {
  readonly subdomain: string
  readonly cn: DatabaseConnectionWithSqlBricks
  readonly mediaEngine: MediaEngine
  readonly sessionData: SessionData
  readonly loader: CargoLoader
}
