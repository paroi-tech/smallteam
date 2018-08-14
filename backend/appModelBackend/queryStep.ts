import * as path from "path"
import { BackendContext } from "./backendContext/context"
import stepMeta, { StepFragment, StepCreateFragment, StepUpdateFragment, StepIdFragment } from "../../isomorphic/meta/Step"
import { toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { WhoUseItem } from "../../isomorphic/transfers"
import { select, insert, update, deleteFrom, in as sqlIn, isNotNull } from "sql-bricks"
import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks";

// --
// -- Read
// --

export async function fetchSteps(context: BackendContext) {
  let sql = selectFromStep()
  let rs = await context.cn.allSqlBricks(sql)
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

  let sql = selectFromStep()
    .where(sqlIn("step_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let data = toStepFragment(row)
    context.loader.modelUpdate.addFragment("Step", data.id, data)
  }
}

function selectFromStep() {
  return select("step_id, label, order_num")
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

export async function whoUseStep(context: BackendContext, id: string): Promise<WhoUseItem[]> {
  let dbId = int(id)
  let result = [] as WhoUseItem[]
  let count = 0

  count = await context.cn.singleValueSqlBricks(select("count(1)").from("project_step").where("step_id", dbId))
  if (count > 0)
    result.push({ type: "Project", count })

  return result
}

// --
// -- Create
// --

export async function createStep(context: BackendContext, newFrag: StepCreateFragment) {
  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum(context.cn)

  let sql = insert("step", toSqlValues(newFrag, stepMeta.create))
  let res = await context.cn.execSqlBricks(sql)
  let stepId = res.getInsertedIdString()

  context.loader.addFragment({
    type: "Step",
    id: stepId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum(cn: DatabaseConnectionWithSqlBricks) {
  let sql = select("max(order_num)").from("step")
  let rs = await cn.allSqlBricks(sql)
  return rs.length === 1 ? (rs[0][0] || 0) + 1 : 1
}

// --
// -- Update
// --

export async function updateStep(context: BackendContext, updFrag: StepUpdateFragment) {
  let stepId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, stepMeta.update, "exceptId")
  if (values === null)
    return

  let sql = update("step", values).where("step_id", stepId)

  context.loader.addFragment({
    type: "Step",
    id: stepId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })

  await context.cn.execSqlBricks(sql)
}

// --
// -- Delete
// --

export async function deleteStep(context: BackendContext, frag: StepIdFragment) {
  let sql = deleteFrom("step").where("step_id", int(frag.id))
  await context.cn.execSqlBricks(sql)
  context.loader.modelUpdate.markFragmentAs("Step", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderSteps(context: BackendContext, idList: string[]) {
  let oldNums = await loadOrderNums(context.cn),
    curNum = 0
  for (let idStr of idList) {
    let id = int(idStr),
      oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  let remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (let id of remaining) {
    let oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Step", idList)
}

async function updateOrderNum(cn: DatabaseConnectionWithSqlBricks, stepId: number, orderNum: number) {
  let sql = update("step", { "order_num": orderNum }).where("step_id", stepId)
  await cn.execSqlBricks(sql)
}

async function loadOrderNums(cn: DatabaseConnectionWithSqlBricks): Promise<Map<number, number>> {
  let sql = select("step_id, order_num")
    .from("step")
    .where(isNotNull("order_num"))
  let rs = await cn.allSqlBricks(sql)
  let orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["step_id"], row["order_num"])
  return orderNums
}
