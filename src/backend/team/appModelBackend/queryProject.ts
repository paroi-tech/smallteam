import { ModelContext } from "./backendContext/context"
import projectMeta, { ProjectFragment, ProjectCreateFragment, ProjectUpdateFragment, ProjectSearchFragment, ProjectIdFragment } from "../../../shared/meta/Project"
import { select, insertInto, update, deleteFrom, in as sqlIn, isNotNull, like } from "sql-bricks"
import sqlVanilla = require("sql-bricks")
import { toIntList, int } from "../../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { fetchProjectTasks, updateTaskDescription, whoUseTask } from "./queryTask"
import { WhoUseItem } from "../../../shared/transfers"
import { QueryRunnerWithSqlBricks, DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"

type DbCn = DatabaseConnectionWithSqlBricks

// --
// -- Read
// --

export async function fetchProjects(context: ModelContext, filters: ProjectSearchFragment) {
  let sql = selectFromProject()
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
  let rs = await context.cn.allSqlBricks(sql)
  await addDependenciesTo(context.cn, rs)
  let projectIdList: number[] = []
  for (let row of rs) {
    let frag = toProjectFragment(row)
    context.loader.addFragment({
      type: "Project",
      frag,
      asResult: "fragments"
    })
    context.loader.modelUpdate.addFragment("Task", frag.rootTaskId)
    projectIdList.push(row["project_id"])
  }
  await fetchProjectTasks(context, projectIdList)
}

export async function fetchProjectsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromProject()
    .where(sqlIn("p.project_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(sql)
  await addDependenciesTo(context.cn, rs)
  for (let row of rs) {
    let frag = toProjectFragment(row)
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
  let frag: ProjectFragment = {
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
  let dbId = int(id)
  let taskId = await context.cn.singleValueSqlBricks(select("task_id").from("root_task").where("project_id", dbId))
  return whoUseTask(context, taskId.toString())
}

export async function whoUseProjectStep(context: ModelContext, projectId: string, stepId: string): Promise<WhoUseItem[]> { // TODO: use this function
  let result: WhoUseItem[] = [],
    count: number

  count = await context.cn.singleValueSqlBricks(
    select("count(1)")
    .from("task")
    .where({
      "project_id": int(projectId),
      "cur_step_id": int(stepId)
    }))
  if (count > 0)
    result.push({ type: "Task", count })

  return result
}

// --
// -- Add dependencies
// --

async function addDependenciesTo(cn: DbCn, projectRows: any[]) {
  let stepMap = await fetchStepIdentifiers(cn, projectRows.map(row => row["project_id"]))
  for (let row of projectRows)
    row["stepIds"] = stepMap.get(row["project_id"]) || []
}

async function fetchStepIdentifiers(cn: DatabaseConnectionWithSqlBricks, projectIdList: number[]): Promise<Map<number, number[]>> {
  let sql =
    select("pt.project_id, pt.step_id")
    .from("project_step pt")
    .innerJoin("step f").using("step_id")
    .where(sqlIn("pt.project_id", projectIdList))
    .orderBy("1, f.order_num")
  let rs = await cn.allSqlBricks(sql)

  let map = new Map<number, number[]>(),
    curTaskId: number | undefined,
    curStepIds: number[]
  for (let row of rs) {
    if (row["project_id"] !== curTaskId) {
      curTaskId = row["project_id"]
      curStepIds = []
      map.set(curTaskId!, curStepIds)
    }
    curStepIds!.push(row["step_id"])
  }

  return map
}

// --
// -- Create
// --

export async function createProject(context: ModelContext, newFrag: ProjectCreateFragment) {
  let transCn = await context.cn.beginTransaction()

  try {
    // Project
    let sql = insertInto("project")
      .values({
        "code": newFrag.code,
        "task_seq": 0
      })
    let res = await transCn.execSqlBricks(sql),
      projectId = res.getInsertedIdNumber()

    // Step "Not Started"
    sql = insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 1
      })
    res = await transCn.execSqlBricks(sql)

    // Step "Archived"
    sql = insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 2
      })
    await transCn.execSqlBricks(sql)

    // Task
    sql = insertInto("task")
      .values({
        "project_id": projectId,
        "cur_step_id": 1, // FIXME: step "Not Started" (or make the column NULLABLE?)
        "code": `${newFrag.code}-0`,
        "created_by": int(context.sessionData.accountId),
        "label": newFrag.name
      })
    res = await transCn.execSqlBricks(sql)
    let taskId = res.getInsertedIdNumber()

    // Mark as root task
    sql = insertInto("root_task")
      .values({
        "project_id": projectId,
        "task_id": taskId
      })
    await transCn.execSqlBricks(sql)

    // Description
    if (newFrag.description) {
      sql = insertInto("task_description")
        .values({
          "task_id": taskId,
          "description": newFrag.description
        })
      await transCn.execSqlBricks(sql)
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
  let transCn = await context.cn.beginTransaction()

  try {
    let projectId = parseInt(updFrag.id, 10)

    let valuesToUpd = toSqlValues(updFrag, projectMeta.update, "exceptId")
    if (valuesToUpd) {
      if (updFrag.code !== undefined && await hasTasks(context.cn, projectId))
        throw new Error(`Cannot update the project "${updFrag.id}" because it has tasks`)
      let sql = update("project")
        .set(valuesToUpd)
        .where(toSqlValues(updFrag, projectMeta.update, "onlyId"))
      await transCn.execSqlBricks(sql)
    }

    if (updFrag.name !== undefined || updFrag.description !== undefined) {
      let taskId = await getRootTaskId(transCn, projectId)

      if (updFrag.description !== undefined)
        await updateTaskDescription(transCn, taskId, updFrag.description)

      let sql = update("task")
        .set({
          update_ts: sqlVanilla("current_timestamp")
        })
        .where("task_id", taskId)
      if (updFrag.name !== undefined)
        sql.set({ label: updFrag.name })
      await transCn.execSqlBricks(sql)
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

async function hasTasks(rn: QueryRunnerWithSqlBricks, projectId: number) {
  let count = await rn.singleValueSqlBricks(
    select("count(task_id)").from("task").where("project_id", projectId)
  )
  return count > 0
}

async function getRootTaskId(rn: QueryRunnerWithSqlBricks, projectId: number) {
  let sql = select("task_id")
    .from("root_task")
    .where("project_id", projectId)
  let rs = await rn.allSqlBricks(sql)
  if (rs.length !== 1)
    throw new Error(`Missing root task for the project "${projectId}"`)
  return rs[0]["task_id"]
}

// --
// -- Delete
// --

export async function deleteProject(context: ModelContext, frag: ProjectIdFragment) {
  let transCn = await context.cn.beginTransaction()

  try {
    let dbId = int(frag.id)

    let taskId = await transCn.singleValueSqlBricks(select("task_id").from("root_task").where("project_id", dbId))
    await transCn.execSqlBricks(deleteFrom("root_task").where("project_id", dbId))
    await transCn.execSqlBricks(deleteFrom("task").where("task_id", taskId))
    await transCn.execSqlBricks(deleteFrom("project").where("project_id", dbId))
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

async function insertProjectSteps(cn: QueryRunnerWithSqlBricks, projectId: number | string, stepIds: string[]) {
  for (let stepId of stepIds) {
    let sql = insertInto("project_step")
      .values({
        "project_id": int(projectId),
        "step_id": int(stepId)
      })
    await cn.execSqlBricks(sql)
  }
}

async function updateProjectSteps(cn: QueryRunnerWithSqlBricks, projectId: number | string, stepIds: string[]) {
  let rs = await cn.allSqlBricks(select("ps.step_id")
    .from("project_step ps")
    .innerJoin("step s").using("step_id")
    .where("ps.project_id", int(projectId))
    .where(isNotNull("s.order_num")) // the special steps are never updated (out of the scope)
  )
  let prevArr = rs.map(row => row["step_id"].toString()) as string[]
  let prevSet = new Set<string>(prevArr)
  let idsSet = new Set<string>(stepIds)
  let toAdd = stepIds.filter(id => !prevSet.has(id))
  let toDelete = prevArr.filter(id => !idsSet.has(id))
  if (toDelete.length > 0) {
    let sql = deleteFrom("project_step")
      .where("project_id", int(projectId))
      .where(sqlIn("step_id", toIntList(toDelete)))
    await cn.execSqlBricks(sql)
  }
  await insertProjectSteps(cn, projectId, toAdd)
}
