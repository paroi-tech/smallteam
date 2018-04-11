import * as path from "path"
import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { createDatabaseConnectionWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { fileExists, readFile } from "./fsUtils"
import { MediaEngine, createMediaEngine } from "../createMediaEngine";

export const mainDbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
    file = "ourdb.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export const fileDbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
    file = "files.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export let cn!: DatabaseConnectionWithSqlBricks

export async function initConnection() {
  cn = await newSqliteCn(mainDbConf.path, path.join(mainDbConf.dir, "sqlite-scripts", "smallteam.sql"))
  // fileCn = await newSqliteCn(fileDbConf.path, path.join(fileDbConf.dir, "sqlite-scripts", "uploadengine.sql"))
}

export let mediaEngine!: MediaEngine

export async function initMediaEngine() {
  mediaEngine = await createMediaEngine(fileDbConf.path, path.join(fileDbConf.dir, "sqlite-scripts", "media-storage.sql"))
}

async function newSqliteCn(fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  let cn = await createDatabaseConnectionWithSqlBricks({
    provider: sqlite3ConnectionProvider({ fileName }),
    init: async cn => {
      await cn.exec("PRAGMA busy_timeout = 500")
      await cn.exec("PRAGMA foreign_keys = ON")
    },
    poolOptions: {
      logError: err => console.log(err)
    }
  }, {
    toParamsOptions: { placeholder: "?%d" }
  })
  if (isNewDb && newDbScriptFileName)
    await cn.execScript(await readFile(newDbScriptFileName, "utf8"))
  return cn
}

export function toIntList(strList: (string | number)[]): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function int(str: number | string): number {
  return typeof str === "number" ? str : parseInt(str, 10)
}
