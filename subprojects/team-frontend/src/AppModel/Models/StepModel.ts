import { StepCreateFragment, StepFragment, StepIdFragment, StepUpdateFragment } from "@smallteam-local/shared/dist/meta/Step"
import { WhoUseItem } from "@smallteam-local/shared/dist/transfers"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"

export interface StepUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): StepUpdateFragment
  toFragment(variant: "create"): StepCreateFragment
  toFragment(variant: "id"): StepIdFragment
  isModified(frag: StepUpdateFragment): boolean
  getDiffToUpdate(frag: StepUpdateFragment): StepUpdateFragment | null
}

export interface StepModel extends StepFragment {
  readonly updateTools: StepUpdateTools
  readonly isSpecial: boolean
}

export function registerStep(engine: ModelEngine) {
  engine.registerType("Step", function (getFrag: () => StepFragment): StepModel {
    const model = {
      get isSpecial() {
        return getFrag().orderNum === null
      }
    }
    appendGettersToModel(model, "Step", getFrag)
    appendUpdateToolsToModel(model, "Step", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
