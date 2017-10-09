import * as path from "path"
import * as sqlite from "sqlite"
import { BackendContext } from "../backendContext/context"
import { StepFragment, NewStepFragment, StepIdFragment, newStepMeta } from "../../isomorphic/fragments/Step"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchSteps(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromStep()
    .where("s.step_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toStepFragment(row)
    context.loader.modelUpdate.addFragment("Step", data.id, data)
  }
}

export async function fetchStepsByProjects(context: BackendContext, projectIdList: number[]) {
  let cn = await getDbConnection()
  let sql = selectFromStep()
  sql.where("s.project_id", "in", projectIdList)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toStepFragment(row)
    context.loader.modelUpdate.addFragment("Step", frag.id, frag)
  }
}

// export async function markAsUpdatedStepsByType(context: BackendContext, stepTypeId: number) {
//   let cn = await getDbConnection()
//   let sql = selectFromStep().where("s.step_type_id", stepTypeId)
//   let rs = await cn.all(sql.toSql())
//   for (let row of rs) {
//     let frag = toStepFragment(row)
//     loader.addFragment({
//       type: "Step",
//       id: frag.id,
//       markAs: "updated",
//       frag
//     })
//   }
// }

function selectFromStep() {
  return buildSelect()
    .select("s.step_id, s.project_id, st.step_type_id, st.name, st.order_num")
    .from("step s")
    .innerJoin("step_type st", "using", "step_type_id")
    .orderBy("st.order_num")
}

function toStepFragment(row): StepFragment {
  let frag: StepFragment = {
    id: row["step_id"].toString(),
    name: row["name"],
    orderNum: row["order_num"],
    typeId: row["step_type_id"].toString(),
    projectId: row["project_id"].toString()
  }
  return frag
}

// --
// -- Create
// --

export async function createStep(context: BackendContext, newFrag: NewStepFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(newFrag, newStepMeta) || {}
  let sql = buildInsert()
    .insertInto("step")
    .values(toSqlValues(newFrag, newStepMeta))
  let ps = await cn.run(sql.toSql()),
    stepId = ps.lastID

  context.loader.addFragment({
    type: "Step",
    id: stepId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
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
