import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { createDatabaseConnectionWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import * as path from "path"
import { config } from "../backendConfig"
import { createMediaEngine, MediaEngine } from "../team/createMediaEngine"
import { fileExists, readFile } from "./fsUtils"
import { log } from "./log"

export function getSessionDbConf() {
  let dir = config.dataDir
  let file = "sessions.sqlite"

  return {
    dir,
    file,
    path: path.join(dir, file)
  }
}

export let teamDbCn!: DatabaseConnectionWithSqlBricks

export async function initDbTeamCn() {
  let dbPath = path.join(config.dataDir, "platform.sqlite")
  let scriptPath = path.join(__dirname, "..", "..", "..", "sqlite-scripts", "platform.sql")

  teamDbCn = await newSqliteCn("[TEAMS]", dbPath, scriptPath)
}

let cnMap = new Map<string, DatabaseConnectionWithSqlBricks>()

export async function getCn(subdomain: string): Promise<DatabaseConnectionWithSqlBricks> {
  let cn = cnMap.get(subdomain)

  if (!cn) {
    let dbPath = path.join(config.dataDir, subdomain, "team.sqlite")
    let scriptPath = path.join(__dirname, "..", "..", "..", "sqlite-scripts", "team.sql")
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
    let dbPath = path.join(config.dataDir, subdomain, "files.sqlite")
    let execDdl = !await fileExists(dbPath)
    let up = subdomain.toUpperCase()
    let debug = `[F-${up}]`

    engine = await createMediaEngine(await newSqliteCn(debug, dbPath), execDdl)
    ngMap.set(subdomain, engine)
  }

  return engine
}

async function newSqliteCn(debugPrefix, fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  let cn = createDatabaseConnectionWithSqlBricks({
    provider: sqlite3ConnectionProvider({ fileName, logWarning: msg => log.warn(msg) }),
    afterOpen: async cn => {
      await cn.exec("PRAGMA busy_timeout = 50")
      await cn.exec("PRAGMA foreign_keys = ON")
      await cn.exec("PRAGMA journal_mode = WAL")
    },
    poolOptions: {
      logMonitoring: m => log.trace(debugPrefix, "[MONITORING]", `[${m.id}]`, m.event),
      connectionTtl: 30
    },
    logError: err => log.error(err),
    debugLog: debug => {
      if (debug.callingContext) {
        let cc = debug.callingContext
        let msg = `[${cc.idInPool}]${cc.inTransaction ? " [in transaction]" : ""} on calling "${cc.method}"`
        if (debug.error) {
          log.trace(
            "========>", debugPrefix, "[DEBUG-MYCN-ERROR]", msg,
            "\n  -- args --\n", cc.args,
            "\n  -- error --\n", debug.error,
            // "\n  -- connection --\n", cc.connection
          )
        } else {
          log.trace(
            debugPrefix, "[DEBUG-MYCN]", msg,
            "\n  -- args --\n", cc.args,
            // "\n  -- result --\n", debug.result,
            // "\n  -- connection --\n", cc.connection
          )
        }
      } else {
        if (debug.error) {
          log.trace(
            "========>", debugPrefix, "[DEBUG-MYCN-ERROR] Open connection",
            "\n  -- error --\n", debug.error
          )
        } else {
          log.trace(
            debugPrefix, "[DEBUG-MYCN] Open connection",
            // "\n  -- result --\n", debug.result
          )
        }
      }
    }
  }, {
      toParamsOptions: { placeholder: "?%d" },
      // trace: (action, sqlBricks) => {
      //   let sql: string
      //   try {
      //     sql = sqlBricks.toString() // Throws an error when a parameter is a Buffer.
      //   } catch {
      //     sql = sqlBricks.toParams().text
      //   }
      //   log.trace("[SQL]", action, sql)
      // }
    })

  if (isNewDb && newDbScriptFileName)
    await cn.execScript(await readFile(newDbScriptFileName, "utf8"))

  return cn
}

export function toIntList(strList: Array<string | number>): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function int(str: number | string): number {
  return typeof str === "number" ? str : parseInt(str, 10)
}
