import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../cargoLoader/CargoLoader"
import { StepFragment, NewStepFragment, newStepMeta } from "../../isomorphic/fragments/Step"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchSteps(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromStep()
    .where("s.step_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toStepFragment(row)
    loader.modelUpdate.addFragment("Step", data.id, data)
  }
}

export async function fetchProjectSteps(loader: CargoLoader, projectIdList: number[]) {
  let cn = await getDbConnection()
  let sql = selectFromStep()
  sql.where("s.project_id", "in", projectIdList)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toStepFragment(row)
    loader.modelUpdate.addFragment("Step", frag.id, frag)
  }
}

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

export async function createStep(loader: CargoLoader, newFrag: NewStepFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(newFrag, newStepMeta) || {}
  let sql = buildInsert()
    .insertInto("step")
    .values(toSqlValues(newFrag, newStepMeta))
  let ps = await cn.run(sql.toSql()),
    stepId = ps.lastID

  loader.response.setResultFragment("Step", stepId.toString())
  loader.modelUpdate.markFragmentAs("Step", stepId.toString(), "created")
}

// --
// -- Delete
// --

export async function deleteStep(loader: CargoLoader, stepId: string) {
  let cn = await getDbConnection()

  let sql = buildDelete()
    .where("step_id", int(stepId))

  await cn.run(sql.toSql())

  loader.modelUpdate.markFragmentAs("Step", stepId, "deleted")
}
