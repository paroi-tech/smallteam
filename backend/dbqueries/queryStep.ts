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
    code: row["code"],
    label: row["label"],
    createdById: row["created_by"].toString(),
    curStepId: row["cur_step_id"].toString(),
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
  }
  if (row["description"])
    frag.description = row["description"]
  if (row["affected_to"] !== null)
    frag.affectedToId = row["affected_to"].toString()
  return frag
}

// --
// -- Create
// --

export async function createStep(loader: CargoLoader, newFrag: NewStepFragment) {
  let cn = await getDbConnection()

  // Step
  let values = toSqlValues(newFrag, newStepMeta) || {}
  values.code = await makeStepCodeFromStep(int(newFrag.curStepId))
  let sql = buildInsert()
    .insertInto("step")
    .values(values)
  let ps = await cn.run(sql.toSql()),
    stepId = ps.lastID

  // Description
  if (newFrag.description) {
    sql = buildInsert()
      .insertInto("step_description")
      .values({
        "step_id": stepId,
        "description": newFrag.description
      })
    await cn.run(sql.toSql())
  }

  loader.setResultFragment("Step", stepId.toString())
}

// --
// -- Update
// --

export async function updateStep(loader: CargoLoader, updFrag: UpdStepFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(updFrag, updStepMeta, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("step")
    .set(values)
    .where(toSqlValues(updFrag, updStepMeta, "onlyId")!)

  // Description
  if (updFrag.description) {
    // TODO: insert or update the description
    // sql = buildInsert()
    //   .insertInto("step_description")
    //   .values({
    //     "step_id": stepId,
    //     "description": updFrag.description
    //   })
    // await cn.run(sql.toSql())
  }
}
