import { Cargo, Identifier, FragmentRef, FragmentsRef, Result, Type, ResultType, ModelUpdate } from "../isomorphic/Cargo"
import { makeHKMap, HKMap } from "../isomorphic/libraries/HKCollections"

type ChangedType = "created" | "updated" | "deleted"

export default class CargoLoader {
  private fragmentsMap = new Map<Type, HKMap<Identifier, any | undefined>>()
  private changedMap = new Map<Type, HKMap<Identifier, ChangedType>>()
  private displayError: string[] = []
  private debugData: any[] = []
  private result: Result | undefined
  private done = true
  private ended = false

  constructor(private resultType: ResultType) {
  }

  public updateModelAddFragment(type: Type, id: Identifier, frag?: any) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModelAddFragment": the Cargo is completed`)
    let fragments = this.fragmentsMap.get(type)
    if (!fragments) {
      fragments = makeHKMap<any, any>()
      this.fragmentsMap.set(type, fragments)
    }
    if (!fragments.has(id) || frag !== undefined)
      fragments.set(id, frag)
  }

  public updateModelMarkFragmentAs(type: Type, id: Identifier, changedType: ChangedType) {
    if (this.ended)
      throw new Error(`Invalid call to "updateModelMarkFragmentAs": the Cargo is completed`)
    let changed = this.changedMap.get(type)
    if (!changed) {
      changed = makeHKMap<any, any>()
      this.changedMap.set(type, changed)
    }
    changed.set(id, changedType)
  }

  public getNeeded(type: Type): Identifier[] {
    if (this.ended)
      throw new Error(`Invalid call to "getNeeded": the Cargo is completed`)
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

  public isComplete(): boolean {
    for (let [type, fragments] of this.fragmentsMap.entries()) {
      for (let [id, frag] of fragments.entries()) {
        if (frag === undefined)
          return false
      }
    }
    return true
  }

  public contains(type: Type, id: Identifier): boolean {
    let fragments = this.fragmentsMap.get(type)
    return fragments !== undefined && fragments.has(id)
  }

  public addDisplayError(msg: string) {
    if (this.ended)
      throw new Error(`Invalid call to "addDisplayError", msg: ${msg}`)
    this.displayError.push(msg)
  }

  public addDebugData(debugData: any) {
    if (this.ended)
      throw new Error(`Invalid call to "addDebugData": the Cargo is completed`)
    this.debugData.push(debugData)
  }

  public setResultData(data: any) {
    if (this.ended)
      throw new Error(`Invalid call to "setResultData": the Cargo is completed`)
    if (this.resultType !== "data")
      throw new Error(`Result type conflict in cargo, "data" should be ${this.resultType}`)
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    this.result = {
      type: "data",
      val: data
    }
  }

  public setResultFragment(type: Type, id: Identifier, frag?) {
    if (this.ended)
      throw new Error(`Invalid call to "setResultFragment": the Cargo is completed`)
    if (this.resultType !== "fragment")
      throw new Error(`Result type conflict in cargo, "fragment" should be ${this.resultType}`)
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    // if (!this.contains(type, id))
    //   throw new Error(`Cannot define a result fragment without data (${type}, ${JSON.stringify(id)})`)
    this.updateModelAddFragment(type, id, frag)
    this.result = {
      type: "fragment",
      val: { type, id }
    }
  }

  public addToResultFragments(type: Type, id: Identifier, frag?) {
    if (this.ended)
      throw new Error(`Invalid call to "addToResultFragments": the Cargo is completed`)
    if (this.resultType !== "fragments")
      throw new Error(`Result type conflict in cargo, "fragments" should be ${this.resultType}`)
    // if (!this.contains(type, id))
    //   throw new Error(`Cannot define a result fragment without data (${type}, ${JSON.stringify(id)})`)
    if (this.result) {
      if (this.result.type !== "fragments")
        throw new Error(`Cannot define result twice`)
      if (this.result.val!.type !== type)
        throw new Error(`Conflict with fragments types, cannot add ${type} in result of type ${this.result.val!.type}`)
    } else {
      this.result = {
        type: "fragments",
        val: { type, list: [] }
      }
    }
    this.updateModelAddFragment(type, id, frag)
    this.result.val!.list.push(id)
  }

  public setDone(done: boolean) {
    if (this.ended)
      throw new Error(`Invalid call to "setDone": the Cargo is completed`)
    this.done = done
  }

  public toCargo(): Cargo {
    this.ended = true
    let cargo: Cargo = {
      done: this.done
    }
    let modelUpd: ModelUpdate = {}
    this.fillModelUpdateWithFragments(modelUpd)
    this.fillModelUpdateWithChanges(modelUpd)
    if (!isObjEmpty(modelUpd))
      cargo.modelUpd = modelUpd
    if (this.displayError.length > 0)
      cargo.displayError = this.displayError.length === 1 ? this.displayError[0] : [...this.displayError]
    if (this.debugData.length > 0)
      cargo.debugData = this.debugData.length === 1 ? this.debugData[0] : [...this.debugData]
    if (this.result !== undefined)
      cargo.result = this.result // TODO: copy?
    else if (this.resultType !== undefined && this.resultType !== "none")
      cargo.result = { type: this.resultType } as Result
    return cargo
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
      for (let [id, data] of fragments) {
        if (data === undefined)
          throw new Error(`Invalid call to "toCargo()", the loader is not completed`)
        if (!modelUpd.fragments)
          modelUpd.fragments = {}
        if (!modelUpd.fragments[type])
          modelUpd.fragments[type] = []
        modelUpd.fragments[type].push(data)
      }
    }
  }
}

function isObjEmpty(obj: {}): boolean {
  for (let k in obj) {
    if (obj.hasOwnProperty(k))
      return false
  }
  return true
}