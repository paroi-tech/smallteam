import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { StepTypeFragment, NewStepTypeFragment, newStepTypeMeta, UpdStepTypeFragment, updStepTypeMeta } from "../../isomorphic/fragments/StepType"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

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
    loader.addFragment("StepType", data.id, data)
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

  let sql = buildInsert()
    .insertInto("step_type")
    .values(toSqlValues(newFrag, newStepTypeMeta))
  let ps = await cn.run(sql.toSql()),
    stepTypeId = ps.lastID

  loader.setResultFragment("StepType", stepTypeId.toString())
}

// --
// -- Update
// --

export async function updateStepType(loader: CargoLoader, updFrag: UpdStepTypeFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(updFrag, updStepTypeMeta, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("step_type")
    .set(values)
    .where(toSqlValues(updFrag, updStepTypeMeta, "onlyId") !)

  await cn.run(sql.toSql())
}
