import * as path from "path"
import { open } from "sqlite"
import { sqliteConnection, Connection } from "./sqlite-with-transactions"

export const mainDbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
      file = "ourdb.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export const fileDbConf = (function() {
  let dir = path.join(__dirname, "..", ".."),
      file = "files.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export let cn: Connection
export let fileCn: Connection

export async function initConnection() {
  cn = await sqliteConnection(async () => {
    let db = await open(mainDbConf.path)
    await db.run("PRAGMA foreign_keys = ON")
    await db.migrate({
      migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts/main")
    })
    return db
  }, {
    logError: console.log
  })

  fileCn = await sqliteConnection(async () => {
    let db = await open(fileDbConf.path)
    await db.run("PRAGMA foreign_keys = ON")
    await db.migrate({
      migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts/files")
    })
    return db
  }, {
    logError: console.log
  })
}

export function toIntList(strList: (string | number)[]): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function int(str: number | string): number {
  return typeof str === "number" ? str : parseInt(str, 10)
}
