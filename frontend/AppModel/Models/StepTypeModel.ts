import { StepTypeFragment, UpdStepTypeFragment } from "../../../isomorphic/fragments/StepType"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { WhoUseItem } from "../modelDefinitions"
import { isStepSpecial } from "./StepModel"



export interface StepTypeModel extends StepTypeFragment {
  isModified(frag: UpdStepTypeFragment): boolean
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
  readonly isSpecial: boolean
}

export function registerStepType(engine: ModelEngine) {
  engine.registerType("StepType", function (getFrag: () => StepTypeFragment): StepTypeModel {
    let model = {
      isModified(frag: UpdStepTypeFragment): boolean {
        if (frag.id !== this.id)
          throw new Error('ID should match')
        return frag.name !== this.name
      },
      get isSpecial() {
        return isStepSpecial(getFrag())
      }
    }
    appendGettersToModel(model, "StepType", getFrag)
    return model as any
  })
}
