import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../cargoLoader/CargoLoader"
import { FlagFragment, NewFlagFragment, newFlagMeta, UpdFlagFragment, updFlagMeta, FlagIdFragment } from "../../isomorphic/fragments/Flag"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function queryFlags(loader: CargoLoader) {
  let cn = await getDbConnection()
  let sql = selectFromFlag()
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toFlagFragment(row)
    loader.addFragment({
      type: "Flag",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function fetchFlags(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromFlag()
    .where("flag_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toFlagFragment(row)
    loader.modelUpdate.addFragment("Flag", data.id, data)
  }
}

function selectFromFlag() {
  return buildSelect()
    .select("flag_id, label, color")
    .from("flag")
    .orderBy("label")
}

function toFlagFragment(row): FlagFragment {
  return {
    id: row["flag_id"].toString(),
    label: row["label"],
    color: row["color"]
  }
}

// --
// -- Create
// --

export async function createFlag(loader: CargoLoader, newFrag: NewFlagFragment) {
  let cn = await getDbConnection()

  let sql = buildInsert()
    .insertInto("flag")
    .values(toSqlValues(newFrag, newFlagMeta))
  let ps = await cn.run(sql.toSql()),
    flagId = ps.lastID

  loader.addFragment({
    type: "Flag",
    id: flagId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

// --
// -- Update
// --

export async function updateFlag(loader: CargoLoader, updFrag: UpdFlagFragment) {
  let cn = await getDbConnection()

  let flagId = parseInt(updFrag.id, 10)

  let values = toSqlValues(updFrag, updFlagMeta, "exceptId")
  if (values === null)
    return

  let sql = buildUpdate()
    .update("flag")
    .set(values)
    .where("flag_id", flagId)

  await cn.run(sql.toSql())

  loader.addFragment({
    type: "Flag",
    id: flagId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

// --
// -- Delete
// --

export async function deleteFlag(loader: CargoLoader, frag: FlagIdFragment) {
  let cn = await getDbConnection()

  let sql = buildDelete()
    .deleteFrom("flag")
    .where("flag_id", int(frag.id))

  await cn.run(sql.toSql())

  loader.modelUpdate.markFragmentAs("Flag", frag.id, "deleted")
}
