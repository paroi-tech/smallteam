import { Identifier, Type, ModelUpdate } from "../../../../shared/Cargo"
import { makeHKMap, HKMap } from "../../../../shared/libraries/HKCollections"
import { toIdentifier } from "../../../../shared/meta"

export type ChangedType = "created" | "updated" | "deleted"

export default class ModelUpdateLoader {
  private fragmentsMap = new Map<Type, HKMap<Identifier, object | undefined>>()
  private partialMap = new Map<Type, HKMap<Identifier, object>>()
  private changedMap = new Map<Type, HKMap<Identifier, ChangedType | "reordered">>()
  private ended = false

  addFragment(type: Type, id: Identifier, frag?: object) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModel.addFragment": the Cargo is completed`)
    if (this.isMarkedAsDeleted(type, id))
      throw new Error(`Cannot add a fragment already marked as deleted: ${type}.${id}`)
    this.tryToRemoveFromPartial(type, id)
    let fragments = this.fragmentsMap.get(type)
    if (!fragments) {
      fragments = makeHKMap<any, any>()
      this.fragmentsMap.set(type, fragments)
    }
    if (!fragments.has(id) || frag !== undefined)
      fragments.set(id, frag)
  }

  addPartial(type: Type, partialFrag: object) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModel.updateFields": the Cargo is completed`)
    let id = toIdentifier(partialFrag, type)
    if (this.isMarkedAsDeleted(type, id))
      throw new Error(`Cannot update a fragment already marked as deleted: ${type}.${id}`)
    if (this.tryToMergeInFragments(type, id, partialFrag))
      return
    let partial = this.partialMap.get(type)
    if (!partial) {
      partial = makeHKMap<any, any>()
      this.partialMap.set(type, partial)
    }
    if (!partial.has(id))
      partial.set(id, partialFrag)
  }

  markFragmentAs(type: Type, id: Identifier, changedType: ChangedType) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModel.markFragmentAs": the Cargo is completed`)
    if (changedType === "deleted") {
      this.tryToRemoveFromFragments(type, id)
      this.tryToRemoveFromPartial(type, id)
    }
    let changed = this.changedMap.get(type)
    if (!changed) {
      changed = makeHKMap<any, any>()
      this.changedMap.set(type, changed)
    }
    changed.set(id, changedType)
  }

  markIdsAsReordered(type: Type, idList: Identifier[]) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModel.markIdsAsReordered": the Cargo is completed`)
    let changed = this.changedMap.get(type)
    if (!changed) {
      changed = makeHKMap<any, any>()
      this.changedMap.set(type, changed)
    }
    for (let id of idList)
      changed.set(id, "reordered")
  }

  getNeededFragments(type: Type): Identifier[] {
    if (this.ended)
      throw new Error(`Invalid call to "getNeededFragments": the Cargo is completed`)
    let idList: Identifier[] = [],
      fragments = this.fragmentsMap.get(type)
    if (!fragments)
      return idList
    for (let [id, frag] of fragments) {
      if (frag === undefined)
        idList.push(id)
    }
    return idList
  }

  isFragmentsComplete(): boolean {
    for (let [type, fragments] of this.fragmentsMap.entries()) {
      for (let [id, frag] of fragments.entries()) {
        if (frag === undefined)
          return false
      }
    }
    return true
  }

  getMissingFragmentTypes(): string[] {
    let types: string[] = []
    for (let [type, fragments] of this.fragmentsMap.entries()) {
      for (let [id, frag] of fragments.entries()) {
        if (frag === undefined) {
          types.push(type)
          break
        }
      }
    }
    return types
  }

  toModelUpdate(): ModelUpdate | undefined {
    this.ended = true
    let modelUpd: ModelUpdate = {}
    this.fillModelUpdateWithChanges(modelUpd)
    this.fillModelUpdateWithPartial(modelUpd)
    this.fillModelUpdateWithFragments(modelUpd)
    return isObjEmpty(modelUpd) ? undefined : modelUpd
  }

  private fillModelUpdateWithChanges(modelUpd: ModelUpdate) {
    if (this.changedMap.size === 0)
      return
    for (let [type, changed] of this.changedMap) {
      for (let [id, changedType] of changed) {
        if (!modelUpd[changedType])
          modelUpd[changedType] = {}
        if (!modelUpd[changedType]![type])
          modelUpd[changedType]![type] = []
        modelUpd[changedType]![type]!.push(id)
      }
    }
  }

  private fillModelUpdateWithFragments(modelUpd: ModelUpdate) {
    if (this.fragmentsMap.size === 0)
      return
    for (let [type, fragments] of this.fragmentsMap) {
      for (let [id, frag] of fragments) {
        if (frag === undefined)
          throw new Error(`Invalid call to "toCargo()", the loader is not completed (missing ${type}, ${id})`)
        if (!modelUpd.fragments)
          modelUpd.fragments = {}
        if (!modelUpd.fragments[type])
          modelUpd.fragments[type] = []
        ;(modelUpd.fragments[type] as any[]).push(frag)
      }
    }
  }

  private fillModelUpdateWithPartial(modelUpd: ModelUpdate) {
    if (this.partialMap.size === 0)
      return
    for (let [type, partial] of this.partialMap) {
      for (let [id, partialFrag] of partial) {
        if (partialFrag === undefined)
          throw new Error(`Invalid call to "toCargo()", the loader is not completed`)
        if (!modelUpd.partial)
          modelUpd.partial = {}
        if (!modelUpd.partial[type])
          modelUpd.partial[type] = []
        modelUpd.partial[type]!.push(partialFrag)
      }
    }
  }

  private hasFragment(type: Type, id: Identifier): boolean {
    let fragments = this.fragmentsMap.get(type)
    return fragments !== undefined && fragments.has(id)
  }

  private isMarkedAsDeleted(type: Type, id: Identifier): boolean {
    let changed = this.changedMap.get(type)
    return changed !== undefined && changed.get(id) === "deleted"
  }

  private tryToRemoveFromPartial(type: Type, id: Identifier) {
    let partial = this.partialMap.get(type)
    if (!partial)
      return
    partial.delete(id)
  }

  private tryToRemoveFromFragments(type: Type, id: Identifier) {
    let fragments = this.fragmentsMap.get(type)
    if (!fragments)
      return
    fragments.delete(id)
  }

  private tryToMergeInFragments(type: Type, id: Identifier, partialFrag: object): boolean {
    let fragments = this.fragmentsMap.get(type)
    if (!fragments)
      return false
    let frag = fragments.get(id)
    if (!frag)
      return false
    for (let name of Object.keys(partialFrag)) {
      if (partialFrag[name] !== undefined)
        frag[name] = partialFrag[name]
    }
    return true
  }
}

function isObjEmpty(obj: object): boolean {
  for (let k in obj) {
    if (obj.hasOwnProperty(k))
      return false
  }
  return true
}