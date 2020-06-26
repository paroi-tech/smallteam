import { SBConnection, SBMainConnection } from "@ladc/sql-bricks-modifier"
import { deleteFrom, in as sqlIn, insertInto, isNotNull, like, select, update } from "sql-bricks"
import projectMeta, { ProjectCreateFragment, ProjectFragment, ProjectIdFragment, ProjectSearchFragment, ProjectUpdateFragment } from "../../../../shared/meta/Project"
import { WhoUseItem } from "../../../../shared/transfers"
import { intVal, strVal, toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { fetchProjectTasks, updateTaskDescription, whoUseTask } from "./queryTask"
// tslint:disable-next-line: ordered-imports
import sqlVanilla = require("sql-bricks")

type DbCn = SBMainConnection

// --
// -- Read
// --

export async function fetchProjects(context: ModelContext, filters: ProjectSearchFragment) {
  const sql = selectFromProject()
  if (filters.archived !== undefined)
    sql.where("p.archived", filters.archived)
  if (filters.code)
    sql.where(like("p.code", `%${filters.code}%`))
  if (filters.name)
    sql.where(like("t.label", `%${filters.name}%`))
  if (filters.description)
    sql.where(like("d.description", `%${filters.description}%`))
  //   if (filters.search) {
  //     sql.where(like("d.description", `%${filters.description}%`)) // TODO: build search criterion
  const rs = await context.cn.all(sql)
  await addDependenciesTo(context.cn, rs)
  const projectIdList: number[] = []
  for (const row of rs) {
    const frag = toProjectFragment(row)
    context.loader.addFragment({
      type: "Project",
      frag,
      asResult: "fragments"
    })
    context.loader.modelUpdate.addFragment("Task", frag.rootTaskId)
    projectIdList.push(row["project_id"] as number)
  }
  await fetchProjectTasks(context, projectIdList)
}

export async function fetchProjectsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  const sql = selectFromProject()
    .where(sqlIn("p.project_id", toIntList(idList)))
  const rs = await context.cn.all(sql)
  await addDependenciesTo(context.cn, rs)
  for (const row of rs) {
    const frag = toProjectFragment(row)
    context.loader.modelUpdate.addFragment("Project", frag.id, frag)
    context.loader.modelUpdate.addFragment("Task", frag.rootTaskId)
  }
}

function selectFromProject() {
  return select("p.project_id, p.code, p.archived, rt.task_id as root_task_id, t.label as name, d.description")
    .from("project p")
    .join("root_task rt").using("project_id")
    .join("task t").using("task_id")
    .leftJoin("task_description d").using("task_id")
}

function toProjectFragment(row): ProjectFragment {
  const frag: ProjectFragment = {
    id: row["project_id"].toString(),
    code: row["code"],
    name: row["name"],
    archived: row["archived"] === 1,
    rootTaskId: row["root_task_id"].toString(),
    stepIds: row["stepIds"].map(id => id.toString())
  }
  if (row["description"])
    frag.description = row["description"]
  return frag
}

// --
// -- Who use
// --

export async function whoUseProject(context: ModelContext, id: string): Promise<WhoUseItem[]> {
  const dbId = intVal(id)
  const taskId = await context.cn.singleValue(select("task_id").from("root_task").where("project_id", dbId))
  return whoUseTask(context, strVal(taskId))
}

export async function whoUseProjectStep(context: ModelContext, projectId: string, stepId: string): Promise<WhoUseItem[]> { // TODO: use this function
  const result: WhoUseItem[] = []
  const count = await context.cn.singleValue(
    select("count(1)")
      .from("task")
      .where({
        "project_id": intVal(projectId),
        "cur_step_id": intVal(stepId)
      })) as number
  if (count > 0)
    result.push({ type: "Task", count })

  return result
}

// --
// -- Add dependencies
// --

async function addDependenciesTo(cn: DbCn, projectRows: any[]) {
  const stepMap = await fetchStepIdentifiers(cn, projectRows.map(row => row["project_id"]))
  for (const row of projectRows)
    row["stepIds"] = stepMap.get(row["project_id"]) || []
}

async function fetchStepIdentifiers(cn: SBMainConnection, projectIdList: number[]): Promise<Map<number, number[]>> {
  const sql =
    select("pt.project_id, pt.step_id")
      .from("project_step pt")
      .innerJoin("step f").using("step_id")
      .where(sqlIn("pt.project_id", projectIdList))
      .orderBy("1, f.order_num")
  const rs = await cn.all(sql)

  const map = new Map<number, number[]>()
  let curTaskId: number | undefined
  let curStepIds: number[]
  for (const row of rs) {
    if (row["project_id"] !== curTaskId) {
      curTaskId = row["project_id"] as number
      curStepIds = []
      map.set(curTaskId!, curStepIds)
    }
    curStepIds!.push(row["step_id"] as number)
  }

  return map
}

// --
// -- Create
// --

export async function createProject(context: ModelContext, newFrag: ProjectCreateFragment) {
  const transCn = await context.cn.beginTransaction()

  try {
    // Project
    let sql = insertInto("project")
      .values({
        "code": newFrag.code,
        "task_seq": 0
      })
    let res = await transCn.exec(sql)
    const projectId = res.getInsertedIdAsNumber()

    // Step "Not Started"
    sql = insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 1
      })
    res = await transCn.exec(sql)

    // Step "Archived"
    sql = insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 2
      })
    await transCn.exec(sql)

    // Task
    sql = insertInto("task")
      .values({
        "project_id": projectId,
        "cur_step_id": 1, // FIXME: step "Not Started" (or make the column NULLABLE?)
        "code": `${newFrag.code}-0`,
        "created_by": intVal(context.sessionData.accountId),
        "label": newFrag.name
      })
    res = await transCn.exec(sql)
    const taskId = res.getInsertedIdAsNumber()

    // Mark as root task
    sql = insertInto("root_task")
      .values({
        "project_id": projectId,
        "task_id": taskId
      })
    await transCn.exec(sql)

    // Description
    if (newFrag.description) {
      sql = insertInto("task_description")
        .values({
          "task_id": taskId,
          "description": newFrag.description
        })
      await transCn.exec(sql)
    }

    await insertProjectSteps(transCn, projectId, newFrag.stepIds)

    await transCn.commit()

    context.loader.addFragment({
      type: "Project",
      id: projectId.toString(),
      asResult: "fragment",
      markAs: "created"
    })

    context.loader.modelUpdate.addFragment("Task", taskId.toString())
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

// --
// -- Update
// --

export async function updateProject(context: ModelContext, updFrag: ProjectUpdateFragment) {
  const transCn = await context.cn.beginTransaction()

  try {
    const projectId = parseInt(updFrag.id, 10)

    const valuesToUpd = toSqlValues(updFrag, projectMeta.update, "exceptId")
    if (valuesToUpd) {
      if (updFrag.code !== undefined && await hasTasks(context.cn, projectId))
        throw new Error(`Cannot update the project "${updFrag.id}" because it has tasks`)
      const sql = update("project")
        .set(valuesToUpd)
        .where(toSqlValues(updFrag, projectMeta.update, "onlyId"))
      await transCn.exec(sql)
    }

    if (updFrag.name !== undefined || updFrag.description !== undefined) {
      const taskId = await getRootTaskId(transCn, projectId) as number

      if (updFrag.description !== undefined)
        await updateTaskDescription(transCn, taskId, updFrag.description)

      const sql = update("task")
        .set({
          update_ts: sqlVanilla("current_timestamp")
        })
        .where("task_id", taskId)
      if (updFrag.name !== undefined)
        sql.set({ label: updFrag.name })
      await transCn.exec(sql)
      context.loader.modelUpdate.addFragment("Task", taskId.toString())
    }

    if (updFrag.stepIds)
      await updateProjectSteps(transCn, projectId, updFrag.stepIds)

    await transCn.commit()

    context.loader.addFragment({
      type: "Project",
      id: projectId.toString(),
      asResult: "fragment",
      markAs: "updated"
    })
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

async function hasTasks(rn: SBConnection, projectId: number) {
  const count = await rn.singleValue(
    select("count(task_id)").from("task").where("project_id", projectId)
  ) as number
  return count > 0
}

async function getRootTaskId(rn: SBConnection, projectId: number) {
  const sql = select("task_id")
    .from("root_task")
    .where("project_id", projectId)
  const rs = await rn.all(sql)
  if (rs.length !== 1)
    throw new Error(`Missing root task for the project "${projectId}"`)
  return rs[0]["task_id"]
}

// --
// -- Delete
// --

export async function deleteProject(context: ModelContext, frag: ProjectIdFragment) {
  const transCn = await context.cn.beginTransaction()

  try {
    const dbId = intVal(frag.id)

    const taskId = await transCn.singleValue(select("task_id").from("root_task").where("project_id", dbId))
    await transCn.exec(deleteFrom("root_task").where("project_id", dbId))
    await transCn.exec(deleteFrom("task").where("task_id", taskId))
    await transCn.exec(deleteFrom("project").where("project_id", dbId))
    await transCn.commit()

    context.loader.modelUpdate.markFragmentAs("Project", frag.id, "deleted")
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

// --
// -- Dependencies
// --

async function insertProjectSteps(cn: SBConnection, projectId: number | string, stepIds: string[]) {
  for (const stepId of stepIds) {
    const sql = insertInto("project_step")
      .values({
        "project_id": intVal(projectId),
        "step_id": intVal(stepId)
      })
    await cn.exec(sql)
  }
}

async function updateProjectSteps(cn: SBConnection, projectId: number | string, stepIds: string[]) {
  const rs = await cn.all(select("ps.step_id")
    .from("project_step ps")
    .innerJoin("step s").using("step_id")
    .where("ps.project_id", intVal(projectId))
    .where(isNotNull("s.order_num")) // the special steps are never updated (out of the scope)
  )
  const prevArr = rs.map(row => strVal(row["step_id"])) as string[]
  const prevSet = new Set<string>(prevArr)
  const idsSet = new Set<string>(stepIds)
  const toAdd = stepIds.filter(id => !prevSet.has(id))
  const toDelete = prevArr.filter(id => !idsSet.has(id))
  if (toDelete.length > 0) {
    const sql = deleteFrom("project_step")
      .where("project_id", intVal(projectId))
      .where(sqlIn("step_id", toIntList(toDelete)))
    await cn.exec(sql)
  }
  await insertProjectSteps(cn, projectId, toAdd)
}
