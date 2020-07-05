import { SBMainConnection } from "@ladc/sql-bricks-modifier"
import stepMeta, { StepCreateFragment, StepFragment, StepIdFragment, StepUpdateFragment } from "@smallteam/shared/dist/meta/Step"
import { WhoUseItem } from "@smallteam/shared/dist/transfers"
import { deleteFrom, in as sqlIn, insert, isNotNull, select, update } from "sql-bricks"
import { intVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchSteps(context: ModelContext) {
  const sql = selectFromStep()
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const frag = toStepFragment(row)
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

  const sql = selectFromStep()
    .where(sqlIn("step_id", toIntList(idList)))
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const data = toStepFragment(row)
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
  const count = await context.cn.singleValue(select("count(1)").from("project_step").where("step_id", id)) as number

  const result = [] as WhoUseItem[]
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

  const sql = insert("step", toSqlValues(newFrag, stepMeta.create))
  const res = await context.cn.exec(sql)
  const stepId = res.getInsertedIdAsString()

  context.loader.addFragment({
    type: "Step",
    id: stepId,
    asResult: "fragment",
    markAs: "created"
  })
}

async function getDefaultOrderNum(cn: SBMainConnection) {
  const sql = select("max(order_num)").from("step")
  const max = await cn.singleValue<number>(sql)
  return (max || 0) + 1
}

// --
// -- Update
// --

export async function updateStep(context: ModelContext, updFrag: StepUpdateFragment) {
  const stepId = parseInt(updFrag.id, 10)

  const values = toSqlValues(updFrag, stepMeta.update, "exceptId")
  if (values === null)
    return

  const sql = update("step", values).where("step_id", stepId)

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
  const sql = deleteFrom("step").where("step_id", intVal(frag.id))
  await context.cn.exec(sql)
  context.loader.modelUpdate.markFragmentAs("Step", frag.id, "deleted")
}

// --
// -- Reorder
// --

export async function reorderSteps(context: ModelContext, idList: string[]) {
  const oldNums = await loadOrderNums(context.cn)
  let curNum = 0
  for (const idStr of idList) {
    const id = intVal(idStr)
    const oldNum = oldNums.get(id)
    if (oldNum !== undefined && ++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
    oldNums.delete(id)
  }
  const remaining = Array.from(oldNums.keys())
  remaining.sort((a, b) => a - b)
  for (const id of remaining) {
    const oldNum = oldNums.get(id)
    if (++curNum !== oldNum) {
      await updateOrderNum(context.cn, id, curNum)
      context.loader.modelUpdate.addPartial("Step", { id: id.toString(), "orderNum": curNum })
    }
  }
  context.loader.modelUpdate.markIdsAsReordered("Step", idList)
}

async function updateOrderNum(cn: SBMainConnection, stepId: number, orderNum: number) {
  const sql = update("step", { "order_num": orderNum }).where("step_id", stepId)
  await cn.exec(sql)
}

async function loadOrderNums(cn: SBMainConnection): Promise<Map<number, number>> {
  const sql = select("step_id, order_num")
    .from("step")
    .where(isNotNull("order_num"))
  const rs = await cn.all(sql)
  const orderNums = new Map<number, number>()
  for (const row of rs)
    orderNums.set(row["step_id"] as number, row["order_num"] as number)
  return orderNums
}
