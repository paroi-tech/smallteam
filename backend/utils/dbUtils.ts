import * as path from "path"
import { createDatabaseConnection, DatabaseConnection } from "mycn"
import { sqlite3ConnectionProvider } from "mycn-sqlite3"

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

export let cn!: DatabaseConnection
export let fileCn!: DatabaseConnection

// interface DatabaseConnection {
//   execSqlBricks(sqlBricks)
// }

export async function initConnection() {
  cn = await createDatabaseConnection(
    sqlite3ConnectionProvider({ fileName: mainDbConf.path }),
    {
      init: async cn => {
        await cn.exec("PRAGMA foreign_keys = ON")
      },
      poolOptions: {
        logError: console.log
      }
    }
  )

  // cn = await sqliteConnection(
  //   async () => {
  //     let db = await open(mainDbConf.path)
  //     await db.run("PRAGMA foreign_keys = ON")
  //     await db.migrate({
  //       migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts/main")
  //     })
  //     return db
  //   }, {
  //     logError: console.log
  //   }
  // )

  fileCn = await createDatabaseConnection(
    sqlite3ConnectionProvider({ fileName: fileDbConf.path }),
    {
      init: async cn => {
        await cn.exec("PRAGMA foreign_keys = ON")
      },
      modifyDatabaseConnection: cn => {
        // cn.execSqlBricks = sqlBricks => {
        //   let params = sqlBricks.toParams({ placeholder: '?%d' })
        //   return cn.exec(params.text, params.values)
        // }
        // cn.allSqlBricks = sqlBricks => {
        //   let params = sqlBricks.toParams({ placeholder: '?%d' })
        //   return cn.all(params.text, params.values)
        // }
        // cn.singleRowSqlBricks = sqlBricks => {
        //   let params = sqlBricks.toParams({ placeholder: '?%d' })
        //   return cn.singleRow(params.text, params.values)
        // }
        // cn.singleValueSqlBricks = sqlBricks => {
        //   let params = sqlBricks.toParams({ placeholder: '?%d' })
        //   return cn.singleValue(params.text, params.values)
        // }
        return cn
      },
      poolOptions: {
        logError: console.log
      }
    }
  )

  // fileCn = await sqliteConnection(async () => {
  //   let db = await open(fileDbConf.path)
  //   await db.run("PRAGMA foreign_keys = ON")
  //   await db.migrate({
  //     migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts/files")
  //   })
  //   return db
  // }, {
  //   logError: console.log
  // })
}

// async function runSqlBricks(sqlBricks) {
//   let params = sqlBricks.toParams({ placeholder: '?%d' })
//   // console.log(params)
//   let cn = await getConnection()
//   cn.exec(params.text, params.values)
// }


export function toIntList(strList: (string | number)[]): number[] {
  return strList.map(val => typeof val === "number" ? val : parseInt(val, 10))
}

export function int(str: number | string): number {
  return typeof str === "number" ? str : parseInt(str, 10)
}
