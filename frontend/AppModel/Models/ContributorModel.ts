import { ContributorFragment, ContributorUpdateFragment, ContributorCreateFragment, ContributorIdFragment } from "../../../isomorphic/meta/Contributor"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { WhoUseItem } from "../modelDefinitions"

interface ContributorUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[]>
  toFragment(variant: "update"): ContributorUpdateFragment
  toFragment(variant: "create"): ContributorCreateFragment
  toFragment(variant: "id"): ContributorIdFragment
  hasDiffToUpdate(frag: ContributorUpdateFragment): boolean
  getDiffToUpdate(frag: ContributorUpdateFragment): ContributorUpdateFragment | null
}

export interface ContributorModel extends ContributorFragment {
  updateTools: ContributorUpdateTools
}

export function registerContributor(engine: ModelEngine) {
  engine.registerType("Contributor", function (getFrag: () => ContributorFragment): ContributorModel {
    let model = {}
    appendGettersToModel(model, "Contributor", getFrag)
    appendUpdateToolsToModel(model, "Contributor", getFrag, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
