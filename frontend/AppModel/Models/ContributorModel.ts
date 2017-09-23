import { ContributorFragment } from "../../../isomorphic/fragments/Contributor"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { WhoUseItem } from "../modelDefinitions"



export interface ContributorModel extends ContributorFragment {
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
}

export function registerContributor(engine: ModelEngine) {
  engine.registerType("Contributor", function (getFrag: () => ContributorFragment): ContributorModel {
    let model = {}
    appendGettersToModel(model, "Contributor", getFrag)
    return model as any
  })
}
