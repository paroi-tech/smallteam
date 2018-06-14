import * as path from "path"
import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { createDatabaseConnectionWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { fileExists, readFile } from "./fsUtils"
import { MediaEngine, createMediaEngine } from "../createMediaEngine"

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

export const sessionDbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
    file = "sessions.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

export let cn!: DatabaseConnectionWithSqlBricks

export async function initConnection() {
  cn = await newSqliteCn("[MAIN]", mainDbConf.path, path.join(mainDbConf.dir, "sqlite-scripts", "smallteam.sql"))
}

export let mediaEngine!: MediaEngine

export async function initMediaEngine() {
  let execDdl = !await fileExists(fileDbConf.path)
  mediaEngine = await createMediaEngine(
    await newSqliteCn("[F]", fileDbConf.path),
    execDdl
  )
}

async function newSqliteCn(debug, fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  let cn = await createDatabaseConnectionWithSqlBricks({
    provider: sqlite3ConnectionProvider({ fileName }),
    init: async cn => {
      await cn.exec("PRAGMA busy_timeout = 50")
      await cn.exec("PRAGMA foreign_keys = ON")
      await cn.exec("PRAGMA journal_mode = WAL")
    },
    poolOptions: {
      logError: err => console.log(err),
      logMonitoring: m => console.log(debug, "[MONITORING]", m.event, m.id),
      connectionTtl: 30
    }
  }, {
    toParamsOptions: { placeholder: "?%d" },
    trace: (action, sqlBricks) => {
      let sql: string
      try {
        sql = sqlBricks.toString() // Throws an error when a parameter is a Buffer.
      } catch {
        sql = sqlBricks.toParams().text
      }
      console.log("[SQL]", action, sql)
    }
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
