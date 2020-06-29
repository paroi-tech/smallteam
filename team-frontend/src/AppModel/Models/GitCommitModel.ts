import { GitCommitFragment } from "@smallteam/shared/meta/GitCommit"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"

export type GitCommitModel = GitCommitFragment

export function registerGitCommit(engine: ModelEngine) {
  engine.registerType("GitCommit", function (getFrag: () => GitCommitFragment): GitCommitModel {
    const model = {}
    appendGettersToModel(model, "GitCommit", getFrag)
    return model as any
  })
}
