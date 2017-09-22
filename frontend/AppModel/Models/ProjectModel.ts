import { ProjectFragment } from "../../../isomorphic/fragments/Project";
import ModelEngine, { appendGettersToModel } from "../ModelEngine";
import { StepFragment } from "../../../isomorphic/fragments/Step";
import { TaskModel } from "./TaskModel";
import { StepModel, isStepNormal, isStepSpecial } from "./StepModel";

export interface ProjectModel extends ProjectFragment {
  readonly rootTask: TaskModel
  readonly steps: StepModel[]
  readonly specialSteps: StepModel[]
  hasStepType(stepTypeId: string): boolean
  findStepByType(stepTypeId: string): StepModel | undefined
  findStep(stepId: string): StepModel | undefined
  readonly tasks?: TaskModel[]
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
      findStep(stepId: string) {
        for (let step of this.steps) {
          if (step.id === stepId)
            return step
        }
        return undefined
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
    return model as any
  })
}
