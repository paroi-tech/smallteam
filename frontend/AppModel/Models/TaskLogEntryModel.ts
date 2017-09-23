import { TaskLogEntryFragment } from "../../../isomorphic/fragments/TaskLogEntry"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { TaskModel } from "./TaskModel"
import { StepModel } from "./StepModel"
import { ContributorModel } from "./ContributorModel"

export interface TaskLogEntryModel extends TaskLogEntryFragment {
  readonly task: TaskModel
  readonly step: StepModel
  readonly contributor: ContributorModel
}

export function registerTaskLogEntry(engine: ModelEngine) {
  engine.registerType("TaskLogEntry", function (getFrag: () => TaskLogEntryFragment): TaskLogEntryModel {
    let model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get step() {
        return engine.getModel("Step", getFrag().stepId)
      },
      get contributor() {
        return engine.getModel("Contributor", getFrag().contributorId)
      }
    }
    appendGettersToModel(model, "TaskLogEntry", getFrag)
    return model as any
  })
}
