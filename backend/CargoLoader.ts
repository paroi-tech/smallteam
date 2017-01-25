import { Cargo, Identifier, EntityRef, EntitiesRef, Result, Type } from "../isomorphic/Cargo"

export default class CargoLoader {
  private map = new Map<Type, Map<Identifier, any | undefined>>()
  private displayError: string[] = []
  private debugData: any[] = []
  private result: Result | undefined
  private done = true

  public addEntity(type: Type, id: Identifier, data?) {
    let entities = this.map.get(type)
    if (!entities) {
      entities = new Map()
      this.map.set(type, entities)
    }
    entities.set(id, data)
  }

  public getNeeded(type: Type): Identifier[] {
    let idList: Identifier[] = [],
      entities = this.map.get(type)
    if (!entities)
      return idList
    for (let [id, data] of entities) {
      if (data === undefined)
        idList.push(id)
    }
    return idList
  }

  public isComplete(): boolean {
    for (let [type, entities] of this.map.entries()) {
      for (let [id, data] of entities.entries()) {
        if (data === undefined)
          return false
      }
    }
    return true
  }

  public contains(type: Type, id: Identifier): boolean {
    let entities = this.map.get(type)
    return entities !== undefined && entities.has(id)
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

  public setResultEntity(type: Type, id: Identifier) {
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    if (!this.contains(type, id))
      throw new Error(`Cannot define a result entity without data (${type}, ${JSON.stringify(id)})`)
    this.result = {
      type: "entity",
      val: { type, id }
    }
  }

  public addToResultEntities(type: Type, id: Identifier) {
    if (!this.result) {
      this.result = {
        type: "entities",
        val: { type, list: [] }
      }
    }
    if (this.result.type !== "entities")
      throw new Error(`Cannot define result twice`)
    if (this.result.val.type !== type)
      throw new Error(`Conflict with entities types, cannot add ${type} in result of type ${this.result.val.type}`)
    if (!this.contains(type, id))
      throw new Error(`Cannot define a result entity without data (${type}, ${JSON.stringify(id)})`)
    this.result.val.list.push(id)
  }

  public setDone(done: boolean) {
    this.done = done
  }

  public toCargo(): Cargo {
    let resultEntities
    if (this.map.size > 0) {
      resultEntities = {}
      for (let [type, entities] of this.map.entries()) {
        resultEntities[type] = []
        for (let data of entities.values()) {
          if (data === undefined)
            throw new Error(`Cannot call "toCargo()", the loader is not completed`)
          resultEntities[type].push(data)
        }
      }
    }
    let cargo: Cargo = {
      done: this.done
    }
    if (resultEntities)
      cargo.entities = resultEntities
    if (this.displayError.length > 0)
      cargo.displayError = this.displayError.length === 1 ? this.displayError[0] : [...this.displayError]
    if (this.debugData.length > 0)
      cargo.debugData = this.debugData.length === 1 ? this.debugData[0] : [...this.debugData]
    if (this.result !== undefined)
      cargo.result = this.result // TODO copy?
    return cargo
  }
}