import { Cargo, BatchCargo, Identifier, FragmentRef, FragmentsRef, Result, Type, ResultType, ModelUpdate, CargoResponse, Dependencies } from "../../isomorphic/Cargo"
import ModelUpdateLoader, { ChangedType } from "./ModelUpdateLoader"
import ResponseLoader from "./ResponseLoader"
import { toIdentifier } from "../../isomorphic/meta"

export type FragmentOptions = {
  type: Type
  frag?: object
  partialFrag?: object
  id?: Identifier
  asResult?: "fragment" | "fragments"
  markAs?: ChangedType
}

export default class CargoLoader {
  private responses: ResponseLoader[] = []
  private ended = false

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
    if (this.ended)
      throw new Error(`Invalid call to "startResponse": the Cargo is completed`)
    if (this.responses.length !== 0 && !this.isBatch)
      throw new Error(`Cannot add a new response, the loader is not in batch mode`)
    this.responses.push(new ResponseLoader(resultType))
  }

  public addDependencies(dependencies: Dependencies[]) {
    for (let dep of dependencies) {
      for (let id of dep.idList)
        this.modelUpdate.addFragment(dep.type, id)
    }
  }

  public addFragment(opt: FragmentOptions) {
    if (this.ended)
      throw new Error(`Invalid call to "addFragment": the Cargo is completed`)
    let id: Identifier
    if (opt.id === undefined) {
      if (opt.frag)
        id = toIdentifier(opt.frag, opt.type)
      else if (opt.partialFrag)
        id = toIdentifier(opt.partialFrag, opt.type)
      else
        throw new Error(`Canot evaluate the fragment identifier: missing "id" or "frag" or "partialFrag"`)
    } else
      id = opt.id

    if (opt.partialFrag)
      this.modelUpdate.addPartial(opt.type, opt.partialFrag)
    else
      this.modelUpdate.addFragment(opt.type, id, opt.frag)

    if (opt.markAs)
      this.modelUpdate.markFragmentAs(opt.type, id, opt.markAs)

    if (opt.asResult === "fragment")
      this.response.setResultFragment(opt.type, id)
    else if (opt.asResult === "fragments")
      this.response.addToResultFragments(opt.type, id)
  }

  public toCargo(): Cargo {
    this.ended = true
    let cargo: Cargo = this.response.toResponse()
    let modelUpd = this.modelUpdate.toModelUpdate()
    if (modelUpd)
      cargo.modelUpd = modelUpd
    return cargo
  }

  public toBatchCargo(): BatchCargo {
    let batchCargo: BatchCargo = {}
    if (this.responses.length > 0)
      batchCargo.responses = this.responses.map(response => response.toResponse())
    let modelUpd = this.modelUpdate.toModelUpdate()
    if (modelUpd)
      batchCargo.modelUpd = modelUpd
    return batchCargo
  }
}
