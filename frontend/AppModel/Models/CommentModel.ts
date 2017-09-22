import { CommentFragment } from "../../../isomorphic/fragments/Comment";
import ModelEngine, { appendGettersToModel } from "../ModelEngine";
import { TaskModel } from "./TaskModel";
import { ContributorModel } from "./ContributorModel";


export interface CommentModel extends CommentFragment {
  readonly task: TaskModel
  readonly writtenBy: ContributorModel
}

export function registerComment(engine: ModelEngine) {
  engine.registerType("Comment", function (getFrag: () => CommentFragment): CommentModel {
    let model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get writtenBy() {
        return engine.getModel("Contributor", getFrag().writtenById)
      }
    }
    appendGettersToModel(model, "Comment", getFrag)
    return model as any
  })
}
