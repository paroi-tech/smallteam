import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { ProjectFragment, NewProjectFragment } from "../../isomorphic/fragments/Project"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { SelectBuilder } from "../sqlbuilder/Sql92Builder"

async function openDbConnection() {
  let cn = await sqlite.open(path.join(__dirname, "..", "..", "ourdb.sqlite"))
  await cn.migrate({
    migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts")
  })
  return cn
}

function escSqlIdList(idList: string[]): string {
  let arr: number[] = []
  for (let id of idList)
    arr.push(parseInt(id, 10))
  return arr.join(", ")
}

export async function queryProjects(loader: CargoLoader, filters: Partial<ProjectFragment>) {
  let cn = await openDbConnection()
  let sql = new SelectBuilder()
  sql.select('p.project_id, p.code, p.archived, rt.task_id as root_task_id, t.label as name, d.description')
    .from('project p')
    .join("root_task rt", "using", "project_id")
    .join("task t", "using", "task_id")
    .join("task_description d", "using", "task_id")
    .leftJoin("task_description d", "using", "task_id")
    .where("p.archived", filters.archived)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let frag = toProjectFragment(row)
    loader.addFragment("Project", frag.id, frag)
    loader.addToResultFragments("Project", frag.id)
  }
}

export async function fetchTasks(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await openDbConnection()
  let sql = new SelectBuilder()
  sql.select("t.task_id, t.code, t.created_by, t.affected_to, t.cur_step_id, t.label, t.create_ts, t.update_ts")
    .from("task t")
    .where("t.task_id", "in", idList)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toTaskFragment(row)
    loader.addFragment("Task", data.id, data)
  }
}

export async function fetchProjects(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await openDbConnection()
  let sql = new SelectBuilder()
  sql.select("p.project_id, p.code, p.archived, rt.task_id as root_task_id")
    .from("project p")
    .join("root_task rt", "using", "project_id")
    .where("p.project_id", "in", idList)
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toProjectFragment(row)
    loader.addFragment("Project", data.id, data)
    loader.addFragment("Task", data.rootTaskId)
  }
}

function toTaskFragment(row): TaskFragment {
  let frag: TaskFragment = {
    id: row["task_id"].toString(),
    code: row["code"],
    label: row["label"],
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
  }
  if (row["description"])
    frag.description = row["description"]
  return frag
}

function toProjectFragment(row): ProjectFragment {
  return {
    id: row["project_id"].toString(),
    code: row["code"],
    name: row["name"],
    description: row["description"],
    archived: row["archived"] === 1,
    rootTaskId: row["root_task_id"].toString()
  }
}

export async function createProject(loader: CargoLoader, newFrag: NewProjectFragment) {
  let cn = await openDbConnection()

  // Project
  let ps = await cn.run(`insert into project (code, task_seq) values (?, 0)`, [newFrag.code]),
    projectId = ps.lastID

  // Step "Not Started"
  ps = await cn.run(`insert into step (step_type_id, project_id) values (?, ?)`, [0, projectId])
  let notStartedStepId = ps.lastID

  // Step "Finished"
  await cn.run(`insert into step (step_type_id, project_id) values (?, ?)`, [1, projectId])

  // Task
  ps = await cn.run(`insert into task (code, created_by, cur_step_id, label) values (?, ?, ?, ?)`, [
    newFrag.code + "-0", 0, notStartedStepId, newFrag.name
  ])
  let taskId = ps.lastID

  // Mark as root task
  await cn.run(`insert into root_task (project_id, task_id) values (?, ?)`, [projectId, taskId])

  // Description
  if (newFrag.description)
    await cn.run(`insert into task_description (task_id, description) values (?, ?)`, [taskId, newFrag.description])

  loader.addFragment("Project", projectId.toString())
  loader.setResultFragment("Project", projectId.toString())
}
