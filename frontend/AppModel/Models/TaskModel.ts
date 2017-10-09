import { TaskFragment } from "../../../isomorphic/meta/Task"
import ModelEngine, { appendGettersToModel, toCollection, OrderProperties } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { StepModel } from "./StepModel"
import { ContributorModel } from "./ContributorModel"
import { FlagModel } from "./FlagModel"
import { Collection } from "../modelDefinitions"
import { CommentModel } from "./CommentModel"
import { CommentFetchFragment } from "../../../isomorphic/meta/Comment"
import { TaskLogEntryModel } from "./TaskLogEntryModel"
import { TaskLogEntryFetchFragment } from "../../../isomorphic/meta/TaskLogEntry"
import { Type } from "../../../isomorphic/Cargo";

export interface TaskModel extends TaskFragment {
  readonly project: ProjectModel
  readonly currentStep: StepModel
  readonly parent?: TaskModel
  readonly children?: Collection<TaskModel, string>
  readonly createdBy: ContributorModel
  affectedTo?: Collection<ContributorModel, string>
  flags?: Collection<FlagModel, string>
  getComments(): Promise<Collection<CommentModel, string>>
  getLogEntries(): Promise<Collection<TaskLogEntryModel, string>>
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
      },
      get createdBy() {
        return engine.getModel("Contributor", getFrag().createdById)
      },
      get affectedTo() {
        let frag = getFrag()
        if (!frag.affectedToIds)
          return undefined
        let list = frag.affectedToIds.map(contributorId => engine.getModel("Contributor", contributorId))
        return toCollection(list, "Contributor")
      },
      get flags() {
        let frag = getFrag()
        if (!frag.flagIds)
          return undefined
        let list = frag.flagIds.map(flagId => engine.getModel("Flag", flagId))
        return toCollection(list, "Flag")
      },
      getComments(): Promise<Collection<CommentModel, string>> {
        return engine.query("Comment", {
          taskId: getFrag().id
        } as CommentFetchFragment)
      },
      getLogEntries(): Promise<Collection<TaskLogEntryModel, string>> {
        return engine.query("TaskLogEntry", {
          taskId: getFrag().id
        } as TaskLogEntryFetchFragment)
      }
    } as Partial<TaskModel>
    appendGettersToModel(model, "Task", getFrag)
    return model as any
  })

  engine.registerDependency("reorder", "Flag", function (props: OrderProperties) {
    return {
      type: "Task" as Type,
      idList: engine.getAllModels<TaskModel>("Task").filter(task => !!task.flagIds).map(task => task.id)
    }
  })
}
