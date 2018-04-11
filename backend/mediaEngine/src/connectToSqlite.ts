import { sqlite3ConnectionProvider } from "mycn-sqlite3"
import { createDatabaseConnectionWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import * as fs from "fs"
import { promisify } from "util"
const readFile = promisify(fs.readFile)

export async function connectToSqlite(fileName: string, newDbScriptFileName?: string): Promise<DatabaseConnectionWithSqlBricks> {
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

function fileExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    });
  })
}
