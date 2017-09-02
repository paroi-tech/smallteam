import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../cargoLoader/CargoLoader"
import { ContributorFragment, NewContributorFragment, newContributorMeta, UpdContributorFragment, updContributorMeta } from "../../isomorphic/fragments/Contributor"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { markAsUpdatedStepsByType } from "./queryStep"

function toContributorFragment(row): ContributorFragment {
  return {
    id: row["contibutor_id"],
    name: row["name"],
    login: row["login"],
    email: row["email"]
  }
}

export async function queryContributors(loader: CargoLoader) {
  let cn = await getDbConnection()
  let sql = buildSelect()
             .select("contributor_id, login, name, email")
             .from("contributor")
             .orderBy("name")
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toContributorFragment(row)
    loader.addFragment({
      type: "StepType",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function createContributor(loader: CargoLoader, newFrag: NewContributorFragment) {
  let cn = await getDbConnection()
  let sql = buildInsert()
    .insertInto("contributor")
    .values(toSqlValues(newFrag, newContributorMeta))
  let ps = await cn.run(sql.toSql())
  let contributorId = ps.lastID
  loader.addFragment({
    type: "Contributor",
    id: contributorId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

export async function updateContributor(loader: CargoLoader, updFrag: UpdContributorFragment) {
  let cn = await getDbConnection()
  let contributorId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, updContributorMeta, "exceptId")
  if (values === null)
    return
  let sql = buildUpdate()
    .update("contributor")
    .set(values)
    .where("contributor_id", contributorId) // FIXME: Update this after fixing bug with with toSqlValues

  loader.addFragment({
    type: "Contributor",
    id: contributorId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await cn.run(sql.toSql())
}
