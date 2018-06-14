import { BackendContext } from "./backendContext/context"
import flagMeta, { FlagFragment, FlagCreateFragment, FlagUpdateFragment, FlagIdFragment } from "../../isomorphic/meta/Flag"
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { WhoUseItem } from "../../isomorphic/transfers"
import { select, insert, update, deleteFrom, in as sqlIn, isNotNull } from "sql-bricks"

// --
// -- Read
// --

export async function fetchFlags(context: BackendContext) {
  let sql = selectFromFlag()
  let rs = await cn.allSqlBricks(sql)
  for (let row of rs) {
    let frag = toFlagFragment(row)
    context.loader.addFragment({
      type: "Flag",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function fetchFlagsByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromFlag()
    .where(sqlIn("flag_id", toIntList(idList)))
  let rs = await cn.allSqlBricks(sql)
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

export async function whoUseFlag(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id)
  let result = [] as WhoUseItem[]
  let count = 0

  let sql = select("count(1)").from("task_flag").where("flag_id", dbId)
  count = await cn.singleValueSqlBricks(sql)
  if (count > 0)
    result.push({ type: "Task", count })

  return result
}

// --
// -- Create
// --

export async function createFlag(context: BackendContext, newFrag: FlagCreateFragment) {
  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum()

  let sql = insert("flag", toSqlValues(newFrag, flagMeta.create))
  let res = await cn.execSqlBricks(sql)
  let flagId = res.getInsertedIdString()

  context.loader.addFragment({
    type: "Flag",
    id: flagId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum() {
  let sql = select("max(order_num)").from("flag")
  let rs = await cn.allSqlBricks(sql)
  return rs.length === 1 ? (rs[0][0] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateFlag(context: BackendContext, updFrag: FlagUpdateFragment) {
  let flagId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, flagMeta.update, "exceptId")
  if (values === null)
    return

  let sql = update("flag", values).where("flag_id", flagId)
  await cn.execSqlBricks(sql)

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

export async function deleteFlag(context: BackendContext, frag: FlagIdFragment) {
  let sql = deleteFrom("flag").where("flag_id", int(frag.id))
  await cn.execSqlBricks(sql)
  context.loader.modelUpdate.markFragmentAs("Flag", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderFlags(context: BackendContext, idList: string[]) {
  let oldNums = await loadOrderNums(),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      context.loader.modelUpdate.addPartial("Flag", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      context.loader.modelUpdate.addPartial("Flag", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Flag", idList)
}

async function updateOrderNum(flagId: number, orderNum: number) {
  let sql = update("flag", { "order_num": orderNum }).where("flag_id", flagId)
  await cn.execSqlBricks(sql)
}

async function loadOrderNums(): Promise<Map<number, number>> {
  let sql = select("flag_id, order_num")
    .from("flag")
    .where(isNotNull("order_num"))
  let rs = await cn.allSqlBricks(sql)
  let orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["flag_id"], row["order_num"])
  return orderNums
}
