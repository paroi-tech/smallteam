import * as path from "path"
import * as sqlite from "sqlite"
import { BackendContext } from "../backendContext/context"
import contributorMeta, { ContributorFragment, ContributorCreateFragment, ContributorUpdateFragment, ContributorIdFragment } from "../../isomorphic/meta/Contributor"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../utils/sql92builder/Sql92Builder"
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { hash, compare } from "bcrypt"
import { WhoUseItem } from "../../isomorphic/transfers"

const saltRounds = 10

export async function fetchContributorsByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromContributor()
    .where("contributor_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toContributorFragment(row)
    context.loader.modelUpdate.addFragment("Contributor", data.id, data)
  }
}

export async function fetchContributors(context: BackendContext) {
  let sql = selectFromContributor()
    .orderBy("name")
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toContributorFragment(row)
    context.loader.addFragment({
      type: "Contributor",
      frag,
      asResult: "fragments"
    })
  }
}

function toContributorFragment(row): ContributorFragment {
  return {
    id: row["contributor_id"].toString(),
    name: row["name"],
    login: row["login"],
    email: row["email"]
  }
}

function selectFromContributor() {
  return buildSelect()
    .select("contributor_id, login, name, email")
    .from("contributor")
}

// --
// -- Who use
// --

export async function whoUseContributor(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id),
    result: WhoUseItem[] = [],
    count: number

  count = await cn.singleValue(buildSelect().select("count(1)").from("task").where("created_by", dbId).toSql())
  count += await cn.singleValue(buildSelect().select("count(1)").from("task_affected_to").where("contributor_id", dbId).toSql())
  if (count > 0)
    result.push({ type: "Task", count })

  count = await cn.singleValue(buildSelect().select("count(1)").from("task_log").where("contributor_id", dbId).toSql())
  if (count > 0)
    result.push({ type: "TaskLogEntry", count })

  return result
}

// --
// -- Create
// --

export async function createContributor(context: BackendContext, newFrag: ContributorCreateFragment) {
  let passwordHash = await hash("init", saltRounds)
  let sql = buildInsert()
    .insertInto("contributor")
    .values(toSqlValues(newFrag, contributorMeta.create))
    .values({ "password": passwordHash })
  let ps = await cn.run(sql.toSql())
  let contributorId = ps.lastID
  context.loader.addFragment({
    type: "Contributor",
    id: contributorId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

// --
// -- Update
// --

export async function updateContributor(context: BackendContext, updFrag: ContributorUpdateFragment) {
  let contributorId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, contributorMeta.update, "exceptId")
  if (values === null)
    return
  let sql = buildUpdate()
    .update("contributor")
    .set(values)
    .where("contributor_id", contributorId) // FIXME: Update this after fixing bug with with toSqlValues

  context.loader.addFragment({
    type: "Contributor",
    id: contributorId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await cn.run(sql.toSql())
}

// --
// -- Delete
// --

export async function deleteContributor(context: BackendContext, frag: ContributorIdFragment) {
  let sql = buildDelete()
    .deleteFrom("contributor")
    .where("contributor_id", int(frag.id))

  await cn.run(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Contributor", frag.id, "deleted")
}

// --
// -- Reorder affectedTo tasks
// --

export async function reorderAffectedContributors(context: BackendContext, idList: string[], taskIdStr: string) {
  let taskId = int(taskIdStr)

  let oldNums = await loadAffectedOrderNums(taskId),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateAffectedOrderNum(id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Contributor", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateAffectedOrderNum(id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Contributor", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Contributor", idList)
}

async function updateAffectedOrderNum(contributorId: number, taskId: number, orderNum: number) {
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

