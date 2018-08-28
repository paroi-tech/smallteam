import { ModelContext } from "./backendContext/context"
import { GitCommitFragment } from "../../../shared/meta/GitCommit"
import { toIntList } from "../../utils/dbUtils"
import { select, in as sqlIn } from "sql-bricks"

// --
// -- Read
// --

export async function fetchGitCommits(context: ModelContext) {
  let sql = selectFromGitCommit()
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let frag = toGitCommitFragment(row)
    context.loader.addFragment({
      type: "GitCommit",
      frag: frag,
      asResult: "fragments"
    })
  }
}

export async function fetchGitCommitsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  let sql = selectFromGitCommit()
    .where(sqlIn("commit_id", toIntList(idList)))
  let rs = await context.cn.allSqlBricks(sql)
  for (let row of rs) {
    let data = toGitCommitFragment(row)
    context.loader.modelUpdate.addFragment("GitCommit", data.id, data)
  }
}

function selectFromGitCommit() {
  return select("commit_id, external_id, message, author_name, ts")
    .from("git_commit")
    .orderBy("ts")
}

function toGitCommitFragment(row): GitCommitFragment {
  return {
    id: row["commit_id"].toString(),
    externalId: row["external_id"],
    message: row["message"],
    authorName: row["author_name"],
    ts: row["ts"]
  }
}