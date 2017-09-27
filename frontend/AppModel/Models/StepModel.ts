import { StepFragment } from "../../../isomorphic/fragments/Step"
import ModelEngine, { appendGettersToModel, CommandType, OrderProperties } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { StepTypeFragment, UpdStepTypeFragment } from "../../../isomorphic/fragments/StepType"
import { Model } from "../modelDefinitions"
import { Type } from "../../../isomorphic/Cargo"


export interface StepModel extends StepFragment {
  readonly project: ProjectModel
  readonly isSpecial: boolean
  readonly taskCount: number
}

export function registerStep(engine: ModelEngine, appModel: Model) {
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

  engine.registerDependency("update", "StepType", function (frag: UpdStepTypeFragment) {
    return {
      type: "Step" as Type,
      idList: engine.getModels<StepModel>({
        type: "Step",
        index: "typeId",
        key: {
          typeId: frag.id
        }
      }).map(step => step.id)
    }
  })

  engine.registerDependency("reorder", "StepType", function (props: OrderProperties) {
    return {
      type: "Step" as Type,
      idList: engine.getAllModels<StepModel>("Step").filter(step => step.orderNum !== null).map(step => step.id)
    }
  })
}

export function isStepNormal(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum === "number"
}

export function isStepSpecial(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum !== "number"
}
