import { CommentCreateFragment, CommentFragment, CommentIdFragment, CommentUpdateFragment } from "@local-packages/shared/dist/meta/Comment"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { AccountModel } from "./AccountModel"
import { TaskModel } from "./TaskModel"

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
  readonly writtenBy: AccountModel
}

export function registerComment(engine: ModelEngine) {
  engine.registerType("Comment", function (getFrag: () => CommentFragment): CommentModel {
    const model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get writtenBy() {
        return engine.getModel("Account", getFrag().writtenById)
      }
    }
    appendGettersToModel(model, "Comment", getFrag)
    appendUpdateToolsToModel(model, "Account", getFrag, engine, {
      processing: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
