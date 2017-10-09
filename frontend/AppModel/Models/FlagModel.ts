import { FlagFragment } from "../../../isomorphic/meta/Flag"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { WhoUseItem } from "../modelDefinitions"


export interface FlagModel extends FlagFragment {
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
}

export function registerFlag(engine: ModelEngine) {
  engine.registerType("Flag", function (getFrag: () => FlagFragment): FlagModel {
    let model = {}
    appendGettersToModel(model, "Flag", getFrag)
    return model as any
  })
}
