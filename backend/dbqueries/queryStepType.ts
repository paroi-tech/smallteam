import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { StepTypeFragment, NewStepTypeFragment, newStepTypeMeta, UpdStepTypeFragment, updStepTypeMeta } from "../../isomorphic/fragments/StepType"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function queryStepTypes(loader: CargoLoader) {
  let cn = await getDbConnection()
  let sql = selectFromStepType()
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toStepTypeFragment(row)
    loader.addToResultFragments("StepType", frag.id, frag)
  }
}

export async function fetchStepTypes(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromStepType()
    .where("step_type_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toStepTypeFragment(row)
    loader.updateModelAddFragment("StepType", data.id, data)
  }
}

function selectFromStepType() {
  return buildSelect()
    .select("step_type_id, name, order_num")
    .from("step_type")
    .orderBy("order_num")
}

function toStepTypeFragment(row): StepTypeFragment {
  return {
    id: row["step_type_id"].toString(),
    name: row["name"],
    orderNum: row["order_num"]
  }
}

// --
// -- Create
// --

export async function createStepType(loader: CargoLoader, newFrag: NewStepTypeFragment) {
  let cn = await getDbConnection()

  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum()

  let sql = buildInsert()
    .insertInto("step_type")
    .values(toSqlValues(newFrag, newStepTypeMeta))
  let ps = await cn.run(sql.toSql()),
    stepTypeId = ps.lastID

  loader.setResultFragment("StepType", stepTypeId.toString())
  loader.updateModelMarkFragmentAs("StepType", stepTypeId.toString(), "created")
}

async function getDefaultOrderNum() {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("max(order_num) as max")
    .from("step_type")
  let rs = await cn.all(sql.toSql())
  return rs.length === 1 ? (rs[0]["max"] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateStepType(loader: CargoLoader, updFrag: UpdStepTypeFragment) {
  let cn = await getDbConnection()

  let stepTypeId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, updStepTypeMeta, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("step_type")
    .set(values)
    .where("step_type_id", stepTypeId) // toSqlValues(updFrag, updStepTypeMeta, "onlyId") ! FIXME: Find the bug with toSqlValues

  await cn.run(sql.toSql())

  loader.setResultFragment("StepType", stepTypeId.toString())
  loader.updateModelMarkFragmentAs("StepType", stepTypeId.toString(), "updated")
}

// --
// -- Reorder
// --

export async function reorderStepTypes(loader: CargoLoader, idList: string[]) {
  let cn = await getDbConnection()

  let oldNums = await loadOrderNums(),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      loader.updateModelUpdateFields("StepType", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => {
    return a - b
  })
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      loader.updateModelUpdateFields("StepType", { id: id.toString(), "orderNum": curNum })
    }
  }
}

async function updateOrderNum(stepTypeId: number, orderNum: number) {
  let cn = await getDbConnection()
  let sql = buildUpdate()
    .update("step_type")
    .set({
      "order_num": orderNum
    })
    .where("step_type_id", stepTypeId)
  await cn.run(sql.toSql())
}

async function loadOrderNums(): Promise<Map<number, number>> {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("step_type_id, order_num")
    .from("step_type")
    .where("order_num is not null")
  let rs = await cn.all(sql.toSql()),
    orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["step_type_id"], row["order_num"])
  return orderNums
}
