import { ContributorFragment, ContributorUpdateFragment, ContributorCreateFragment, ContributorIdFragment } from "../../../shared/meta/Contributor"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { WhoUseItem } from "../../../shared/transfers"
import { MediaModel } from "./MediaModel";

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
  readonly avatar?: MediaModel
}

export function registerContributor(engine: ModelEngine) {
  engine.registerType("Contributor", function (getFrag: () => ContributorFragment): ContributorModel {
    let model = {
      get avatar() {
        let avatarId = getFrag().avatarId
        return avatarId === undefined ? undefined : engine.getModel("Media", avatarId)
      }
    }
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
