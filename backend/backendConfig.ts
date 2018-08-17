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

export async function initServerConfig(): Promise<ServerConfig> {
  let j = process.argv.indexOf("--config")

  if (j == -1 || j + 1 >= process.argv.length)
    throw new Error("Missing config parameter")

  let path = process.argv[j+1]

  if (!await fileExists(path))
    throw new Error("Config file not found")

  serverConfig = JSON.parse((await readFile(path)).toString())

  return serverConfig
}
