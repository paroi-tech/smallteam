import { SBConnection } from "@ladc/sql-bricks-modifier"
import { select } from "sql-bricks"

interface RegAccount {
  id: string
  role: string
  login: string
  password: string
}

export async function getAccountById(cn: SBConnection, id: string) {
  const sql = select("account_id, login, password, role").from("account").where("account_id", id)
  const row = await cn.singleRow(sql)

  if (row)
    return toAccount(row)
}

export async function getAccountByLogin(cn: SBConnection, login: string) {
  const sql = select("account_id, login, password, role").from("account").where("login", login)
  const row = await cn.singleRow(sql)

  if (row)
    return toAccount(row)
}

export async function getAccountByEmail(cn: SBConnection, email: string) {
  const sql = select("account_id, login, password, role").from("account").where("email", email)
  const row = await cn.singleRow(sql)

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
