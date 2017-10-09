import { CommentFragment, CommentUpdateFragment, CommentCreateFragment, CommentIdFragment } from "../../../isomorphic/meta/Comment"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { TaskModel } from "./TaskModel"
import { ContributorModel } from "./ContributorModel"
import { WhoUseItem } from "../modelDefinitions"

export interface CommentUpdateTools {
  processing: boolean
  toFragment(variant: "update"): CommentUpdateFragment
  toFragment(variant: "create"): CommentCreateFragment
  toFragment(variant: "id"): CommentIdFragment
  isModified(frag: CommentUpdateFragment): boolean
  getDiffToUpdate(frag: CommentUpdateFragment): CommentUpdateFragment | null
}

export interface CommentModel extends CommentFragment {
  readonly updateTools: CommentUpdateTools
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
    appendUpdateToolsToModel(model, "Contributor", getFrag, engine, {
      processing: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
