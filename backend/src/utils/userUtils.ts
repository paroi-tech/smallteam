import { SBConnection } from "@ladc/sql-bricks-modifier"
import { select } from "sql-bricks"

interface RegAccount {
  id: string
  role: string
  login: string
  password: string
}

export async function getAccountById(cn: SBConnection, id: string) {
  let sql = select("account_id, login, password, role").from("account").where("account_id", id)
  let row = await cn.singleRow(sql)

  if (row)
    return toAccount(row)
}

export async function getAccountByLogin(cn: SBConnection, login: string) {
  let sql = select("account_id, login, password, role").from("account").where("login", login)
  let row = await cn.singleRow(sql)

  if (row)
    return toAccount(row)
}

export async function getAccountByEmail(cn: SBConnection, email: string) {
  let sql = select("account_id, login, password, role").from("account").where("email", email)
  let row = await cn.singleRow(sql)

  if (row)
    return toAccount(row)
}

function toAccount(row): RegAccount {
  return {
    id: row["account_id"].toString(),
    role: row["role"],
    login: row["login"],
    password: row["password"]
  }
}