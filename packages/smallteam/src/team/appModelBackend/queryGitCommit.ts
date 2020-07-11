import { GitCommitFragment } from "@smallteam-local/shared/dist/meta/GitCommit"
import { in as sqlIn, select } from "sql-bricks"
import { toIntList } from "../../utils/dbUtils"
import { ModelContext } from "./backendContext/context"

// --
// -- Read
// --

export async function fetchGitCommits(context: ModelContext) {
  const sql = selectFromGitCommit()
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const frag = toGitCommitFragment(row)
    context.loader.addFragment({
      type: "GitCommit",
      frag,
      asResult: "fragments"
    })
  }
}

export async function fetchGitCommitsByIds(context: ModelContext, idList: string[]) {
  if (idList.length === 0)
    return
  const sql = selectFromGitCommit()
    .where(sqlIn("commit_id", toIntList(idList)))
  const rs = await context.cn.all(sql)
  for (const row of rs) {
    const data = toGitCommitFragment(row)
    context.loader.modelUpdate.addFragment("GitCommit", data.id, data)
  }
}

function selectFromGitCommit() {
  return select("commit_id, external_id, message, author_name, commit_url, ts")
    .from("git_commit")
    .orderBy("ts")
}

function toGitCommitFragment(row): GitCommitFragment {
  return {
    id: row["commit_id"].toString(),
    externalId: row["external_id"],
    message: row["message"],
    authorName: row["author_name"],
    ts: row["ts"],
    url: row["commit_url"]
  }
}
