import { TaskFragment, TaskUpdateFragment, TaskCreateFragment, TaskIdFragment } from "../../../isomorphic/meta/Task"
import ModelEngine, { appendGettersToModel, toCollection, OrderProperties, appendUpdateToolsToModel } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { ContributorModel } from "./ContributorModel"
import { FlagModel } from "./FlagModel"
import { Collection } from "../modelDefinitions"
import { CommentModel } from "./CommentModel"
import { CommentSearchFragment } from "../../../isomorphic/meta/Comment"
import { TaskLogEntryModel } from "./TaskLogEntryModel"
import { TaskLogEntrySearchFragment } from "../../../isomorphic/meta/TaskLogEntry"
import { Type } from "../../../isomorphic/Cargo";
import { WhoUseItem } from "../../../isomorphic/transfers"
import { StepModel } from "./StepModel";
import { FileInfoModel } from "./FileInfoModel";

export interface TaskUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): TaskUpdateFragment
  toFragment(variant: "create"): TaskCreateFragment
  toFragment(variant: "id"): TaskIdFragment
  isModified(frag: TaskUpdateFragment): boolean
  getDiffToUpdate(frag: TaskUpdateFragment): TaskUpdateFragment | null
}

export interface TaskModel extends TaskFragment {
  readonly updateTools: TaskUpdateTools
  readonly project: ProjectModel
  readonly currentStep: StepModel
  readonly parent?: TaskModel
  readonly children?: Collection<TaskModel, string>
  readonly createdBy: ContributorModel
  readonly affectedTo?: Collection<ContributorModel, string>
  readonly flags?: Collection<FlagModel, string>
  getComments(): Promise<Collection<CommentModel, string>>
  getLogEntries(): Promise<Collection<TaskLogEntryModel, string>>
  readonly attachedFiles?: Collection<FileInfoModel, string>
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
        let flagIds = getFrag().flagIds
        if (!flagIds)
          return undefined
        let list = flagIds.map(flagId => engine.getModel("Flag", flagId))
        return toCollection(list, "Flag")
      },
      getComments(): Promise<Collection<CommentModel, string>> {
        return engine.fetch("Comment", {
          taskId: getFrag().id
        } as CommentSearchFragment)
      },
      getLogEntries(): Promise<Collection<TaskLogEntryModel, string>> {
        return engine.fetch("TaskLogEntry", {
          taskId: getFrag().id
        } as TaskLogEntrySearchFragment)
      },
      get getAttachedFiles() {
        let fileIds = getFrag().attachedFileIds
        if (!fileIds)
          return undefined
        let list = fileIds.map(fileId => engine.getModel("FileInfo", fileId))
        return toCollection(list, "FileInfo")
      }
    } as Partial<TaskModel>
    appendGettersToModel(model, "Task", getFrag)
    appendUpdateToolsToModel(model, "Task", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })

  engine.registerDependency("reorder", "Flag", function (props: OrderProperties) {
    return {
      type: "Task" as Type,
      idList: engine.getAllModels<TaskModel>("Task").filter(task => !!task.flagIds).map(task => task.id)
    }
  })
}
