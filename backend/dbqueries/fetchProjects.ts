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

export async function fetchProjects(loader: CargoLoader, filters: Partial<ProjectFields>) {
  let cn = await openDbConnection()
  let arr = await cn.all(`select p.project_id, p.code as project_code, p.archived,
  t.task_id, t.code, t.created_by, t.affected_to, t.cur_step_id, t.label, t.create_ts, t.update_ts
from project p
inner join root_task using(project_id)
inner join task t using(task_id)
where p.archived = ${filters.archived ? 1 : 0}`)

  console.log(arr)


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
}


