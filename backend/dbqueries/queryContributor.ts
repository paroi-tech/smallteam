import { randomBytes } from "crypto"
import * as path from "path"
import { BackendContext } from "../backendContext/context"
import contributorMeta, { ContributorFragment, ContributorCreateFragment, ContributorUpdateFragment, ContributorIdFragment } from "../../isomorphic/meta/Contributor"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../utils/sql92builder/Sql92Builder"
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { hash, compare } from "bcrypt"
import { WhoUseItem } from "../../isomorphic/transfers"
import { sendMail } from "../mail"
import { fetchSingleMedia, deleteMedias } from "./queryMedia"
import { select, insert, update, deleteFrom } from "sql-bricks"
import config from "../../isomorphic/config"
import { bcryptSaltRounds, tokenSize } from "../backendConfig"

export async function fetchContributorsByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromContributor()
    .where("contributor_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = await toContributorFragment(context, row)
    context.loader.modelUpdate.addFragment("Contributor", data.id, data)
  }
}

export async function fetchContributors(context: BackendContext) {
  let sql = selectFromContributor().orderBy("name")
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = await toContributorFragment(context, row)
    context.loader.addFragment({
      type: "Contributor",
      frag,
      asResult: "fragments"
    })
  }
}

async function toContributorFragment(context: BackendContext, row): Promise<ContributorFragment> {
  let frag: ContributorFragment = {
    id: row["contributor_id"].toString(),
    name: row["name"],
    login: row["login"],
    email: row["email"],
    role: row["role"]
  }
  let mediaId = await fetchSingleMedia(context, "contributorAvatar", frag.id)
  if (mediaId !== undefined)
    frag.avatarId = mediaId
  return frag
}

function selectFromContributor() {
  return buildSelect()
    .select("contributor_id, login, name, email, role")
    .from("contributor")
}

// --
// -- Who use
// --

export async function whoUseContributor(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id)
  let result = [] as WhoUseItem[]
  let count: number

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
  let passwordHash = await hash("init", bcryptSaltRounds)
  let sql = buildInsert()
    .insertInto("contributor")
    .values(toSqlValues(newFrag, contributorMeta.create))
    .values({ "password": passwordHash })
  let res = await cn.exec(sql.toSql())
  let contributorId = res.getInsertedIdString()

  generateAndSendActivationToken(contributorId, newFrag.email).catch(console.error)
  context.loader.addFragment({
    type: "Contributor",
    id: contributorId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

async function generateAndSendActivationToken(contributorId: string, address: string) {
  let token = randomBytes(tokenSize).toString("hex")
  let host = config.host
  let url  = `${host}${config.urlPrefix}/reset-password.html?token=${encodeURIComponent(token)}&uid=${contributorId}`
  let text = `SmallTeam registration\nPlease follow the link ${url} to activate your account.`
  let html = `<h3>SmallTeam registration</h3> <p>Please follow this <a href="${url}">link</a> to activate your account.</p>`

  let result = await sendMail(address, "SmallTeam account activation", text, html)
  if (!result.done) {
    console.error("Unable to send account activation mail to user", result.error)
    return
  }
  await storeAccountActivationToken(token, contributorId, address)
}

async function storeAccountActivationToken(token: string, contributorId: string, address: string) {
  let query = insert("reg_new", {
    "contributor_id": contributorId,
    "user_email": address,
    "token": token
  })
  await cn.execSqlBricks(query)
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

  await cn.exec(sql.toSql())
}

// --
// -- Delete
// --

export async function deleteContributor(context: BackendContext, frag: ContributorIdFragment) {
  let sql = buildDelete()
    .deleteFrom("contributor")
    .where("contributor_id", int(frag.id))

  await cn.exec(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Contributor", frag.id, "deleted")

  deleteMedias(context, { type: "contributorAvatar", id: frag.id })
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
  await cn.exec(sql.toSql())
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

// --
// -- Types and functions used by 'session.ts', 'invitation.ts' and 'mail.ts'
// --

interface Contributor {
  id: string
  role: string
  login: string
  password: string
}

export async function getContributorById(id: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("contributor_id", id)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

export async function getContributorByLogin(login: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("login", login)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

export async function getContributorByEmail(email: string) {
  let query = select("contributor_id, login, password, role").from("contributor").where("email", email)
  let row = undefined

  try {
    row = await cn.singleRowSqlBricks(query)
  } catch (err) {
    console.log(err)
  }

  return row ? toContributor(row) : undefined
}

function toContributor(row): Contributor {
  return {
    id: row["contributor_id"].toString(),
    role: row["role"],
    login: row["login"],
    password: row["password"]
  }
}
