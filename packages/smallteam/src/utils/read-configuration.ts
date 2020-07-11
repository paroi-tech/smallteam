import { createValidator } from "@typeonly/validator"
import { readFileSync } from "fs"
import { join } from "path"
import { SmallTeamConf } from "./configuration-types"

export function readConfigFileSync(packageDir: string): SmallTeamConf {
  const paramIndex = process.argv.indexOf("--config")
  const hasParam = paramIndex !== -1 && paramIndex + 1 < process.argv.length
  const fileName = hasParam ? process.argv[paramIndex + 1] : "config.json"
  let data: unknown
  try {
    data = JSON.parse(readFileSync(fileName, "utf8"))
  } catch (err) {
    throw new Error(`Cannot load configuration '${fileName}': ${err.message}`)
  }
  validateConfiguration(packageDir, data)
  return data
}

function validateConfiguration(packageDir: string, data: unknown): asserts data is SmallTeamConf {
  const validator = createValidator({
    bundle: require(join(packageDir, "dist", "types.to.json"))
  })
  const result = validator.validate("SmallTeamConf", data)
  if (!result.valid)
    throw new Error(`Invalid config file: ${result.error}`)
}
