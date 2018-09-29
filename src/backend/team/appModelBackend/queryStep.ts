import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import * as path from "path"
import { deleteFrom, in as sqlIn, insert, isNotNull, select, update } from "sql-bricks"
import stepMeta, { StepCreateFragment, StepFragment, StepIdFragment, StepUpdateFragment } from "../../../shared/meta/Step"
import { WhoUseItem } from "../../../shared/transfers"
import { intVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchSteps(context: ModelContext) {
  let sql = selectFromStep()
  let rs = await context.cn.all(sql)
  for (let row of rs) {
    let frag = toStepFragment(row)
    context.loader.addFragment({
      type: "Step",
      frag,
      asResult: "fragments"
    })
  }
}

export async function fetchStepsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return

  let sql = selectFromStep()
    .where(sqlIn("step_id", toIntList(idList)))
  let rs = await context.cn.all(sql)
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

export async function whoUseStep(context: ModelContext, id: string): Promise<WhoUseItem[]> {
  let count = await context.cn.singleValue(select("count(1)").from("project_step").where("step_id", id)) as number

  let result = [] as WhoUseItem[]
  if (count > 0)
    result.push({ type: "Project", count })
  return result
}

// --
// -- Create
// --

export async function createStep(context: ModelContext, newFrag: StepCreateFragment) {
  if (newFrag.orderNum === undefined)
    newFrag.orderNum = await getDefaultOrderNum(context.cn)

  let sql = insert("step", toSqlValues(newFrag, stepMeta.create))
  let res = await context.cn.exec(sql)
  let stepId = res.getInsertedIdAsString()

  context.loader.addFragment({
    type: "Step",
    id: stepId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum(cn: DatabaseConnectionWithSqlBricks) {
  let sql = select("max(order_num)").from("step")
  let max = await cn.singleValue<number>(sql)
  return (max || 0) + 1
}

// --
// -- Update
// --

export async function updateStep(context: ModelContext, updFrag: StepUpdateFragment) {
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

  await context.cn.exec(sql)
}

// --
// -- Delete
// --

export async function deleteStep(context: ModelContext, frag: StepIdFragment) {
  let sql = deleteFrom("step").where("step_id", intVal(frag.id))
  await context.cn.exec(sql)
  context.loader.modelUpdate.markFragmentAs("Step", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderSteps(context: ModelContext, idList: string[]) {
  let oldNums = await loadOrderNums(context.cn)
  let curNum = 0
  for (let idStr of idList) {
    let id = intVal(idStr)
    let oldNum = oldNums.get(id)
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
  await cn.exec(sql)
}

async function loadOrderNums(cn: DatabaseConnectionWithSqlBricks): Promise<Map<number, number>> {
  let sql = select("step_id, order_num")
    .from("step")
    .where(isNotNull("order_num"))
  let rs = await cn.all(sql)
  let orderNums = new Map<number, number>()
  for (let row of rs)
    orderNums.set(row["step_id"] as number, row["order_num"] as number)
  return orderNums
}
