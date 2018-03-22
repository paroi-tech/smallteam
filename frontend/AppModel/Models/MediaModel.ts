import { MediaFragment, MediaIdFragment } from "../../../isomorphic/meta/Media"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
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
}
