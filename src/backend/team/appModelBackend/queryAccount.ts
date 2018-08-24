import { randomBytes } from "crypto"
import { ModelContext } from "./backendContext/context"
import accountMeta, { AccountFragment, AccountCreateFragment, AccountUpdateFragment, AccountIdFragment } from "../../../shared/meta/Account"
import { toIntList, int } from "../../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { hash } from "bcrypt"
import { WhoUseItem } from "../../../shared/transfers"
import { sendMail } from "../../mail"
import { fetchSingleMedia, deleteMedias } from "./queryMedia"
import { select, insert, update, deleteFrom, in as sqlIn } from "sql-bricks"
import { bcryptSaltRounds, tokenSize } from "../../backendConfig"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { getTeamSiteUrl } from "../../utils/serverUtils"
import { log } from "../../utils/log"

type DbCn = DatabaseConnectionWithSqlBricks

export async function fetchAccountsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromAccount().where(sqlIn("account_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let data = await toAccountFragment(context, row)
    context.loader.modelUpdate.addFragment("Account", data.id, data)
  }
}

export async function fetchAccounts(context: ModelContext) {
  let sql = selectFromAccount().orderBy("name")
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let frag = await toAccountFragment(context, row)
    context.loader.addFragment({
      type: "Account",
      frag,
      asResult: "fragments"
    })
  }
}

async function toAccountFragment(context: ModelContext, row): Promise<AccountFragment> {
  let frag: AccountFragment = {
    id: row["account_id"].toString(),
    name: row["name"],
    login: row["login"],
    email: row["email"],
    role: row["role"]
  }
  let mediaId = await fetchSingleMedia(context, "accountAvatar", frag.id)
  if (mediaId !== undefined)
    frag.avatarId = mediaId
  return frag
}

function selectFromAccount() {
  return select("account_id, login, name, email, role").from("account")
}

// --
// -- Who use
// --

export async function whoUseAccount(context: ModelContext, id: string): Promise<WhoUseItem[]> {
  let dbId = int(id)
  let result = [] as WhoUseItem[]
  let count: number

  count = await context.cn.singleValueSqlBricks(select("count(1)").from("task").where("created_by", dbId))
  count += await context.cn.singleValueSqlBricks(select("count(1)").from("task_affected_to").where("account_id", dbId))
  if (count > 0)
    result.push({ type: "Task", count })

  count = await context.cn.singleValueSqlBricks(select("count(1)").from("task_log").where("account_id", dbId))
  if (count > 0)
    result.push({ type: "TaskLogEntry", count })

  return result
}

// --
// -- Create
// --

export async function createAccount(context: ModelContext, newFrag: AccountCreateFragment) {
  let passwordHash = await hash("init", bcryptSaltRounds)
  let sql = insert("account", toSqlValues(newFrag, accountMeta.create)).values({ "password": passwordHash })
  let res = await context.cn.execSqlBricks(sql)
  let accountId = res.getInsertedIdString()

  generateAndSendActivationToken(context, accountId, newFrag.email).catch(err => log.error(err))
  context.loader.addFragment({
    type: "Account",
    id: accountId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

async function generateAndSendActivationToken(context: ModelContext, accountId: string, to: string) {
  let token = randomBytes(tokenSize).toString("hex")
  let url  = `${getTeamSiteUrl(context)}/reset-password?token=${encodeURIComponent(token)}&uid=${accountId}`
  let html = `<h3>SmallTeam registration</h3>
<p>Please follow this <a href="${url}">link</a> to activate your account.</p>`

  let result = await sendMail({
    to,
    subject: "Activate Your Account",
    html
  })
  if (!result.done) {
    log.error("Unable to send account activation mail to user", result.errorMsg)
    return
  }
  await storeAccountActivationToken(context, token, accountId, to)
}

async function storeAccountActivationToken(context: ModelContext, token: string, accountId: string, address: string) {
  let sql = insert("reg_new", {
    "account_id": accountId,
    "user_email": address,
    "token": token
  })
  await context.cn.execSqlBricks(sql)
}

// --
// -- Update
// --

export async function updateAccount(context: ModelContext, updFrag: AccountUpdateFragment) {
  let accountId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, accountMeta.update, "exceptId")
  if (values === null)
    return
  let sql = update("account", values).where("account_id", accountId) // FIXME: Update this after fixing bug with with toSqlValues

  context.loader.addFragment({
    type: "Account",
    id: accountId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await context.cn.execSqlBricks(sql)
}

// --
// -- Delete
// --

export async function deleteAccount(context: ModelContext, frag: AccountIdFragment) {
  let sql = deleteFrom("account").where("account_id", int(frag.id))

  await context.cn.execSqlBricks(sql)
  context.loader.modelUpdate.markFragmentAs("Account", frag.id, "deleted")
  deleteMedias(context, { type: "accountAvatar", id: frag.id })
}

// --
// -- Reorder affectedTo tasks
// --

export async function reorderAffectedAccounts(context: ModelContext, idList: string[], taskIdStr: string) {
  let taskId = int(taskIdStr)

  let oldNums = await loadAffectedOrderNums(context.cn, taskId)
  let curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateAffectedOrderNum(context.cn, id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Account", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateAffectedOrderNum(context.cn, id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Account", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Account", idList)
}

async function updateAffectedOrderNum(cn: DbCn, accountId: number, taskId: number, orderNum: number) {
  let sql = update("task_affected_to", { "order_num": orderNum }).where({
    "account_id": accountId,
    "task_id": taskId
  })
  await cn.execSqlBricks(sql)
}

async function loadAffectedOrderNums(cn: DbCn, taskId: number): Promise<Map<number, number>> {
  let sql = select("account_id, order_num")
              .from("task_affected_to")
              .where("c.task_id", taskId)
  let rs = await cn.allSqlBricks(sql)
  let orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["account_id"], row["order_num"])
  return orderNums
}
