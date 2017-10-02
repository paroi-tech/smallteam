import { getDbConnection } from "./dbqueries/dbUtils"
import { buildSelect } from "./sql92builder/Sql92Builder"
import { hash, compare } from "bcrypt"

export async function routeConnect(data): Promise<any> {
  let row = getContributor(data.login)

  if (row && await compare(data.password, row["password"])) {
    return {
      done: true,
      contributorId: row["contributor_id"].toString()
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
  return rs.length === 1 ? rs[0] : undefined
}
