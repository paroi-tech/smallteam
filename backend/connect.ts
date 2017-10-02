import { getDbConnection } from "./dbqueries/dbUtils"
import { buildSelect } from "./sql92builder/Sql92Builder"
import { hash, compare } from "bcrypt"

export async function routeConnect(data): Promise<any> {
  let row = await getContributor(data.login)

  if (row && await compare(data.password, row.password)) {
    return {
      done: true,
      contributorId: row.id
    }
  }

  return {
    done: false
  }
}

async function getContributor(login: string) {
  let cn = await getDbConnection()
  let sql = buildSelect()
              .select("contributor_id, password")
              .from("contributor")
              .where("login", "=", login)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 1) {
    return {
      id: rs[0]["contributor_id"],
      password: rs[0]["password"]
    }
  }

  return undefined
}
