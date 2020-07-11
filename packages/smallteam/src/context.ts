import { existsSync, readFileSync } from "fs"
import { dirname, join, resolve } from "path"
import { createAppLog } from "./utils/app-log"
import { readConfigFileSync } from "./utils/read-configuration"

export const packageDir = dirname(__dirname)
export const BCRYPT_SALT_ROUNDS = 10
export const TOKEN_LENGTH = 16

export const appVersion = readPackageVersionSync()
export const conf = readConfigFileSync(packageDir)

export const dataDir = ensureFullPath(conf.dataDir, packageDir)
if (!existsSync(dataDir)) {
  // eslint-disable-next-line no-console
  console.error(`Data directory doesn't exists: ${dataDir}`)
  process.exit(1)
}

export const appLog = createAppLog({
  ...conf.log,
  file: ensureFullPath(conf.log.file ?? undefined, dataDir)
})

function readPackageVersionSync(): string {
  try {
    const data = JSON.parse((readFileSync(join(packageDir, "package.json"))).toString("utf8"))
    return data.version || "0"
  } catch (err) {
    throw new Error(`Cannot load the package.json file: ${err.message}`)
  }
}

function ensureFullPath<T extends string | undefined>(path: T, defaultDir: string): T {
  if (path !== undefined && !path.startsWith("/"))
    path = resolve(defaultDir, path as string) as T
  return path
}