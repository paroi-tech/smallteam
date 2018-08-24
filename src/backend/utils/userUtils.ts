import { select } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"
import { log } from "./log"


interface RegAccount {
  id: string
  role: string
  login: string
  password: string
}

export async function getAccountById(cn: QueryRunnerWithSqlBricks, id: string): Promise<RegAccount | undefined> {
  let sql = select("account_id, login, password, role").from("account").where("account_id", id)
  let row

  try {
    row = await cn.singleRowSqlBricks(sql)
  } catch (err) {
    log.error(err)
  }

  return row ? toAccount(row) : undefined
}

export async function getAccountByLogin(cn: QueryRunnerWithSqlBricks, login: string) {
  let sql = select("account_id, login, password, role").from("account").where("login", login)
  let row

  try {
    row = await cn.singleRowSqlBricks(sql)
  } catch (err) {
    log.error(err)
  }

  return row ? toAccount(row) : undefined
}

export async function getAccountByEmail(cn: QueryRunnerWithSqlBricks, email: string) {
  let sql = select("account_id, login, password, role").from("account").where("email", email)
  let row

  try {
    row = await cn.singleRowSqlBricks(sql)
  } catch (err) {
    log.error(err)
  }

  return row ? toAccount(row) : undefined
}

function toAccount(row): RegAccount {
  return {
    id: row["account_id"].toString(),
    role: row["role"],
    login: row["login"],
    password: row["password"]
  }
}