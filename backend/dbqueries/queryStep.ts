import * as path from "path"
import * as sqlite from "sqlite"
import { BackendContext } from "../backendContext/context"
import stepMeta, { StepFragment, StepCreateFragment, StepUpdateFragment, StepIdFragment } from "../../isomorphic/meta/Step"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int, fetchOneValue } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { WhoUseItem } from "../../isomorphic/transfers";

// --
// -- Read
// --

export async function fetchSteps(context: BackendContext) {
  let cn = await getDbConnection()
  let sql = selectFromStep()
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toStepFragment(row)
    context.loader.addFragment({
      type: "Step",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function fetchStepsByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromStep()
    .where("step_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toStepFragment(row)
    context.loader.modelUpdate.addFragment("Step", data.id, data)
  }
}

function selectFromStep() {
  return buildSelect()
    .select("step_id, label, order_num")
    .from("step")
    .orderBy("order_num")
}

function toStepFragment(row): StepFragment {
  return {
    id: row["step_id"].toString(),
    label: row["label"],
    orderNum: row["order_num"]
  }
}

// --
// -- Who use
// --

export async function whoUseStep(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id),
    result: WhoUseItem[] = [],
    count: number

  count = await fetchOneValue(buildSelect().select("count(1)").from("project_step").where("step_id", dbId).toSql())
  if (count > 0)
    result.push({ type: "Project", count })

  return result
}

// --
// -- Create
// --

export async function createStep(context: BackendContext, newFrag: StepCreateFragment) {
  let cn = await getDbConnection()

  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum()

  let sql = buildInsert()
    .insertInto("step")
    .values(toSqlValues(newFrag, stepMeta.create))
  let ps = await cn.run(sql.toSql()),
    stepId = ps.lastID

  context.loader.addFragment({
    type: "Step",
    id: stepId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum() {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("max(order_num) as max")
    .from("step")
  let rs = await cn.all(sql.toSql())
  return rs.length === 1 ? (rs[0]["max"] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateStep(context: BackendContext, updFrag: StepUpdateFragment) {
  let cn = await getDbConnection()

  let stepId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, stepMeta.update, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("step")
    .set(values)
    .where("step_id", stepId)

  context.loader.addFragment({
    type: "Step",
    id: stepId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await cn.run(sql.toSql())
}

// --
// -- Delete
// --

export async function deleteStep(context: BackendContext, frag: StepIdFragment) {
  let cn = await getDbConnection()

  let sql = buildDelete()
    .deleteFrom("step")
    .where("step_id", int(frag.id))

  await cn.run(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Step", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderSteps(context: BackendContext, idList: string[]) {
  let cn = await getDbConnection()

  let oldNums = await loadOrderNums(),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Step", idList)
}

async function updateOrderNum(stepId: number, orderNum: number) {
  let cn = await getDbConnection()
  let sql = buildUpdate()
    .update("step")
    .set({
      "order_num": orderNum
    })
    .where("step_id", stepId)
  await cn.run(sql.toSql())
}

async function loadOrderNums(): Promise<Map<number, number>> {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("step_id, order_num")
    .from("step")
    .where("order_num is not null")
  let rs = await cn.all(sql.toSql()),
    orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["step_id"], row["order_num"])
  return orderNums
}
