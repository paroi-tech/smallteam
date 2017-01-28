import { Cargo, Identifier, FragmentRef, FragmentsRef, Result, Type } from "../isomorphic/Cargo"

export default class CargoLoader {
  private map = new Map<Type, Map<Identifier, any | undefined>>()
  private displayError: string[] = []
  private debugData: any[] = []
  private result: Result | undefined
  private done = true

  public addFragment(type: Type, id: Identifier, frag?) {
    let fragments = this.map.get(type)
    if (!fragments) {
      fragments = new Map()
      this.map.set(type, fragments)
    }
    fragments.set(id, frag)
  }

  public getNeeded(type: Type): Identifier[] {
    let idList: Identifier[] = [],
      fragments = this.map.get(type)
    if (!fragments)
      return idList
    for (let [id, data] of fragments) {
      if (data === undefined)
        idList.push(id)
    }
    return idList
  }

  public isComplete(): boolean {
    for (let [type, fragments] of this.map.entries()) {
      for (let [id, data] of fragments.entries()) {
        if (data === undefined)
          return false
      }
    }
    return true
  }

  public contains(type: Type, id: Identifier): boolean {
    let fragments = this.map.get(type)
    return fragments !== undefined && fragments.has(id)
  }

  public addDisplayError(msg: string) {
    this.displayError.push(msg)
  }

  public addDebugData(debugData: any) {
    this.debugData.push(debugData)
  }

  public setResultData(data: any) {
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    this.result = {
      type: "data",
      val: data
    }
  }

  public setResultFragment(type: Type, id: Identifier) {
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    if (!this.contains(type, id))
      throw new Error(`Cannot define a result fragment without data (${type}, ${JSON.stringify(id)})`)
    this.result = {
      type: "fragment",
      val: { type, id }
    }
  }

  public addToResultFragments(type: Type, id: Identifier) {
    if (!this.result) {
      this.result = {
        type: "fragments",
        val: { type, list: [] }
      }
    }
    if (this.result.type !== "fragments")
      throw new Error(`Cannot define result twice`)
    if (this.result.val.type !== type)
      throw new Error(`Conflict with fragments types, cannot add ${type} in result of type ${this.result.val.type}`)
    if (!this.contains(type, id))
      throw new Error(`Cannot define a result fragment without data (${type}, ${JSON.stringify(id)})`)
    this.result.val.list.push(id)
  }

  public setDone(done: boolean) {
    this.done = done
  }

  public toCargo(): Cargo {
    let resultFragments
    if (this.map.size > 0) {
      resultFragments = {}
      for (let [type, fragments] of this.map.entries()) {
        resultFragments[type] = []
        for (let data of fragments.values()) {
          if (data === undefined)
            throw new Error(`Cannot call "toCargo()", the loader is not completed`)
          resultFragments[type].push(data)
        }
      }
    }
    let cargo: Cargo = {
      done: this.done
    }
    if (resultFragments)
      cargo.fragments = resultFragments
    if (this.displayError.length > 0)
      cargo.displayError = this.displayError.length === 1 ? this.displayError[0] : [...this.displayError]
    if (this.debugData.length > 0)
      cargo.debugData = this.debugData.length === 1 ? this.debugData[0] : [...this.debugData]
    if (this.result !== undefined)
      cargo.result = this.result // TODO: copy?
    return cargo
  }
}