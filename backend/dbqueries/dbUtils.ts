import * as path from "path"
import * as sqlite from "sqlite"

export async function getDbConnection() {
  let cn = await sqlite.open(path.join(__dirname, "..", "..", "ourdb.sqlite"))
  //;(cn as any).driver.configure("busyTimeout", 2000)
  await cn.run("PRAGMA foreign_keys = ON")
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

// export function isObjectEmpty(obj): boolean {
//   for (let k in obj) {
//     if (obj.hasOwnProperty(k))
//       return false
//   }
//   return true
// }