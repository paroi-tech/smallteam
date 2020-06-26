import sqlBricksModifier, { SBMainConnection } from "@ladc/sql-bricks-modifier"
import sqlite3Adapter from "@ladc/sqlite3-adapter"
import ladc from "ladc"
import * as path from "path"
import { appLog, dataDir } from "../context"
import { createMediaEngine, MediaEngine } from "../team/createMediaEngine"
import { fileExists, readFile } from "./fsUtils"

export function getSessionDbConf() {
  const dir = dataDir
  const file = "sessions.sqlite"

  return {
    dir,
    file,
    path: path.join(dir, file)
  }
}

export let platformCn!: SBMainConnection

export async function initPlatformCn() {
  const dbPath = path.join(dataDir, "platform.sqlite")
  const scriptPath = path.join(__dirname, "..", "..", "sqlite-scripts", "platform.sql")

  platformCn = await newSqliteCn("[TEAMS]", dbPath, scriptPath)
}

export async function closeAllConnections() {
  if (platformCn)
    await platformCn.close()
  for (const cn of cnMap.values())
    await cn.close()
  // for (const engine of ngMap.values())
  //   await engine.uploadEngine..close()

}

const cnMap = new Map<string, SBMainConnection>()

export async function getCn(subdomain: string): Promise<SBMainConnection> {
  let cn = cnMap.get(subdomain)

  if (!cn) {
    const dbPath = path.join(dataDir, subdomain, "team.sqlite")
    const scriptPath = path.join(__dirname, "..", "..", "sqlite-scripts", "team.sql")
    const up = subdomain.toUpperCase()
    const debug = `[${up}]`

    cn = await newSqliteCn(debug, dbPath, scriptPath)
    cnMap.set(subdomain, cn)
  }

  return cn
}

const ngMap = new Map<string, MediaEngine>()

export async function getMediaEngine(subdomain: string): Promise<MediaEngine> {
  let engine = ngMap.get(subdomain)

  if (!engine) {
    const dbPath = path.join(dataDir, subdomain, "files.sqlite")
    const execDdl = !await fileExists(dbPath)
    const up = subdomain.toUpperCase()
    const debug = `[F-${up}]`

    engine = await createMediaEngine(await newSqliteCn(debug, dbPath), execDdl)
    ngMap.set(subdomain, engine)
  }

  return engine
}

async function newSqliteCn(debugPrefix, fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  const cn = ladc({
    adapter: sqlite3Adapter({ fileName, logWarning: msg => appLog.warn(msg) }),
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
      logMonitoring: m => appLog.trace(debugPrefix, "[MONITORING]", `[${m.id}]`, m.event),
      connectionTtl: 30
    },
    logError: err => appLog.error(err),
    logDebug: debug => {
      if (debug.callingContext) {
        const cc = debug.callingContext
        const msg = `[${cc.idInPool}]${cc.inTransaction ? " [in transaction]" : ""} on calling "${cc.method}"`
        if (debug.error) {
          appLog.trace(
            "========>", debugPrefix, "[DEBUG-LADC-ERROR]", msg,
            "\n  -- args --\n", cc.args,
            "\n  -- error --\n", debug.error
            // "\n  -- connection --\n", cc.connection
          )
        } else {
          appLog.trace(
            debugPrefix, "[DEBUG-LADC]", msg,
            "\n  -- args --\n", cc.args
            // "\n  -- result --\n", debug.result,
            // "\n  -- connection --\n", cc.connection
          )
        }
      } else {
        if (debug.error) {
          appLog.trace(
            "========>", debugPrefix, "[DEBUG-LADC-ERROR] Open connection",
            "\n  -- error --\n", debug.error
          )
        } else {
          appLog.trace(
            debugPrefix, "[DEBUG-LADC] Open connection"
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
  const type = typeof val
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
  const type = typeof val
  switch (type) {
    case "string":
      return val as string
    case "number":
      return (val as number).toString()
    default:
      throw new Error(`Unexpected type for string: ${type}`)
  }
}
