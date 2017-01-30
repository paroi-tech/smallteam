import * as path from "path"
import * as sqlite from "sqlite"

export async function getDbConnection() {
  let cn = await sqlite.open(path.join(__dirname, "..", "..", "ourdb.sqlite"))
  await cn.migrate({
    migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts")
  })
  return cn
}

export function toIntList(strList: string[]): number[] {
  let res: number[] = []
  for (let val of strList)
    res.push(parseInt(val, 10))
  return res
}

export function int(str: string): number {
  return parseInt(str, 10)
}