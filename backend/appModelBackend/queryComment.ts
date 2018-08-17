import { ModelContext } from "./backendContext/context"
import { toIntList, int } from "../utils/dbUtils"
import { toSqlValues } from "./backendMeta/backendMetaStore"
import commentMeta, { CommentFragment, CommentCreateFragment, CommentIdFragment, CommentUpdateFragment, CommentSearchFragment } from "../../isomorphic/meta/Comment"
import { select, insert, update, deleteFrom, in as sqlIn } from "sql-bricks"

// --
// -- Read
// --

export async function fetchComments(context: ModelContext, filters: CommentSearchFragment) {
  let query = selectFromComment().where("task_id", int(filters.taskId))
  let rs = await context.cn.allSqlBricks(query)
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
  let query = selectFromComment().where(sqlIn("comment_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(query)
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
  values["written_by"] = int(context.sessionData.contributorId)
  let sql = insert("comment", values)
  let res = await context.cn.execSqlBricks(sql)
  let commentId = res.getInsertedIdString()

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

  let commentId = int(updFrag.id)
  let sql = update("comment", values).where("comment_id", commentId)
  await context.cn.execSqlBricks(sql)

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
  let sql = deleteFrom("comment").where("comment_id", int(frag.id))
  await context.cn.execSqlBricks(sql)
  context.loader.modelUpdate.markFragmentAs("Comment", frag.id, "deleted")
}

async function markTaskAsUpdatedFromComment(context: ModelContext, commentId: string) {
  let sql = select("task_id").from("comment").where("comment_id", int(commentId))
  let rs = await context.cn.allSqlBricks(sql)
  if (rs.length === 1) {
    let taskId = rs[0]["task_id"].toString()
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
