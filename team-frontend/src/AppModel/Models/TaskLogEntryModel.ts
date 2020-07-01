import { TaskLogEntryFragment } from "@smallteam/shared/dist/meta/TaskLogEntry"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { AccountModel } from "./AccountModel"
import { StepModel } from "./StepModel"
import { TaskModel } from "./TaskModel"

export interface TaskLogEntryModel extends TaskLogEntryFragment {
  readonly task: TaskModel
  readonly step: StepModel
  readonly account: AccountModel
}

export function registerTaskLogEntry(engine: ModelEngine) {
  engine.registerType("TaskLogEntry", function (getFrag: () => TaskLogEntryFragment): TaskLogEntryModel {
    const model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get step() {
        return engine.getModel("Step", getFrag().stepId)
      },
      get account() {
        return engine.getModel("Account", getFrag().accountId)
      }
    }
    appendGettersToModel(model, "TaskLogEntry", getFrag)
    return model as any
  })
}
