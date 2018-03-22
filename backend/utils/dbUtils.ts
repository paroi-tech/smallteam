import * as path from "path"
import { createDatabaseConnection, DatabaseConnection } from "mycn"
import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { fileExists, readFile } from "./fsUtils"


// import * as fs from "fs"
// import { promisify } from "util";
// const readFile = promisify(fs.readFile)

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

export let cn!: DatabaseConnection<string>
export let fileCn!: DatabaseConnection<string>

declare module "mycn" {
  export interface DatabaseConnection<INSERT_ID extends string | number = any> {
    prepareSqlBricks<ROW extends ResultRow = any>(sqlBricks): Promise<PreparedStatement<ROW>>
    execSqlBricks(sqlBricks): Promise<ExecResult<INSERT_ID>>
    allSqlBricks<ROW extends ResultRow = any>(sqlBricks): Promise<ROW[]>
    singleRowSqlBricks<ROW extends ResultRow = any>(sqlBricks): Promise<ROW | undefined>
    singleValueSqlBricks<VAL = any>(sqlBricks): Promise<VAL | undefined | null>
  }
}

export async function initConnection() {
  cn = await newSqliteCn(mainDbConf.path, path.join(mainDbConf.dir, "sqlite-scripts", "smallteam.sql"))
  fileCn = await newSqliteCn(fileDbConf.path, path.join(fileDbConf.dir, "sqlite-scripts", "uploadengine.sql"))
}

async function newSqliteCn(fileName: string, newDbScriptFileName?: string) {
  const isNewDb = !await fileExists(fileName)
  let cn = await createDatabaseConnection({
    provider: sqlite3ConnectionProvider({ fileName }),
    init: async cn => {
      await cn.exec("PRAGMA busy_timeout = 500")
      await cn.exec("PRAGMA foreign_keys = ON")
    },
    modifyDatabaseConnection: cn => {
      cn.prepareSqlBricks = sqlBricks => {
        let params = sqlBricks.toParams({ placeholder: '?%d' })
        return cn.prepare(params.text, params.values)
      }
      cn.execSqlBricks = sqlBricks => {
        let params = sqlBricks.toParams({ placeholder: '?%d' })
        return cn.exec(params.text, params.values)
      }
      cn.allSqlBricks = sqlBricks => {
        let params = sqlBricks.toParams({ placeholder: '?%d' })
        return cn.all(params.text, params.values)
      }
      cn.singleRowSqlBricks = sqlBricks => {
        let params = sqlBricks.toParams({ placeholder: '?%d' })
        return cn.singleRow(params.text, params.values)
      }
      cn.singleValueSqlBricks = sqlBricks => {
        let params = sqlBricks.toParams({ placeholder: '?%d' })
        return cn.singleValue(params.text, params.values)
      }
      return cn
    },
    insertedIdType: "string",
    poolOptions: {
      logError: console.log
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
