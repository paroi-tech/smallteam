import { Type } from "@smallteam/shared/Cargo"
import { ProjectCreateFragment, ProjectFragment, ProjectIdFragment, ProjectUpdateFragment } from "@smallteam/shared/meta/Project"
import { WhoUseItem } from "@smallteam/shared/transfers"
import { Collection } from "../modelDefinitions"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel, toCollection } from "../ModelEngine"
import { StepModel } from "./StepModel"
import { TaskModel } from "./TaskModel"

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
  readonly allSteps: Collection<StepModel, string>
  readonly tasks?: TaskModel[]
  /**
   * Search the task on all the hierarchy
   */
  getTask(taskId: string): TaskModel
  hasTaskForStep(stepId: string): boolean
}

export function registerProject(engine: ModelEngine) {
  engine.registerType("Project", function (getFrag: () => ProjectFragment): ProjectModel {
    const model = {
      get rootTask() {
        return engine.getModel("Task", getFrag().rootTaskId)
      },
      get steps() {
        const list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
          .filter(step => step.orderNum !== null)
        return toCollection(list, "Step")
      },
      get specialSteps() {
        const list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
          .filter(step => step.orderNum === null)
        return toCollection(list, "Step")
      },
      get allSteps() {
        const list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
        return toCollection(list, "Step")
      },
      get tasks() {
        return this.rootTask.children
      },
      getTask(taskId: string) {
        const task: TaskModel = engine.getModel("Task", taskId)
        if (task.projectId !== getFrag().id)
          throw new Error(`The task ${taskId} is in the project ${task.projectId}, current project: ${getFrag().id}`)
        return task
      },
      hasTaskForStep(stepId: string): boolean {
        const tasks = engine.getModels<TaskModel>({
          type: "Task",
          index: "projectId",
          key: {
            projectId: getFrag().id
          }
        })
        return tasks.find(task => task.curStepId === stepId) !== undefined
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

  engine.registerDependency("reorder", "Step", function () {
    return {
      type: "Project" as Type,
      idList: engine.getAllModels<ProjectModel>("Project").map(project => project.id)
    }
  })
}
