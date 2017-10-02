import CargoLoader from "../cargoLoader/CargoLoader"
import { getDbConnection, toIntList, int } from "./dbUtils"
import { buildSelect, buildInsert, buildUpdate, buildDelete } from "../sql92builder/Sql92Builder"
import { toSqlValues } from "../backendMeta/backendMetaStore"
import { CommentFragment, NewCommentFragment, newCommentMeta, CommentIdFragment, UpdCommentFragment, updCommentMeta, CommentQuery } from "../../isomorphic/fragments/Comment"

// --
// -- Read
// --

export async function queryComments(loader: CargoLoader, filters: CommentQuery) {
  let cn = await getDbConnection()
  let sql = selectFromComment()
  sql.andWhere("c.task_id", int(filters.taskId))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    loader.addFragment({
      type: "Comment",
      frag: toCommentFragment(row),
      asResult: "fragments"
    })
  }
}

export async function fetchComments(loader: CargoLoader, idList: string[]) {
  if (idList.length === 0)
    return
  let cn = await getDbConnection()
  let sql = selectFromComment()
    .where("c.comment_id", "in", toIntList(idList))
  let rs = await cn.all(sql.toSql())
  for (let row of rs) {
    let data = toCommentFragment(row)
    loader.modelUpdate.addFragment("Comment", data.id, data)
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

export async function createComment(loader: CargoLoader, newFrag: NewCommentFragment) {
  let cn = await getDbConnection()

  // Comment
  let values = toSqlValues(newFrag, newCommentMeta)!
  let sql = buildInsert()
    .insertInto("comment")
    .values(values)
  let ps = await cn.run(sql.toSql()),
    commentId = ps.lastID

  loader.addFragment({
    type: "Comment",
    id: commentId.toString(),
    asResult: "fragment",
    markAs: "created"
  })
}

// --
// -- Update
// --

export async function updateComment(loader: CargoLoader, updFrag: UpdCommentFragment) {
  let cn = await getDbConnection()

  let values = toSqlValues(updFrag, updCommentMeta, "exceptId")
  if (values === null)
    return

  let commentId = int(updFrag.id)

  let sql = buildUpdate()
    .update("comment")
    .set(values)
    .where("comment_id", commentId)
  await cn.run(sql.toSql())

  loader.addFragment({
    type: "Comment",
    id: commentId.toString(),
    asResult: "fragment",
    markAs: "updated"
  })
}

// --
// -- Delete
// --

export async function deleteComment(loader: CargoLoader, frag: CommentIdFragment) {
  let cn = await getDbConnection()

  let sql = buildDelete()
    .deleteFrom("comment")
    .where("comment_id", int(frag.id))

  await cn.run(sql.toSql())

  loader.modelUpdate.markFragmentAs("Comment", frag.id, "deleted")
}
