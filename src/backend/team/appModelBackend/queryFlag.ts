import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { deleteFrom, in as sqlIn, insert, isNotNull, select, update } from "sql-bricks"
import flagMeta, { FlagCreateFragment, FlagFragment, FlagIdFragment, FlagUpdateFragment } from "../../../shared/meta/Flag"
import { WhoUseItem } from "../../../shared/transfers"
import { intVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchFlags(context: ModelContext) {
  let sql = selectFromFlag()
  let rs = await context.cn.all(sql)
  for (let row of rs) {
    let frag = toFlagFragment(row)
    context.loader.addFragment({
      type: "Flag",
      frag,
      asResult: "fragments"
    })
  }
}

export async function fetchFlagsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromFlag()
    .where(sqlIn("flag_id", toIntList(idList)))
  let rs = await context.cn.all(sql)
  for (let row of rs) {
    let data = toFlagFragment(row)
    context.loader.modelUpdate.addFragment("Flag", data.id, data)
  }
}

function selectFromFlag() {
  return select("flag_id, label, color, order_num")
    .from("flag")
    .orderBy("order_num")
}

function toFlagFragment(row): FlagFragment {
  return {
    id: row["flag_id"].toString(),
    label: row["label"],
    color: row["color"],
    orderNum: row["order_num"]
  }
}

// --
// -- Who use
// --

export async function whoUseFlag(context: ModelContext, id: string): Promise<WhoUseItem[]> {
  let sql = select("count(1)").from("task_flag").where("flag_id", id)
  let count = await context.cn.singleValue(sql) as number

  let result = [] as WhoUseItem[]
  if (count > 0)
    result.push({ type: "Task", count })
  return result
}

// --
// -- Create
// --

export async function createFlag(context: ModelContext, newFrag: FlagCreateFragment) {
  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum(context.cn)

  let sql = insert("flag", toSqlValues(newFrag, flagMeta.create))
  let res = await context.cn.exec(sql)
  let flagId = res.getInsertedIdAsString()

  context.loader.addFragment({
    type: "Flag",
    id: flagId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum(cn: DatabaseConnectionWithSqlBricks) {
  let sql = select("max(order_num)").from("flag")
  let max = await cn.singleValue<number>(sql)
  return (max || 0) + 1
  // return rs.length === 1 ? (rs[0][0] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateFlag(context: ModelContext, updFrag: FlagUpdateFragment) {
  let flagId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, flagMeta.update, "exceptId")
  if (values === null)
    return

  let sql = update("flag", values).where("flag_id", flagId)
  await context.cn.exec(sql)

  context.loader.addFragment({
    type: "Flag",
    id: flagId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

// --
// -- Delete
// --

export async function deleteFlag(context: ModelContext, frag: FlagIdFragment) {
  let sql = deleteFrom("flag").where("flag_id", intVal(frag.id))
  await context.cn.exec(sql)
  context.loader.modelUpdate.markFragmentAs("Flag", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderFlags(context: ModelContext, idList: string[]) {
  let oldNums = await loadOrderNums(context.cn)
  let curNum = 0
  for (let idStr of idList) {
    let id = intVal(idStr)
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Flag", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Flag", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Flag", idList)
}

async function updateOrderNum(cn: DatabaseConnectionWithSqlBricks, flagId: number, orderNum: number) {
  let sql = update("flag", { "order_num": orderNum }).where("flag_id", flagId)
  await cn.exec(sql)
}

async function loadOrderNums(cn: DatabaseConnectionWithSqlBricks): Promise<Map<number, number>> {
  let sql = select("flag_id, order_num")
    .from("flag")
    .where(isNotNull("order_num"))
  let rs = await cn.all(sql)
  let orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(intVal(row["flag_id"]), intVal(row["order_num"]))
  return orderNums
}
