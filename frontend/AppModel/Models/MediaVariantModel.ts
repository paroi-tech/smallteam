import { MediaVariantFragment, MediaVariantIdFragment } from "../../../isomorphic/meta/MediaVariant"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { MediaModel } from "./MediaModel";

export interface MediaVariantModel extends MediaVariantFragment {
  media: MediaModel
}

export function registerMediaVariant(engine: ModelEngine) {
  engine.registerType("MediaVariant", function (getFrag: () => MediaVariantFragment): MediaVariantModel {
    let model = {
      get media() {
        return engine.getModel("Media", getFrag().mediaId)
      }
    }
    appendGettersToModel(model, "MediaVariant", getFrag)
    return model as any
  })
}
