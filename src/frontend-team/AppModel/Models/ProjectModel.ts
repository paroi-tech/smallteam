import { Type } from "../../../shared/Cargo"
import { ProjectCreateFragment, ProjectFragment, ProjectIdFragment, ProjectUpdateFragment } from "../../../shared/meta/Project"
import { WhoUseItem } from "../../../shared/transfers"
import { Collection } from "../modelDefinitions"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel, OrderProperties, toCollection } from "../ModelEngine"
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
    let model = {
      get rootTask() {
        return engine.getModel("Task", getFrag().rootTaskId)
      },
      get steps() {
        let list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
          .filter(step => step.orderNum !== null)
        return toCollection(list, "Step")
      },
      get specialSteps() {
        let list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
          .filter(step => step.orderNum === null)
        return toCollection(list, "Step")
      },
      get allSteps() {
        let list = getFrag().stepIds
          .map(stepId => engine.getModel<StepModel>("Step", stepId))
        return toCollection(list, "Step")
      },
      get tasks() {
        return this.rootTask.children
      },
      getTask(taskId: string) {
        let task: TaskModel = engine.getModel("Task", taskId)
        if (task.projectId !== getFrag().id)
          throw new Error(`The task ${taskId} is in the project ${task.projectId}, current project: ${getFrag().id}`)
        return task
      },
      hasTaskForStep(stepId: string): boolean {
        let tasks = engine.getModels<TaskModel>({
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

  engine.registerDependency("reorder", "Step", function (props: OrderProperties) {
    return {
      type: "Project" as Type,
      idList: engine.getAllModels<ProjectModel>("Project").map(project => project.id)
    }
  })
}
