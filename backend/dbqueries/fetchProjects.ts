import * as path from "path"
import * as sqlite from "sqlite"
import CargoLoader from "../CargoLoader"
import { ProjectFields, NewProjectFields } from "../../isomorphic/entities/project"
import { TaskFields } from "../../isomorphic/entities/task"

async function openDbConnection() {
  let cn = await sqlite.open(path.join(__dirname, "..", "..", "ourdb.sqlite"))
  await cn.migrate({
    migrationsPath: path.join(__dirname, "..", "..", "sqlite-scripts")
  })
  return cn
}

export async function queryProjects(loader: CargoLoader, filters: Partial<ProjectFields>) {
  let cn = await openDbConnection()
  let rs = await cn.all(`select p.project_id, p.code, p.archived, rt.task_id as root_task_id
from project p
inner join root_task rt using(project_id)
where p.archived = ${filters.archived ? 1 : 0}`)
  for (let row of rs) {
    let data = toProjectFields(row)
    loader.addEntity("Project", data.id, data)
    loader.addToResultEntities("Project", data.id)
  }
}

export async function fetchTasks(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await openDbConnection()
  let rs = await cn.all(`select t.task_id, t.code, t.created_by, t.affected_to, t.cur_step_id, t.label, t.create_ts, t.update_ts
from task t
where t.task_id in (${escSqlIdList(idList)})`)
  for (let row of rs) {
    let data = toTaskFields(row)
    loader.addEntity("Task", data.id, data)
  }
}

export async function fetchProjects(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await openDbConnection()
  let rs = await cn.all(`select p.project_id, p.code, p.archived, rt.task_id as root_task_id
from project p
inner join root_task rt using(project_id)
where p.project_id in (${escSqlIdList(idList)})`)
  for (let row of rs) {
    let data = toProjectFields(row)
    loader.addEntity("Project", data.id, data)
    loader.addEntity("Task", data.rootTaskId)
  }
}

function escSqlIdList(idList: string[]): string {
  let arr: number[] = []
  for (let id of idList)
    arr.push(parseInt(id, 10))
  return arr.join(", ")
}

function toTaskFields(row): TaskFields {
  let data: TaskFields = {
    id: row["task_id"].toString(),
    code: row["code"],
    label: row["label"],
    createTs: row["create_ts"],
    updateTs: row["update_ts"],
  }
  if (row["description"])
    data.description = row["description"]
  return data
}

function toProjectFields(row): ProjectFields {
  return {
    id: row["project_id"].toString(),
    code: row["code"],
    archived: row["archived"] === 1,
    rootTaskId: row["root_task_id"].toString()
  }
}

export async function createProject(loader: CargoLoader, values: NewProjectFields) {
  let cn = await openDbConnection()

  // Project
  let ps = await cn.run(`insert into project (code, task_seq) values (?, 0)`, [values.code]),
    projectId = ps.lastID

  // Step "Not Started"
  ps = await cn.run(`insert into step (step_type_id, project_id) values (?, ?)`, [0, projectId])
  let notStartedStepId = ps.lastID

  // Step "Finished"
  ps = await cn.run(`insert into step (step_type_id, project_id) values (?, ?)`, [1, projectId])

  // Task
  ps = await cn.run(`insert into task (code, created_by, cur_step_id, label) values (?, ?, ?, ?)`, [
    values.code + "-0", 0, notStartedStepId, values.name
  ])
  let taskId = ps.lastID

  // Mark as root task
  await cn.run(`insert into root_task (project_id, task_id) values (?, ?)`, [projectId, taskId])

  loader.addEntity("Project", projectId.toString())
  loader.setResultEntity("Project", projectId.toString())
}
