import * as path from "path"
import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { createDatabaseConnectionWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { fileExists, readFile } from "./fsUtils"
import { MediaEngine, createMediaEngine } from "../createMediaEngine"
import { serverConfig } from "../backendConfig"

// export const mainDbConf = (function () {
//   let dir = path.join(__dirname, "..", ".."),
//     file = "ourdb.sqlite"
//   return {
//     dir,
//     file,
//     path: path.join(dir, file)
//   }
// })()

// export const fileDbConf = (function () {
//   let dir = path.join(__dirname, "..", ".."),
//     file = "files.sqlite"
//   return {
//     dir,
//     file,
//     path: path.join(dir, file)
//   }
// })()

export const sessionDbConf = (function () {
  let dir = path.join(__dirname, "..", ".."),
    file = "sessions.sqlite"
  return {
    dir,
    file,
    path: path.join(dir, file)
  }
})()

let cnMap = new Map<string, DatabaseConnectionWithSqlBricks>()

export async function getCn(subdomain: string): Promise<DatabaseConnectionWithSqlBricks> {
  let cn = cnMap.get(subdomain)

  if (!cn) {
    let dbPath = path.join(serverConfig.dataDir, subdomain, "main.sqlite")
    let scriptPath = path.join(__dirname, "..", "..", "sqlite-scripts", "main.sql")
    let up = subdomain.toUpperCase()
    let debug = `[${up}]`

    cn = await newSqliteCn(debug, dbPath, scriptPath)
    cnMap.set(subdomain, cn)
  }

  return cn
}

let ngMap = new Map<string, MediaEngine>()

export async function getMediaEngine(subdomain: string): Promise<MediaEngine> {
  let engine = ngMap.get(subdomain)

  if (!engine) {
    let dbPath = path.join(serverConfig.dataDir, subdomain, "files.sqlite")
    let execDdl = !await fileExists(dbPath)
    let up = subdomain.toUpperCase()
    let debug = `[F-${up}]`
    engine = await createMediaEngine(await newSqliteCn(debug, dbPath), execDdl)
    ngMap.set(subdomain, engine)
  }

  return engine
}

// export let cn!: DatabaseConnectionWithSqlBricks

// export async function initConnection() {
//   cn = await newSqliteCn("[MAIN]", mainDbConf.path, path.join(mainDbConf.dir, "sqlite-scripts", "smallteam.sql"))
// }

// export let mediaEngine!: MediaEngine

// export async function initMediaEngine() {
//   let execDdl = !await fileExists(fileDbConf.path)
//   mediaEngine = await createMediaEngine(
//     await newSqliteCn("[F]", fileDbConf.path),
//     execDdl
//   )
// }

async function newSqliteCn(debug, fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  let cn = createDatabaseConnectionWithSqlBricks({
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
