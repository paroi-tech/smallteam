import * as path from "path"
import { open } from "sqlite"
import { sqliteConnection, Connection } from "./sqlite-with-transactions";

export const dbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
    file = "ourdb.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export let cn: Connection

export async function initConnection() {
  cn = await sqliteConnection(async () => {
    let db = await open(dbConf.path)
    //;(db as any).driver.configure("busyTimeout", 2000)
    await db.run("PRAGMA foreign_keys = ON")
    await db.migrate({
      migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts")
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
