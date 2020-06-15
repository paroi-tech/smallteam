import * as path from "path"
import { packageDir } from "./context"
import { readFile } from "./utils/fsUtils"

export const BCRYPT_SALT_ROUNDS = 10
export const TOKEN_LENGTH = 16

export type LogSeverity = "error" | "warn" | "info" | "debug" | "trace"
export type LogTarget = "console" | "file"
export type LogFormatter = "human" | "json" | "syslog" | "commonInfoModel"

export interface TargetLogConf {
  target: LogTarget
  minSeverity: LogSeverity
  /**
   * Default value is: `"commonInfoModel"`.
   */
  formatter?: LogFormatter
  /**
   * Can be an absolute or a relative path. A relative path will be relative to the data directory.
   *
   * This option is required when `"target"` is set to `"file"`.
   */
  file?: string
}

export interface ServerConfiguration {
  env: "prod" | "local"
  log: TargetLogConf[]
  ssl: boolean
  /**
   * In the `platform` mode, this is the main domain.
   */
  domain: string
  port: number
  publicPort?: number
  dataDir: string
  /**
   * Default is: `"singleTeam"`.
   */
  mode?: "singleTeam" | "platform",
  singleTeam?: {
    /**
     * For example: `"/my/sub/directory"` (optional).
     */
    subdirUrl?: string
  },
  platform?: {
  },
  mail: {
    from: string
  }
}

export let config!: ServerConfiguration
export let appVersion!: string

export async function loadServerConfig(): Promise<ServerConfiguration> {
  let paramIndex = process.argv.indexOf("--config")
  if (paramIndex === -1 || paramIndex + 1 >= process.argv.length)
    throw new Error("Missing config parameter")
  let confFile = process.argv[paramIndex + 1]
  try {
    config = JSON.parse((await readFile(confFile)).toString("utf8"))
  } catch (err) {
    throw new Error(`Cannot load the configuration file: ${err.message}`)
  }
  appVersion = await readPackageVersion()
  return config
}

export async function readPackageVersion(): Promise<string> {
  try {
    let data = JSON.parse((await readFile(path.join(packageDir, "package.json"))).toString("utf8"))
    return data.version || "0"
  } catch (err) {
    throw new Error(`Cannot load the package.json file: ${err.message}`)
  }
}
