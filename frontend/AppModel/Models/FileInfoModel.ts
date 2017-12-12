import { FileInfoFragment, FileInfoIdFragment } from "../../../isomorphic/meta/FileInfo"
import ModelEngine, { appendGettersToModel } from "../ModelEngine"
import { WhoUseItem } from "../../../isomorphic/transfers"

export interface FileInfoUpdateTools {
  processing: boolean
  whoUse(): Promise<WhoUseItem[] | null>
  toFragment(variant: "id"): FileInfoIdFragment
}

export interface FileInfoModel extends FileInfoFragment {
  readonly updateTools: FileInfoUpdateTools
}

export function registerFileInfo(engine: ModelEngine) {
  engine.registerType("FileInfo", function (getFrag: () => FileInfoFragment): FileInfoModel {
    let model = {}
    appendGettersToModel(model, "FileInfo", getFrag)
    return model as any
  })
}
