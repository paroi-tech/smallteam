import { BackendContext } from "../backendContext/context"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import commentMeta, { CommentFragment, CommentCreateFragment, CommentIdFragment, CommentUpdateFragment, CommentFetchFragment } from "../../isomorphic/meta/Comment"

// --
// -- Read
// --

export async function queryComments(context: BackendContext, filters: CommentFetchFragment) {
  let cn = await getDbConnection()
  let sql = selectFromComment()
  sql.andWhere("c.task_id", int(filters.taskId))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    context.loader.addFragment({
      type: "Comment",
      frag: toCommentFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchComments(context: BackendContext, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromComment()
    .where("c.comment_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toCommentFragment(row)
    context.loader.modelUpdate.addFragment("Comment", data.id, data)
  }
}

function selectFromComment() {
  return buildSelect()
    .select("c.comment_id, c.task_id, c.written_by, c.body, c.create_ts, c.update_ts")
    .from("comment c")
    .orderBy("c.create_ts")
}

function toCommentFragment(row): CommentFragment {
  return {
    id: row["comment_id"].toString(),
    taskId: row["task_id"].toString(),
    writtenById: row["written_by"].toString(),
    body: row["body"],
    createTs: row["create_ts"],
    updateTs: row["update_ts"]
  }
}

// --
// -- Create
// --

export async function createComment(context: BackendContext, newFrag: CommentCreateFragment) {
  let cn = await getDbConnection()

  // Comment
  let values = toSqlValues(newFrag, commentMeta.create)!
  let sql = buildInsert()
    .insertInto("comment")
    .values(values)
  let ps = await cn.run(sql.toSql()),
    commentId = ps.lastID

  context.loader.addFragment({
    type: "Comment",
    id: commentId.toString(),
    asResult: "fragment",
    markAs: "created"
  })

  markTaskAsUpdated(context, newFrag.taskId)
}

// --
// -- Update
// --

export async function updateComment(context: BackendContext, updFrag: CommentUpdateFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(updFrag, commentMeta.update, "exceptId")
  if (values === null)
    return

  let commentId = int(updFrag.id)

  let sql = buildUpdate()
    .update("comment")
    .set(values)
    .where("comment_id", commentId)
  await cn.run(sql.toSql())

  context.loader.addFragment({
    type: "Comment",
    id: commentId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

// --
// -- Delete
// --

export async function deleteComment(context: BackendContext, frag: CommentIdFragment) {
  await markTaskAsUpdatedFromComment(context, frag.id)

  let cn = await getDbConnection()

  let sql = buildDelete()
    .deleteFrom("comment")
    .where("comment_id", int(frag.id))

  await cn.run(sql.toSql())

  context.loader.modelUpdate.markFragmentAs("Comment", frag.id, "deleted")
}

async function markTaskAsUpdatedFromComment(context: BackendContext, commentId: string) {
  let cn = await getDbConnection()

  let sql = buildSelect()
    .select("task_id")
    .from("comment")
    .where("comment_id", int(commentId))

  let rs = await cn.all(sql.toSql())

  if (rs.length === 1) {
    let taskId = rs[0]["task_id"].toString()
    markTaskAsUpdated(context, taskId)
  }
}

/**
 * Updated field 'commentCount'
 */
function markTaskAsUpdated(context: BackendContext, taskId: string) {
  context.loader.addFragment({
    type: "Task",
    id: taskId,
    markAs: "updated"
  })
}