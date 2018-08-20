import { select } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"


interface RegAccount {
  id: string
  role: string
  login: string
  password: string
}

export async function getAccountById(runner: QueryRunnerWithSqlBricks, id: string): Promise<RegAccount | undefined> {
  let query = select("account_id, login, password, role").from("account").where("account_id", id)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toAccount(row) : undefined
}

export async function getAccountByLogin(runner: QueryRunnerWithSqlBricks, login: string) {
  let query = select("account_id, login, password, role").from("account").where("login", login)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toAccount(row) : undefined
}

export async function getAccountByEmail(runner: QueryRunnerWithSqlBricks, email: string) {
  let query = select("account_id, login, password, role").from("account").where("email", email)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
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