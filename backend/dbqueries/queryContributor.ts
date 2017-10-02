import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../cargoLoader/CargoLoader"
import { ContributorFragment, NewContributorFragment, newContributorMeta, UpdContributorFragment, updContributorMeta } from "../../isomorphic/fragments/Contributor"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { hash, compare } from "bcrypt"

function toContributorFragment(row): ContributorFragment {
  return {
    id: row["contributor_id"].toString(),
    name: row["name"],
    login: row["login"],
    email: row["email"]
  }
}

export async function fetchContributors(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = buildSelect()
              .select("contributor_id, login, name, email")
              .from("contributor")
              .where("contributor_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toContributorFragment(row)
    loader.modelUpdate.addFragment("Contributor", data.id, data)
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
      type: "Contributor",
      frag,
      asResult: "fragments"
    })
  }
}

export async function createContributor(loader: CargoLoader, newFrag: NewContributorFragment) {
  let cn = await getDbConnection()
  let sql = buildInsert()
    .insertInto("contributor")
    .values(toSqlValues(newFrag, newContributorMeta))
    .values({"password": "init"})
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

// --
// -- Reorder affectedTo tasks
// --

export async function reorderAffectedContributors(loader: CargoLoader, idList: string[], taskIdStr: string) {
  let cn = await getDbConnection()
  let taskId = int(taskIdStr)

  let oldNums = await loadAffectedOrderNums(taskId),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateAffectedOrderNum(id, taskId, curNum)
      loader.modelUpdate.addPartial("Contributor", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateAffectedOrderNum(id, taskId, curNum)
      loader.modelUpdate.addPartial("Contributor", { id: id.toString(), "orderNum": curNum })
    }
  }
  loader.modelUpdate.markIdsAsReordered("Contributor", idList)
}

async function updateAffectedOrderNum(contributorId: number, taskId: number, orderNum: number) {
  let cn = await getDbConnection()
  let sql = buildUpdate()
    .update("task_affected_to")
    .set({
      "order_num": orderNum
    })
    .where({
      "contributor_id": contributorId,
      "task_id": taskId
    })
  await cn.run(sql.toSql())
}

async function loadAffectedOrderNums(taskId: number): Promise<Map<number, number>> {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("c.contributor_id, c.order_num")
    .from("task_affected_to c")
    .where("c.task_id", taskId)
  let rs = await cn.all(sql.toSql()),
    orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["contributor_id"], row["order_num"])
  return orderNums
}

// --
// -- Authentification functions
// --

export async function getContributor(loader: CargoLoader, login: string, passwd: string) {
  let cn = await getDbConnection()
  let sql = buildSelect()
              .select("contributor_id, login, name, email, password")
              .from("contributor")
              .where("login", "=", login)
  let rs = await cn.all(sql.toSql())

  if (rs.length == 1) {
    let row = rs[0]
    let h = row["password"]
    let b = await compare(passwd, h)

    if (b) {
      let frag = toContributorFragment(row)
      loader.addFragment({
        type: "Contributor",
        frag,
        asResult: "fragments"
      })
    }
  }
}
