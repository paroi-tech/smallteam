import { deleteFrom, in as sqlIn, insert, select, update } from "sql-bricks"
import commentMeta, { CommentCreateFragment, CommentFragment, CommentIdFragment, CommentSearchFragment, CommentUpdateFragment } from "../../../shared/meta/Comment"
import { intVal, toIntList, strVal } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"
import { toSqlValues } from "./backendMeta/backendMetaStore"

// --
// -- Read
// --

export async function fetchComments(context: ModelContext, filters: CommentSearchFragment) {
  let sql = selectFromComment().where("task_id", intVal(filters.taskId))
  let rs = await context.cn.all(sql)
  for (let row of rs) {
    context.loader.addFragment({
      type: "Comment",
      frag: toCommentFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchCommentsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromComment().where(sqlIn("comment_id", toIntList(idList)))
  let rs = await context.cn.all(sql)
  for (let row of rs) {
    let data = toCommentFragment(row)
    context.loader.modelUpdate.addFragment("Comment", data.id, data)
  }
}

function selectFromComment() {
  return select("comment_id, task_id, written_by, body, create_ts, update_ts").from("comment").orderBy("create_ts")
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

export async function createComment(context: ModelContext, newFrag: CommentCreateFragment) {
  let values = toSqlValues(newFrag, commentMeta.create)!
  values["written_by"] = intVal(context.sessionData.accountId)
  let sql = insert("comment", values)
  let res = await context.cn.exec(sql)
  let commentId = res.getInsertedIdAsString()

  context.loader.addFragment({
    type: "Comment",
    id: commentId,
    asResult: "fragment",
    markAs: "created"
  })

  markTaskAsUpdated(context, newFrag.taskId)
}

// --
// -- Update
// --

export async function updateComment(context: ModelContext, updFrag: CommentUpdateFragment) {
  let values = toSqlValues(updFrag, commentMeta.update, "exceptId")
  if (values === null)
    return

  let commentId = intVal(updFrag.id)
  let sql = update("comment", values).where("comment_id", commentId)
  await context.cn.exec(sql)

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

export async function deleteComment(context: ModelContext, frag: CommentIdFragment) {
  await markTaskAsUpdatedFromComment(context, frag.id)
  let sql = deleteFrom("comment").where("comment_id", intVal(frag.id))
  await context.cn.exec(sql)
  context.loader.modelUpdate.markFragmentAs("Comment", frag.id, "deleted")
}

async function markTaskAsUpdatedFromComment(context: ModelContext, commentId: string) {
  let sql = select("task_id").from("comment").where("comment_id", intVal(commentId))
  let rs = await context.cn.all(sql)
  if (rs.length === 1) {
    let taskId = strVal(rs[0]["task_id"])
    markTaskAsUpdated(context, taskId)
  }
}

/**
 * Updated field 'commentCount'
 */
function markTaskAsUpdated(context: ModelContext, taskId: string) {
  context.loader.addFragment({
    type: "Task",
    id: taskId,
    markAs: "updated"
  })
}
