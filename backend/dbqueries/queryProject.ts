import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { ProjectFragment, NewProjectFragment } from "../../isomorphic/fragments/Project"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList } from "./dbUtils"

export async function queryProjects(loader: CargoLoader, filters: Partial<ProjectFragment>) {
  let cn = await getDbConnection()
  let sql = selectFromProject()
  if (filters.archived !== undefined)
    sql.andWhere("p.archived", filters.archived)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toProjectFragment(row)
    loader.addFragment("Project", frag.id, frag)
    loader.addToResultFragments("Project", frag.id)
  }
}

export async function fetchProjects(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromProject()
    .where("p.project_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toProjectFragment(row)
    loader.addFragment("Project", data.id, data)
    loader.addFragment("Task", data.rootTaskId)
  }
}

function selectFromProject() {
  return buildSelect()
    .select("p.project_id, p.code, p.archived, rt.task_id as root_task_id, t.label as name, d.description")
    .from("project p")
    .join("root_task rt", "using", "project_id")
    .join("task t", "using", "task_id")
    .leftJoin("task_description d", "using", "task_id")
}

function toProjectFragment(row): ProjectFragment {
  let frag: ProjectFragment = {
    id: row["project_id"].toString(),
    code: row["code"],
    name: row["name"],
    archived: row["archived"] === 1,
    rootTaskId: row["root_task_id"].toString()
  }
  if (row["description"])
    frag.description = row["description"]
  return frag
}

export async function createProject(loader: CargoLoader, newFrag: NewProjectFragment) {
  let cn = await getDbConnection()

  // Project
  let sql = buildInsert()
    .insertInto("project")
    .values({
      "code": newFrag.code,
      "task_seq": 0
    })
  let ps = await cn.run(sql.toSql()),
    projectId = ps.lastID

  // Step "Not Started"
  sql = buildInsert()
    .insertInto("step")
    .values({
      "step_type_id": 0,
      "project_id": projectId
    })
  ps = await cn.run(sql.toSql())
  let notStartedStepId = ps.lastID

  // Step "Finished"
  sql = buildInsert()
    .insertInto("step")
    .values({
      "step_type_id": 1,
      "project_id": projectId
    })
  await cn.run(sql.toSql())

  // Task
  sql = buildInsert()
    .insertInto("task")
    .values({
      "code": `${newFrag.code}-0`,
      "created_by": 0,
      "cur_step_id": notStartedStepId,
      "label": newFrag.name
    })
  ps = await cn.run(sql.toSql())
  let taskId = ps.lastID

  // Mark as root task
  sql = buildInsert()
    .insertInto("root_task")
    .values({
      "project_id": projectId,
      "task_id": taskId
    })
  await cn.run(sql.toSql())

  // Description
  if (newFrag.description) {
    sql = buildInsert()
      .insertInto("task_description")
      .values({
        "task_id": taskId,
        "description": newFrag.description
      })
    await cn.run(sql.toSql())
  }

  loader.addFragment("Project", projectId.toString())
  loader.setResultFragment("Project", projectId.toString())
}
