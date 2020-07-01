import { SBMainConnection } from "@ladc/sql-bricks-modifier"
import accountMeta, { AccountCreateFragment, AccountFragment, AccountIdFragment, AccountUpdateFragment } from "@smallteam/shared/dist/meta/Account"
import { WhoUseItem } from "@smallteam/shared/dist/transfers"
import { hash } from "bcrypt"
import { deleteFrom, in as sqlIn, insert, select, update } from "sql-bricks"
import { BCRYPT_SALT_ROUNDS } from "../../context"
import { intVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { deleteMedias, fetchSingleMedia } from "./queryMedia"

type DbCn = SBMainConnection

export async function fetchAccountsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  const sql = selectFromAccount().where(sqlIn("account_id", toIntList(idList)))
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const data = await toAccountFragment(context, row)
    context.loader.modelUpdate.addFragment("Account", data.id, data)
  }
}

export async function fetchAccounts(context: ModelContext) {
  const sql = selectFromAccount().orderBy("name")
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const frag = await toAccountFragment(context, row)
    context.loader.addFragment({
      type: "Account",
      frag,
      asResult: "fragments"
    })
  }
}

async function toAccountFragment(context: ModelContext, row): Promise<AccountFragment> {
  const frag: AccountFragment = {
    id: row["account_id"].toString(),
    name: row["name"],
    login: row["login"],
    email: row["email"],
    role: row["role"]
  }
  const mediaId = await fetchSingleMedia(context, "accountAvatar", frag.id)

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
  const dbId = intVal(id)
  const result = [] as WhoUseItem[]
  let count: number

  count = await context.cn.singleValue(select("count(1)").from("task").where("created_by", dbId)) as number
  count += await context.cn.singleValue(select("count(1)").from("task_affected_to").where("account_id", dbId)) as number
  if (count > 0)
    result.push({ type: "Task", count })

  count = await context.cn.singleValue(select("count(1)").from("task_log").where("account_id", dbId)) as number
  if (count > 0)
    result.push({ type: "TaskLogEntry", count })

  return result
}

// --
// -- Create
// --

export async function createAccount(context: ModelContext, newFrag: AccountCreateFragment) {
  const passwordHash = await hash("init", BCRYPT_SALT_ROUNDS)
  const sql = insert("account", toSqlValues(newFrag, accountMeta.create)).values({ "password": passwordHash })
  const res = await context.cn.exec(sql)
  const accountId = res.getInsertedIdAsString()

  context.loader.addFragment({
    type: "Account",
    id: accountId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

// --
// -- Update
// --

export async function updateAccount(context: ModelContext, updFrag: AccountUpdateFragment) {
  const accountId = parseInt(updFrag.id, 10)

  const values = toSqlValues(updFrag, accountMeta.update, "exceptId")
  if (values === null)
    return
  const sql = update("account", values).where("account_id", accountId) // FIXME: Update this after fixing bug with with toSqlValues

  context.loader.addFragment({
    type: "Account",
    id: accountId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await context.cn.exec(sql)
}

// --
// -- Delete
// --

export async function deleteAccount(context: ModelContext, frag: AccountIdFragment) {
  const sql = deleteFrom("account").where("account_id", intVal(frag.id))

  await context.cn.exec(sql)
  context.loader.modelUpdate.markFragmentAs("Account", frag.id, "deleted")
  await deleteMedias(context, { type: "accountAvatar", id: frag.id })
}

// --
// -- Reorder affectedTo tasks
// --

export async function reorderAffectedAccounts(context: ModelContext, idList: string[], taskIdStr: string) {
  const taskId = intVal(taskIdStr)

  const oldNums = await loadAffectedOrderNums(context.cn, taskId)
  let curNum = 0
  for (const idStr of idList) {
    const id = intVal(idStr)
    const oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateAffectedOrderNum(context.cn, id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Account", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  const remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (const id of remaining) {
    const oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateAffectedOrderNum(context.cn, id, taskId, curNum)
      context.loader.modelUpdate.addPartial("Account", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Account", idList)
}

async function updateAffectedOrderNum(cn: DbCn, accountId: number, taskId: number, orderNum: number) {
  const sql = update("task_affected_to", { "order_num": orderNum }).where({
    "account_id": accountId,
    "task_id": taskId
  })
  await cn.exec(sql)
}

async function loadAffectedOrderNums(cn: DbCn, taskId: number): Promise<Map<number, number>> {
  const sql = select("account_id, order_num")
    .from("task_affected_to")
    .where("c.task_id", taskId)
  const rs = await cn.all(sql)
  const orderNums = new Map<number, number>()
  for (const row of rs)
    orderNums.set(row["account_id"] as number, row["order_num"] as number)
  return orderNums
}
