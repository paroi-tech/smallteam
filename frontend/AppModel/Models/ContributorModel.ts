import { ContributorFragment, ContributorUpdateFragment, ContributorCreateFragment, ContributorIdFragment } from "../../../isomorphic/meta/Contributor"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { WhoUseItem } from "../../../isomorphic/transfers"

export interface ContributorUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): ContributorUpdateFragment
  toFragment(variant: "create"): ContributorCreateFragment
  toFragment(variant: "id"): ContributorIdFragment
  isModified(frag: ContributorUpdateFragment): boolean
  getDiffToUpdate(frag: ContributorUpdateFragment): ContributorUpdateFragment | null
}

export interface ContributorModel extends ContributorFragment {
  readonly updateTools: ContributorUpdateTools
}

export function registerContributor(engine: ModelEngine) {
  engine.registerType("Contributor", function (getFrag: () => ContributorFragment): ContributorModel {
    let model = {}
    appendGettersToModel(model, "Contributor", getFrag)
    appendUpdateToolsToModel(model, "Contributor", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
