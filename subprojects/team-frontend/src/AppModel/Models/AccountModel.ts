import { AccountCreateFragment, AccountFragment, AccountIdFragment, AccountUpdateFragment } from "@local-packages/shared/dist/meta/Account"
import { WhoUseItem } from "@local-packages/shared/dist/transfers"
import ModelEngine, { appendGettersToModel, appendUpdateToolsToModel } from "../ModelEngine"
import { MediaModel } from "./MediaModel"

export interface AccountUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "update"): AccountUpdateFragment
  toFragment(variant: "create"): AccountCreateFragment
  toFragment(variant: "id"): AccountIdFragment
  isModified(frag: AccountUpdateFragment): boolean
  getDiffToUpdate(frag: AccountUpdateFragment): AccountUpdateFragment | null
}

export interface AccountModel extends AccountFragment {
  readonly updateTools: AccountUpdateTools
  readonly avatar?: MediaModel
}

export function registerAccount(engine: ModelEngine) {
  engine.registerType("Account", function (getFrag: () => AccountFragment): AccountModel {
    const model = {
      get avatar() {
        const avatarId = getFrag().avatarId
        return avatarId === undefined ? undefined : engine.getModel("Media", avatarId)
      }
    }
    appendGettersToModel(model, "Account", getFrag)
    appendUpdateToolsToModel(model, "Account", getFrag, engine, {
      processing: true,
      whoUse: true,
      toFragment: true,
      diffToUpdate: true
    })
    return model as any
  })
}
