import * as path from "path"
import { BackendContext } from "./backendContext/context"
import projectMeta, { ProjectFragment, ProjectCreateFragment, ProjectUpdateFragment, ProjectSearchFragment, ProjectIdFragment } from "../../isomorphic/meta/Project"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../utils/sql92builder/Sql92Builder"
import { cn, toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import { fetchProjectTasks, updateTaskDescription, whoUseTask } from "./queryTask"
import { WhoUseItem } from "../../isomorphic/transfers";
import { TransactionConnectionWithSqlBricks, QueryRunnerWithSqlBricks } from "mycn-with-sql-bricks";

// --
// -- Read
// --

export async function fetchProjects(context: BackendContext, filters: ProjectSearchFragment) {
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
  let rs = await cn.all(sql.toSql())
  await addDependenciesTo(rs)
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

export async function fetchProjectsByIds(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromProject()
    .where("p.project_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  await addDependenciesTo(rs)
  for (let row of rs) {
    let frag = toProjectFragment(row)
    context.loader.modelUpdate.addFragment("Project", frag.id, frag)
    context.loader.modelUpdate.addFragment("Task", frag.rootTaskId)
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

export async function whoUseProject(id: string): Promise<WhoUseItem[]> {
  let dbId = int(id)
  let taskId = await cn.singleValue(buildSelect().select("task_id").from("root_task").where("project_id", dbId).toSql())
  return whoUseTask(taskId.toString())
}

export async function whoUseProjectStep(projectId: string, stepId: string): Promise<WhoUseItem[]> { // TODO: use this function
  let result: WhoUseItem[] = [],
    count: number

  count = await cn.singleValue(buildSelect()
    .select("count(1)")
    .from("task")
    .where({
      "project_id": int(projectId),
      "cur_step_id": int(stepId)
    }).toSql())
  if (count > 0)
    result.push({ type: "Task", count })

  return result
}

// --
// -- Add dependencies
// --

async function addDependenciesTo(projectRows: any[]) {
  let stepMap = await fetchStepIdentifiers(projectRows.map(row => row["project_id"]))
  for (let row of projectRows)
    row["stepIds"] = stepMap.get(row["project_id"]) || []
}

async function fetchStepIdentifiers(projectIdList: number[]): Promise<Map<number, number[]>> {
  let sql = buildSelect()
    .select("pt.project_id, pt.step_id")
    .from("project_step pt")
    .innerJoin("step f", "using", "step_id")
    .where("pt.project_id", "in", projectIdList)
    .orderBy("1, f.order_num")
  let rs = await cn.all(sql.toSql())

  let map = new Map<number, number[]>(),
    curTaskId: number | undefined = undefined,
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

export async function createProject(context: BackendContext, newFrag: ProjectCreateFragment) {
  let transCn = await cn.beginTransaction()

  try {
    // Project
    let sql = buildInsert()
      .insertInto("project")
      .values({
        "code": newFrag.code,
        "task_seq": 0
      })
    let res = await transCn.exec(sql.toSql()),
      projectId = res.getInsertedIdNumber()

    // Step "Not Started"
    sql = buildInsert()
      .insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 1
      })
    res = await transCn.exec(sql.toSql())

    // Step "Archived"
    sql = buildInsert()
      .insertInto("project_step")
      .values({
        "project_id": projectId,
        "step_id": 2
      })
    await transCn.exec(sql.toSql())

    // Task
    sql = buildInsert()
      .insertInto("task")
      .values({
        "project_id": projectId,
        "cur_step_id": 1, // FIXME: step "Not Started" (or make the column NULLABLE?)
        "code": `${newFrag.code}-0`,
        "created_by": int(context.sessionData.contributorId),
        "label": newFrag.name
      })
    res = await transCn.exec(sql.toSql())
    let taskId = res.getInsertedIdNumber()

    // Mark as root task
    sql = buildInsert()
      .insertInto("root_task")
      .values({
        "project_id": projectId,
        "task_id": taskId
      })
    await transCn.exec(sql.toSql())

    // Description
    if (newFrag.description) {
      sql = buildInsert()
        .insertInto("task_description")
        .values({
          "task_id": taskId,
          "description": newFrag.description
        })
      await transCn.exec(sql.toSql())
    }

    await insertProjectSteps(transCn, taskId, newFrag.stepIds)

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

export async function updateProject(context: BackendContext, updFrag: ProjectUpdateFragment) {
  let transCn = await cn.beginTransaction()

  try {
    let projectId = parseInt(updFrag.id, 10)

    let valuesToUpd = toSqlValues(updFrag, projectMeta.update, "exceptId")
    if (valuesToUpd) {
      if (updFrag.code !== undefined && await hasTasks(projectId))
        throw new Error(`Cannot update the project "${updFrag.id}" because it has tasks`)
      let sql = buildUpdate()
        .update("project")
        .set(valuesToUpd)
        .where(toSqlValues(updFrag, projectMeta.update, "onlyId"))
      await transCn.exec(sql.toSql())
    }

    if (updFrag.name !== undefined || updFrag.description !== undefined) {
      let taskId = await getRootTaskId(projectId)

      if (updFrag.description !== undefined)
        await updateTaskDescription(taskId, updFrag.description)

      let sql = buildUpdate()
        .update("task")
        .set({
          update_ts: { "vanilla": "current_timestamp" }
        })
        .where("task_id", taskId)
      if (updFrag.name !== undefined)
        sql.set({ label: updFrag.name })
      await transCn.exec(sql.toSql())
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

async function hasTasks(projectId: number) {
  let count = await cn.singleValue(
    buildSelect().select("count(task_id)").from("task").where("project_id", projectId).toSql()
  )
  return count > 0
}

async function getRootTaskId(projectId: number) {
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
// -- Delete
// --

export async function deleteProject(context: BackendContext, frag: ProjectIdFragment) {
  let transCn = await cn.beginTransaction()

  try {
    let dbId = int(frag.id)

    let taskId = await cn.singleValue(buildSelect().select("task_id").from("root_task").where("project_id", dbId).toSql())

    await cn.exec(buildDelete()
      .deleteFrom("root_task")
      .where("project_id", dbId)
      .toSql())

    await cn.exec(buildDelete()
      .deleteFrom("task")
      .where("task_id", taskId)
      .toSql())

    await cn.exec(buildDelete()
      .deleteFrom("project")
      .where("project_id", dbId)
      .toSql())

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
    let sql = buildInsert()
      .insertInto("project_step")
      .values({
        "project_id": int(projectId),
        "step_id": int(stepId)
      })
    await cn.exec(sql.toSql())
  }
}

async function updateProjectSteps(cn: QueryRunnerWithSqlBricks, projectId: number | string, stepIds: string[]) {
  let rs = await cn.all(buildSelect()
    .select("ps.step_id")
    .from("project_step ps")
    .innerJoin("step s", "using", "step_id")
    .where("ps.project_id", int(projectId))
    .andWhere("s.order_num is not null") // the special steps are never updated (out of the scope)
    .toSql()
  )
  let prevArr = rs.map(row => row["step_id"].toString()) as string[]
  let prevSet = new Set<string>(prevArr)
  let idsSet = new Set<string>(stepIds)
  let toAdd = stepIds.filter(id => !prevSet.has(id))
  let toDelete = prevArr.filter(id => !idsSet.has(id))
  if (toDelete.length > 0) {
    let sql = buildDelete()
      .deleteFrom("project_step")
      .where("project_id", int(projectId))
      .andWhere("step_id", "in", toIntList(toDelete))
    await cn.exec(sql.toSql())
  }
  await insertProjectSteps(cn, projectId, toAdd)
}
