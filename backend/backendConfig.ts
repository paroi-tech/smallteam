import { fileExists, readFile } from "./utils/fsUtils"

export const bcryptSaltRounds = 10
export const tokenSize = 16

export interface ServerConfig {
  env: "prod" | "local"
  ssl: boolean
  mainDomain: string
  port: number
  publicPort?: number
  dataDir: string
  versionFile?: string
  mail: {
    from: string
    user: string
    password: string
    host: string
    port: number
    secure: boolean
  }
}

export let serverConfig!: ServerConfig
export let platformVersion: string | undefined

export async function loadServerConfig(): Promise<ServerConfig> {
  let paramIndex = process.argv.indexOf("--config")
  if (paramIndex === -1 || paramIndex + 1 >= process.argv.length)
    throw new Error("Missing config parameter")
  let confFile = process.argv[paramIndex + 1]
  try {
    serverConfig = JSON.parse((await readFile(confFile)).toString("utf8"))
  } catch (err) {
    throw new Error(`Cannot load the configuration file: ${err.message}`)
  }
  if (serverConfig.versionFile)
    platformVersion = await readPlatformVersion(serverConfig.versionFile)
  else
    platformVersion = "0"
  return serverConfig
}

export async function readPlatformVersion(versionFile): Promise<string> {
  try {
    return (await readFile(versionFile)).toString("utf8")
  } catch (err) {
    throw new Error(`Cannot load the configuration file: ${err.message}`)
  }
}
