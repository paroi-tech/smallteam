import * as path from "path"
import * as sqlite from "sqlite"
import { BackendContext } from "../backendContext/context"
import { FlagFragment, NewFlagFragment, newFlagMeta, UpdFlagFragment, updFlagMeta, FlagIdFragment } from "../../isomorphic/fragments/Flag"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function queryFlags(context: BackendContext) {
  let cn = await getDbConnection()
  let sql = selectFromFlag()
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toFlagFragment(row)
    context.loader.addFragment({
      type: "Flag",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function fetchFlags(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromFlag()
    .where("flag_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toFlagFragment(row)
    context.loader.modelUpdate.addFragment("Flag", data.id, data)
  }
}

function selectFromFlag() {
  return buildSelect()
    .select("flag_id, label, color, order_num")
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
// -- Create
// --

export async function createFlag(context: BackendContext, newFrag: NewFlagFragment) {
  let cn = await getDbConnection()

  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum()

  let sql = buildInsert()
    .insertInto("flag")
    .values(toSqlValues(newFrag, newFlagMeta))
  let ps = await cn.run(sql.toSql()),
    flagId = ps.lastID

  context.loader.addFragment({
    type: "Flag",
    id: flagId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum() {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("max(order_num) as max")
    .from("flag")
  let rs = await cn.all(sql.toSql())
  return rs.length === 1 ? (rs[0]["max"] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateFlag(context: BackendContext, updFrag: UpdFlagFragment) {
  let cn = await getDbConnection()

  let flagId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, updFlagMeta, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("flag")
    .set(values)
    .where("flag_id", flagId)

  await cn.run(sql.toSql())

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
  let cn = await getDbConnection()

  let sql = buildDelete()
    .deleteFrom("flag")
    .where("flag_id", int(frag.id))

  await cn.run(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Flag", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderFlags(context: BackendContext, idList: string[]) {
  let cn = await getDbConnection()

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
  let cn = await getDbConnection()
  let sql = buildUpdate()
    .update("flag")
    .set({
      "order_num": orderNum
    })
    .where("flag_id", flagId)
  await cn.run(sql.toSql())
}

async function loadOrderNums(): Promise<Map<number, number>> {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("flag_id, order_num")
    .from("flag")
    .where("order_num is not null")
  let rs = await cn.all(sql.toSql()),
    orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["flag_id"], row["order_num"])
  return orderNums
}
