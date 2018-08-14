import { select } from "sql-bricks"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"

type DbCn = DatabaseConnectionWithSqlBricks

interface RegContributor {
  id: string
  role: string
  login: string
  password: string
}

export async function getContributorById(cn: DbCn, id: string): Promise<RegContributor | undefined> {
  let query = select("contributor_id, login, password, role").from("contributor").where("contributor_id", id)
  let row

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }
  if (row)
    return toContributor(row)
}

export async function getContributorByLogin(cn: DatabaseConnectionWithSqlBricks, login: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("login", login)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

export async function getContributorByEmail(cn: DatabaseConnectionWithSqlBricks, email: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("email", email)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

function toContributor(row): RegContributor {
  return {
    id: row["contributor_id"].toString(),
    role: row["role"],
    login: row["login"],
    password: row["password"]
  }
}