import { GitCommitFragment } from "../../../shared/meta/GitCommit"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"

export interface GitCommitModel extends GitCommitFragment {
}

export function registerGitCommit(engine: ModelEngine) {
  engine.registerType("GitCommit", function (getFrag: () => GitCommitFragment): GitCommitModel {
    let model = {}
    appendGettersToModel(model, "GitCommit", getFrag)
    return model as any
  })
}
