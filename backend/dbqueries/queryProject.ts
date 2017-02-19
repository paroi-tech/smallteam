import * as path from "path"
//import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { ProjectFragment, NewProjectFragment, newProjectMeta, UpdProjectFragment, updProjectMeta, ProjectQuery } from "../../isomorphic/fragments/Project"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { getDbConnection, toIntList } from "./dbUtils"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { fetchProjectTasks, updateTaskDescription } from "./queryTask"
import { fetchProjectSteps } from "./queryStep"

// --
// -- Read
// --

export async function queryProjects(loader: CargoLoader, filters: ProjectQuery) {
  let cn = await getDbConnection()
  let sql = selectFromProject()
  if (filters.archived !== undefined)
    sql.andWhere("p.archived", filters.archived)
  if (filters.code)
    sql.andWhere("p.code", "like", `%${filters.code}%`)
  if (filters.name)
    sql.andWhere("t.label", "like", `%${filters.name}%`)
  if (filters.description)
    sql.andWhere("d.description", "like", `%${filters.description}%`)
//   if (filters.search) {
//     sql.andWhere("d.description", "like", `%${filters.description}%`) // TODO: build search criterion

//     filter = buildFilter("and" | "or")
//       .add()
//     sql.andWhere(filter)
//     sql.andWhere(filter.clone("and" | "or").replaceValuesWith(filters.search))
// // {[filterSymbol]: any}

//   }
  let rs = await cn.all(sql.toSql()),
    projectIdList: number[] = []
  for (let row of rs) {
    let frag = toProjectFragment(row)
    loader.addToResultFragments("Project", frag.id, frag)
    loader.updateModelAddFragment("Task", frag.rootTaskId)
    projectIdList.push(row["project_id"])
  }
  await fetchProjectSteps(loader, projectIdList)
  await fetchProjectTasks(loader, projectIdList)
}

export async function fetchProjects(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromProject()
    .where("p.project_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toProjectFragment(row)
    loader.updateModelAddFragment("Project", frag.id, frag)
    loader.updateModelAddFragment("Task", frag.rootTaskId)
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

// --
// -- Create
// --

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
      "step_type_id": 1,
      "project_id": projectId
    })
  ps = await cn.run(sql.toSql())
  let notStartedStepId = ps.lastID

  // Step "Archived"
  sql = buildInsert()
    .insertInto("step")
    .values({
      "step_type_id": 2,
      "project_id": projectId
    })
  await cn.run(sql.toSql())

  // Task
  sql = buildInsert()
    .insertInto("task")
    .values({
      "code": `${newFrag.code}-0`,
      "created_by": 1,
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

  loader.setResultFragment("Project", projectId.toString())
  loader.updateModelMarkFragmentAs("Project", projectId.toString(), "created")

  loader.updateModelAddFragment("Task", taskId.toString())
}

// --
// -- Update
// --

export async function updateProject(loader: CargoLoader, updFrag: UpdProjectFragment) {
  let cn = await getDbConnection()

  let projectId = parseInt(updFrag.id, 10)

  let valuesToUpd = toSqlValues(updFrag, updProjectMeta, "exceptId")
  if (valuesToUpd) {
    if (updFrag.code !== undefined && await hasTasks(projectId))
      throw new Error(`Cannot update the project "${updFrag.id}" because it has tasks`)
    let sql = buildUpdate()
      .update("project")
      .set(valuesToUpd)
      .where(toSqlValues(updFrag, updProjectMeta, "onlyId"))
    await cn.run(sql.toSql())
  }

  if (updFrag.name !== undefined || updFrag.description !== undefined) {
    let taskId = await getRootTaskId(projectId)

    if (updFrag.description !== undefined)
      updateTaskDescription(taskId, updFrag.description)

    let sql = buildUpdate()
      .update("task")
      .set({
        update_ts: { "vanilla": "current_timestamp" }
      })
      .where("task_id", taskId)
    if (updFrag.name !== undefined)
      sql.set({ label: updFrag.name })
    await cn.run(sql.toSql())
    loader.updateModelAddFragment("Task", taskId.toString())
  }

  loader.setResultFragment("Project", projectId.toString())
  loader.updateModelMarkFragmentAs("Project", projectId.toString(), "updated")
}

async function hasTasks(projectId: number) {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("count(t.task_id) as task_count")
    .from("task t")
    .innerJoin("step s", "on", "t.cur_step_id = s.step_id")
    .where("s.project_id", projectId)
  let rs = await cn.all(sql.toSql())
  return rs[0]["task_count"] > 0
}

async function getRootTaskId(projectId: number) {
  let cn = await getDbConnection()
  let sql = buildSelect()
    .select("task_id")
    .from("root_task")
    .where("project_id", projectId)
  let rs = await cn.all(sql.toSql())
  if (rs.length !== 1)
    throw new Error(`Missing root task for the project "${projectId}"`)
  return rs[0]["task_id"]
}



// --
// -- Utils
// --

export async function makeTaskCodeFromStep(stepId: number): Promise<string> {
  let cn = await getDbConnection()

  // Select project_id, code
  let sql = buildSelect()
    .select("p.project_id, p.code")
    .from("project p")
    .innerJoin("step", "using", "project_id")
    .where("step_id", stepId)
  let rs = await cn.all(sql.toSql())
  if (rs.length !== 1)
    throw new Error(`Cannot find the step "${stepId}"`)
  let projectId = rs[0]["project_id"],
    code = rs[0]["code"]

  // Update the sequence
  let ps: /* sqlite.Statement */ any | undefined,
    tries = 0,
    prevSeqVal: number
  do {
    if (tries++ >= 10)
      throw new Error(`Cannot get a new sequence value for project "${projectId}, (last changes: ${ps!.changes})"`)
    // Select previous task_seq
    let sql = buildSelect()
      .select("task_seq")
      .from("project")
      .where("project_id", projectId)
    let rs = await cn.all(sql.toSql())
    if (rs.length !== 1)
      throw new Error(`Cannot find the project "${projectId}"`)
    prevSeqVal = rs[0]["task_seq"]

    // Increment the task_seq
    let upd = buildUpdate()
      .update("project")
      .set({
        "task_seq": { "vanilla": "task_seq + 1" }
      })
      .where("project_id", projectId)
      .andWhere("task_seq", prevSeqVal)
    ps = await cn.run(upd.toSql())
  } while (ps.changes !== 1)

  return `${code}-${prevSeqVal + 1}`
}