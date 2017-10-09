import { ProjectFragment, ProjectUpdateFragment, ProjectCreateFragment, ProjectIdFragment } from "../../../isomorphic/meta/Project"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { StepFragment } from "../../../isomorphic/meta/Step"
import { TaskModel } from "./TaskModel"
import { StepModel, isStepNormal, isStepSpecial } from "./StepModel"
import { Collection } from "../modelDefinitions"
import { WhoUseItem } from "../../../isomorphic/transfers"

export interface ProjectUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): ProjectUpdateFragment
  toFragment(variant: "create"): ProjectCreateFragment
  toFragment(variant: "id"): ProjectIdFragment
  isModified(frag: ProjectUpdateFragment): boolean
  getDiffToUpdate(frag: ProjectUpdateFragment): ProjectUpdateFragment | null
}

export interface ProjectModel extends ProjectFragment {
  readonly updateTools: ProjectUpdateTools
  readonly rootTask: TaskModel
  readonly steps: Collection<StepModel, string>
  readonly specialSteps: Collection<StepModel, string>
  hasStepType(stepTypeId: string): boolean
  findStepByType(stepTypeId: string): StepModel | undefined
  findStep(stepId: string): StepModel | undefined
  readonly tasks?: TaskModel[]
  /**
   * Search the task on all the hierarchy
   */
  getTask(taskId: string): TaskModel
}

export function registerProject(engine: ModelEngine) {
  engine.registerType("Project", function (getFrag: () => ProjectFragment): ProjectModel {
    let model = {
      get rootTask() {
        return engine.getModel("Task", getFrag().rootTaskId)
      },
      get steps() {
        return engine.getModels({
          type: "Step",
          index: "projectId",
          indexCb: { "normal": isStepNormal },
          key: {
            projectId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        })
      },
      get specialSteps() {
        return engine.getModels({
          type: "Step",
          index: "projectId",
          indexCb: { "special": isStepSpecial },
          key: {
            projectId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        })
      },
      hasStepType(stepTypeId: string) {
        return !!this.findStepByType(stepTypeId)
      },
      findStepByType(stepTypeId: string) {
        let item = engine.findSingleFromIndex({
          type: "Step",
          index: ["projectId", "typeId"],
          key: {
            projectId: getFrag().id,
            typeId: stepTypeId
          }
        })
        return item
      },
      get tasks() {
        return this.rootTask.children
      },
      getTask(taskId: string) {
        let task: TaskModel = engine.getModel("Task", taskId)
        if (task.projectId !== getFrag().id)
          throw new Error(`The task ${taskId} is in the project ${task.projectId}, current project: ${getFrag().id}`)
        return task
      }
    }
    appendGettersToModel(model, "Project", getFrag)
    appendUpdateToolsToModel(model, "Project", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
