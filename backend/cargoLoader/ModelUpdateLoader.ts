import { Identifier, Type, ModelUpdate } from "../../isomorphic/Cargo"
import { makeHKMap, HKMap } from "../../isomorphic/libraries/HKCollections"
import { toIdentifier } from "../../isomorphic/meta"

export type ChangedType = "created" | "updated" | "deleted"

export default class ModelUpdateLoader {
  private fragmentsMap = new Map<Type, HKMap<Identifier, {} | undefined>>()
  private partialMap = new Map<Type, HKMap<Identifier, {}>>()
  private changedMap = new Map<Type, HKMap<Identifier, ChangedType>>()
  private ended = false

  public addFragment(type: Type, id: Identifier, frag?: {}) {
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

  public addPartial(type: Type, partialFrag: {}) {
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

  public markFragmentAs(type: Type, id: Identifier, changedType: ChangedType) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModel.markFragmentAs": the Cargo is completed`)
    this.tryToRemoveFromFragments(type, id)
    this.tryToRemoveFromPartial(type, id)
    let changed = this.changedMap.get(type)
    if (!changed) {
      changed = makeHKMap<any, any>()
      this.changedMap.set(type, changed)
    }
    changed.set(id, changedType)
  }

  public getNeededFragments(type: Type): Identifier[] {
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

  public isFragmentsComplete(): boolean {
    for (let [type, fragments] of this.fragmentsMap.entries()) {
      for (let [id, frag] of fragments.entries()) {
        if (frag === undefined)
          return false
      }
    }
    return true
  }

  public toModelUpdate(): ModelUpdate | undefined {
    this.ended = true
    let modelUpd: ModelUpdate = {}
    this.fillModelUpdateWithChanges(modelUpd)
    this.fillModelUpdateWithPartial(modelUpd)
    this.fillModelUpdateWithFragments(modelUpd)
    return isObjEmpty(modelUpd) ? undefined : modelUpd
  }

  private fillModelUpdateWithChanges(modelUpd: ModelUpdate | any) {
    if (this.changedMap.size === 0)
      return
    for (let [type, changed] of this.changedMap) {
      for (let [id, changedType] of changed) {
        if (!modelUpd[changedType])
          modelUpd[changedType] = {}
        if (!modelUpd[changedType][type])
          modelUpd[changedType][type] = []
        modelUpd[changedType][type].push(id)
      }
    }
  }

  private fillModelUpdateWithFragments(modelUpd: ModelUpdate | any) {
    if (this.fragmentsMap.size === 0)
      return
    for (let [type, fragments] of this.fragmentsMap) {
      for (let [id, frag] of fragments) {
        if (frag === undefined)
          throw new Error(`Invalid call to "toCargo()", the loader is not completed`)
        if (!modelUpd.fragments)
          modelUpd.fragments = {}
        if (!modelUpd.fragments[type])
          modelUpd.fragments[type] = []
        modelUpd.fragments[type].push(frag)
      }
    }
  }

  private fillModelUpdateWithPartial(modelUpd: ModelUpdate | any) {
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
        modelUpd.partial[type].push(partialFrag)
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

  private tryToMergeInFragments(type: Type, id: Identifier, partialFrag: {}): boolean {
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

function isObjEmpty(obj: {}): boolean {
  for (let k in obj) {
    if (obj.hasOwnProperty(k))
      return false
  }
  return true
}