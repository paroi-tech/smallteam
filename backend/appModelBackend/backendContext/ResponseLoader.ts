import { Cargo, Identifier, Result, Type, ResultType, CargoResponse } from "../../../isomorphic/Cargo"

export default class ResponseLoader {
  private displayError: string[] = []
  private debugData: any[] = []
  private result: Result | undefined
  private done: boolean | undefined
  private ended = false

  constructor(private resultType: ResultType) {
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

  public setResultFragment(type: Type, id: Identifier) {
    if (this.ended)
      throw new Error(`Invalid call to "setResultFragment": the Cargo is completed`)
    if (this.resultType !== "fragment")
      throw new Error(`Result type conflict in cargo, "fragment" should be ${this.resultType}`)
    if (this.result !== undefined)
      throw new Error(`Cannot define result twice`)
    // if (!this.contains(type, id))
    //   throw new Error(`Cannot define a result fragment without data (${type}, ${JSON.stringify(id)})`)
    this.result = {
      type: "fragment",
      val: { type, id }
    }
  }

  public addToResultFragments(type: Type, id: Identifier) {
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
    this.result.val!.list.push(id)
  }

  public setDone(done: boolean) {
    if (this.ended)
      throw new Error(`Invalid call to "setDone": the Cargo is completed`)
    this.done = done
  }

  public toResponse(): CargoResponse {
    this.ended = true
    let response: Cargo = {
      done: this.done === undefined || this.done
    }
    if (this.displayError.length > 0)
      response.displayError = this.displayError.length === 1 ? this.displayError[0] : [...this.displayError]
    if (this.debugData.length > 0)
      response.debugData = this.debugData.length === 1 ? this.debugData[0] : [...this.debugData]
    if (this.result !== undefined)
      response.result = this.result // TODO: copy?
    else if (this.resultType !== undefined && this.resultType !== "none")
      response.result = { type: this.resultType } as Result
    return response
  }
}
