import * as path from "path"
import * as sqlite from "sqlite"

export function getSqlLiteDbConf() {
  let dir = path.join(__dirname, "..", ".."),
    file = "ourdb.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
}

export async function getDbConnection() {
  let cn = await sqlite.open(getSqlLiteDbConf().path)
  //;(cn as any).driver.configure("busyTimeout", 2000)
  await cn.run("PRAGMA foreign_keys = ON")
  await cn.migrate({
    migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts")
  })
  return cn
}

export function toIntList(strList: (string | number)[]): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function int(str: number | string): number {
  return typeof str === "number" ? str : parseInt(str, 10)
}

// export function isObjectEmpty(obj): boolean {
//   for (let k in obj) {
//     if (obj.hasOwnProperty(k))
//       return false
//   }
//   return true
// }

export async function fetchOneValue(sql: string): Promise<any> {
  let cn = await getDbConnection()
  let rs = await cn.all(sql)
  if (rs.length !== 1)
    throw new Error(`Cannot fetch one value, row count: ${rs.length}`)
  let row = rs[0]
  let columns = Object.keys(row)
  if (columns.length !== 1)
    throw new Error(`Cannot fetch one value, column count: ${columns.length}`)
  return row[columns[0]];
}
