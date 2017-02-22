import { Cargo, Identifier, FragmentRef, FragmentsRef, Result, Type, ResultType, ModelUpdate, Response } from "../../isomorphic/Cargo"
import ModelUpdateLoader from "./ModelUpdateLoader"
import ResponseLoader from "./ResponseLoader"

export default class CargoLoader {
  private responses: ResponseLoader[]
  private ended: boolean

  public readonly modelUpdate = new ModelUpdateLoader()

  constructor(private isBatch = false) {
  }

  public get response() {
    let len = this.responses.length
    if (len === 0)
      throw new Error(`Missing current response`)
    return this.responses[len - 1]
  }

  public startResponse(resultType: ResultType) {
    if (this.responses.length !== 0 && !this.isBatch)
      throw new Error(`Cannot add a new response, the loader is not in batch mode`)
    this.responses.push(new ResponseLoader(resultType))
  }
}
