import { FlagCreateFragment, FlagFragment, FlagIdFragment, FlagUpdateFragment } from "../../../../shared/meta/Flag"
import { WhoUseItem } from "../../../../shared/transfers"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"

export interface FlagUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): FlagUpdateFragment
  toFragment(variant: "create"): FlagCreateFragment
  toFragment(variant: "id"): FlagIdFragment
  isModified(frag: FlagUpdateFragment): boolean
  getDiffToUpdate(frag: FlagUpdateFragment): FlagUpdateFragment | null
}

export interface FlagModel extends FlagFragment {
  readonly updateTools: FlagUpdateTools
}

export function registerFlag(engine: ModelEngine) {
  engine.registerType("Flag", function (getFrag: () => FlagFragment): FlagModel {
    const model = {}
    appendGettersToModel(model, "Flag", getFrag)
    appendUpdateToolsToModel(model, "Flag", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
