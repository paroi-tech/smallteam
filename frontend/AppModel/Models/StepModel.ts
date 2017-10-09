import { StepFragment, StepCreateFragment, StepIdFragment } from "../../../isomorphic/meta/Step"
import ModelEngine, { appendGettersToModel, CommandType, OrderProperties, appendUpdateToolsToModel } from "../ModelEngine"
import { ProjectModel } from "./ProjectModel"
import { StepTypeFragment, StepTypeUpdateFragment } from "../../../isomorphic/meta/StepType"
import { Model } from "../modelDefinitions"
import { Type } from "../../../isomorphic/Cargo"
import { WhoUseItem } from "../../../isomorphic/transfers"

export interface StepUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "create"): StepCreateFragment
  toFragment(variant: "id"): StepIdFragment
}

export interface StepModel extends StepFragment {
  readonly updateTools: StepUpdateTools
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
    appendUpdateToolsToModel(model, "Step", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true
    })
    return model as any
  })

  engine.registerDependency("update", "StepType", function (frag: StepTypeUpdateFragment) {
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
