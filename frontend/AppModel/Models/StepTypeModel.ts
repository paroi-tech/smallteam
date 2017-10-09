import { StepTypeFragment, StepTypeUpdateFragment, StepTypeCreateFragment, StepTypeIdFragment } from "../../../isomorphic/meta/StepType"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { WhoUseItem } from "../modelDefinitions"
import { isStepSpecial } from "./StepModel"

export interface StepTypeUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): StepTypeUpdateFragment
  toFragment(variant: "create"): StepTypeCreateFragment
  toFragment(variant: "id"): StepTypeIdFragment
  isModified(frag: StepTypeUpdateFragment): boolean
  getDiffToUpdate(frag: StepTypeUpdateFragment): StepTypeUpdateFragment | null
}

export interface StepTypeModel extends StepTypeFragment {
  readonly updateTools: StepTypeUpdateTools
  readonly isSpecial: boolean
}

export function registerStepType(engine: ModelEngine) {
  engine.registerType("StepType", function (getFrag: () => StepTypeFragment): StepTypeModel {
    let model = {
      isModified(frag: StepTypeUpdateFragment): boolean {
        if (frag.id !== this.id)
          throw new Error('ID should match')
        return frag.name !== this.name
      },
      get isSpecial() {
        return isStepSpecial(getFrag())
      }
    }
    appendGettersToModel(model, "StepType", getFrag)
    appendUpdateToolsToModel(model, "StepType", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
