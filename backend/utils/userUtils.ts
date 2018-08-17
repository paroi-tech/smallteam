import { select } from "sql-bricks"
import { QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks"


interface RegContributor {
  id: string
  role: string
  login: string
  password: string
}

export async function getContributorById(runner: QueryRunnerWithSqlBricks, id: string): Promise<RegContributor | undefined> {
  let query = select("contributor_id, login, password, role").from("contributor").where("contributor_id", id)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

export async function getContributorByLogin(runner: QueryRunnerWithSqlBricks, login: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("login", login)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

export async function getContributorByEmail(runner: QueryRunnerWithSqlBricks, email: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("email", email)
  let row

  try {
    row = await runner.singleRowSqlBricks(query)
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