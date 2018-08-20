import { MediaFragment, MediaIdFragment } from "../../../shared/meta/Media"
import ModelEngine, { appendGettersToModel, CommandType } from "../ModelEngine"
import { MediaVariantModel } from "./MediaVariantModel";
import { Collection } from "../modelDefinitions";

export interface MediaModel extends MediaFragment {
  variants: Collection<MediaVariantModel, string>
  getVariant(code: string): MediaVariantModel | undefined
}

export function registerMedia(engine: ModelEngine) {
  engine.registerType("Media", function (getFrag: () => MediaFragment): MediaModel {
    let model = {
      get variants() {
        return engine.getModels({
          type: "MediaVariant",
          index: "mediaId",
          key: {
            mediaId: getFrag().id
          }
          // orderBy: ["orderNum", "asc"]
        }, [])
      },
      getVariant(code: string) {
        let variants = this.variants as Collection<MediaVariantModel, string>
        let found = variants.find(variant => variant.code === code)
        if (found)
          return found
        if (variants.length >= 1)
          return variants[0]
      }
    }
    appendGettersToModel(model, "Media", getFrag)
    return model as any
  })

  engine.registerTriggerBefore("Media", (cmd, id) => {
    if (cmd !== "delete" && cmd !== "update")
      return
    engine.removeFrontendModels({
      type: "MediaVariant",
      index: "mediaId",
      key: {
        mediaId: id
      }
    })
  })

  // engine.registerTriggerAfter("Media", (cmd, id) => {
  //   if (cmd === "delete")
  //     return // FIXME: Find a solution to emit events on dependencies when a media is deleted
  //   let media = engine.getModel<MediaModel>("Media", id)
  //   if (media.externalType === undefined || media.externalId === undefined)
  //     return
  //   switch (media.externalType) {
  //     case "accountAvatar":
  //       engine.emitEvents({
  //         Account: [media.externalId]
  //       }, "update")
  //       break;
  //     case "task":
  //       engine.emitEvents({
  //         Task: [media.externalId]
  //       }, "update")
  //       break;
  //     default:
  //       console.log(`[WARNING] Unknown media externalType: ${media.externalType}`)
  //   }
  // })
}
