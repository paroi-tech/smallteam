import sqlBricksModifier, { SBMainConnection } from "@ladc/sql-bricks-modifier"
import sqlite3Adapter from "@ladc/sqlite3-adapter"
import ladc from "ladc"
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

export let teamDbCn!: SBMainConnection

export async function initDbTeamCn() {
  let dbPath = path.join(config.dataDir, "platform.sqlite")
  let scriptPath = path.join(__dirname, "..", "..", "sqlite-scripts", "platform.sql")

  teamDbCn = await newSqliteCn("[TEAMS]", dbPath, scriptPath)
}

let cnMap = new Map<string, SBMainConnection>()

export async function getCn(subdomain: string): Promise<SBMainConnection> {
  let cn = cnMap.get(subdomain)

  if (!cn) {
    let dbPath = path.join(config.dataDir, subdomain, "team.sqlite")
    let scriptPath = path.join(__dirname, "..", "..", "sqlite-scripts", "team.sql")
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
  let cn = ladc({
    adapter: sqlite3Adapter({ fileName, logWarning: msg => log.warn(msg) }),
    modifier: sqlBricksModifier({
      // toParamsOptions: { placeholder: "?%d" },
      // trace: (action, sqlBricks) => {
      //   let sql: string
      //   try {
      //     sql = sqlBricks.toString() // Throws an error when a parameter is a Buffer.
      //   } catch {
      //     sql = sqlBricks.toParams().text
      //   }
      //   log.trace("[SQL]", action, sql)
      // }
    }),
    initConnection: async cn => {
      await cn.exec("PRAGMA busy_timeout = 50")
      await cn.exec("PRAGMA foreign_keys = ON")
      await cn.exec("PRAGMA journal_mode = WAL")
    },
    poolOptions: {
      logMonitoring: m => log.trace(debugPrefix, "[MONITORING]", `[${m.id}]`, m.event),
      connectionTtl: 30
    },
    logError: err => log.error(err),
    logDebug: debug => {
      if (debug.callingContext) {
        let cc = debug.callingContext
        let msg = `[${cc.idInPool}]${cc.inTransaction ? " [in transaction]" : ""} on calling "${cc.method}"`
        if (debug.error) {
          log.trace(
            "========>", debugPrefix, "[DEBUG-LADC-ERROR]", msg,
            "\n  -- args --\n", cc.args,
            "\n  -- error --\n", debug.error,
            // "\n  -- connection --\n", cc.connection
          )
        } else {
          log.trace(
            debugPrefix, "[DEBUG-LADC]", msg,
            "\n  -- args --\n", cc.args,
            // "\n  -- result --\n", debug.result,
            // "\n  -- connection --\n", cc.connection
          )
        }
      } else {
        if (debug.error) {
          log.trace(
            "========>", debugPrefix, "[DEBUG-LADC-ERROR] Open connection",
            "\n  -- error --\n", debug.error
          )
        } else {
          log.trace(
            debugPrefix, "[DEBUG-LADC] Open connection",
            // "\n  -- result --\n", debug.result
          )
        }
      }
    }
  }) as SBMainConnection

  if (isNewDb && newDbScriptFileName)
    await cn.script(await readFile(newDbScriptFileName, "utf8"))

  return cn
}

export function toIntList(strList: (string | number)[]): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function intVal(val: unknown): number {
  let type = typeof val
  switch (type) {
    case "number":
      return val as number
    case "string":
      return parseInt(val as string, 10)
    default:
      throw new Error(`Unexpected type for number: ${type}`)
  }
}

export function strVal(val: unknown): string {
  let type = typeof val
  switch (type) {
    case "string":
      return val as string
    case "number":
      return (val as number).toString()
    default:
      throw new Error(`Unexpected type for string: ${type}`)
  }
}
