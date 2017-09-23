import { StepFragment } from "../../../isomorphic/fragments/Step"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { StepTypeFragment } from "../../../isomorphic/fragments/StepType"


export interface StepModel extends StepFragment {
  readonly project: ProjectModel
  readonly isSpecial: boolean
  readonly taskCount: number
}

export function registerStep(engine: ModelEngine) {
  engine.registerType("Step", function (getFrag: () => StepFragment): StepModel {
    let model = {
      get project() {
        return engine.getModel("Project", getFrag().projectId)
      },
      get isSpecial() {
        return isStepSpecial(getFrag())
      },
      get taskCount() {
        return engine.countModels({
          type: "Task",
          index: "curStepId",
          key: {
            curStepId: getFrag().id
          }
        })
      }
    }
    appendGettersToModel(model, "Step", getFrag)
    return model as any
  })
}

export function isStepNormal(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum === "number"
}

export function isStepSpecial(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum !== "number"
}
