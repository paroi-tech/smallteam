import { fileExists, readFile } from "./utils/fsUtils"

export const bcryptSaltRounds = 10
export const tokenSize = 16

export interface ServerConfig {
  env: "prod" | "local"
  ssl: boolean
  /**
   * In the `platform` mode, this is the main domain.
   */
  domain: string
  port: number
  publicPort?: number
  dataDir: string
  versionFile?: string
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
    user: string
    password: string
    host: string
    port: number
    secure: boolean
  }
}

export let config!: ServerConfig
export let platformVersion: string | undefined

export async function loadServerConfig(): Promise<ServerConfig> {
  let paramIndex = process.argv.indexOf("--config")
  if (paramIndex === -1 || paramIndex + 1 >= process.argv.length)
    throw new Error("Missing config parameter")
  let confFile = process.argv[paramIndex + 1]
  try {
    config = JSON.parse((await readFile(confFile)).toString("utf8"))
  } catch (err) {
    throw new Error(`Cannot load the configuration file: ${err.message}`)
  }
  if (config.versionFile)
    platformVersion = await readPlatformVersion(config.versionFile)
  else
    platformVersion = "0"
  return config
}

export async function readPlatformVersion(versionFile): Promise<string> {
  try {
    return (await readFile(versionFile)).toString("utf8")
  } catch (err) {
    throw new Error(`Cannot load the configuration file: ${err.message}`)
  }
}
