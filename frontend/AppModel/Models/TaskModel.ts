import { TaskFragment } from "../../../isomorphic/fragments/Task"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { StepModel } from "./StepModel"
import { ContributorModel } from "./ContributorModel"
import { FlagModel } from "./FlagModel"

export interface TaskModel extends TaskFragment {
  readonly project: ProjectModel
  readonly currentStep: StepModel
  readonly parent?: TaskModel
  readonly children?: TaskModel[]
  readonly createdBy: ContributorModel
  affectedTo?: ContributorModel[]
  // getComments: CommentModel[] // => TODO: Async load
  flags?: FlagModel[]
  // getLogEntries: TaskLogEntryModel[] // => TODO: Async load
  // getAttachments(): Promise<Attachment[]>
}

export function registerTask(engine: ModelEngine) {
  engine.registerType("Task", function (getFrag: () => TaskFragment): TaskModel {
    let model = {
      get project() {
        return engine.getModel("Project", getFrag().projectId)
      },
      get currentStep() {
        return engine.getModel("Step", getFrag().curStepId)
      },
      get parent() {
        let parentId = getFrag().parentTaskId
        if (parentId === undefined)
          return undefined
        return engine.getModel("Task", parentId)
      },
      get children() {
        return engine.getModels({
          type: "Task",
          index: "parentTaskId",
          key: {
            parentTaskId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        }, undefined)
      }
    }
    appendGettersToModel(model, "Task", getFrag)
    return model as any
  })
}
