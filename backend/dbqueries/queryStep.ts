import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { StepFragment, NewStepFragment, newStepMeta } from "../../isomorphic/fragments/Step"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Select
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
    loader.addFragment("Step", data.id, data)
  }
}

function selectFromStep() {
  return buildSelect()
    .select("s.step_id, s.project_id, st.step_type_id, st.name")
    .from("step s")
    .innerJoin("step_type st", "using", "step_type_id")
    .orderBy("st.order_num")
}

function toStepFragment(row): StepFragment {
  let frag: StepFragment = {
    id: row["step_id"].toString(),
    name: row["name"],
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

  loader.setResultFragment("Step", stepId.toString())
}

// --
// -- Delete
// --

export async function deleteStep(loader: CargoLoader, stepId: string) {
  let cn = await getDbConnection()

  let sql = buildDelete()
    .where("step_id", int(stepId))

  await cn.run(sql.toSql())
}
