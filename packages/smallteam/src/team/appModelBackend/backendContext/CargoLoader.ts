import { BatchCargo, Cargo, Dependencies, Identifier, ResultType, Type } from "@smallteam-local/shared/dist/Cargo"
import { toIdentifier } from "@smallteam-local/shared/dist/meta"
import ModelUpdateLoader, { ChangedType } from "./ModelUpdateLoader"
import ResponseLoader from "./ResponseLoader"

export interface FragmentOptions {
  type: Type
  frag?: object
  partialFrag?: object
  id?: Identifier
  asResult?: "fragment" | "fragments"
  markAs?: ChangedType
}

export default class CargoLoader {

  get response() {
    const len = this.responses.length
    if (len === 0)
      throw new Error("Missing current response")
    return this.responses[len - 1]
  }

  readonly modelUpdate = new ModelUpdateLoader()
  private responses: ResponseLoader[] = []
  private ended = false

  constructor(private isBatch = false) {
  }

  startResponse(resultType: ResultType) {
    if (this.ended)
      throw new Error("Invalid call to \"startResponse\": the Cargo is completed")
    if (this.responses.length !== 0 && !this.isBatch)
      throw new Error("Cannot add a new response, the loader is not in batch mode")
    this.responses.push(new ResponseLoader(resultType))
  }

  addDependencies(dependencies: Dependencies[]) {
    for (const dep of dependencies) {
      for (const id of dep.idList)
        this.modelUpdate.addFragment(dep.type, id)
    }
  }

  addFragment(opt: FragmentOptions) {
    if (this.ended)
      throw new Error("Invalid call to \"addFragment\": the Cargo is completed")
    let id: Identifier
    if (opt.id === undefined) {
      if (opt.frag)
        id = toIdentifier(opt.frag, opt.type)
      else if (opt.partialFrag)
        id = toIdentifier(opt.partialFrag, opt.type)
      else
        throw new Error("Canot evaluate the fragment identifier: missing \"id\" or \"frag\" or \"partialFrag\"")
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

  toCargo(): Cargo {
    this.ended = true
    const cargo: Cargo = this.response.toResponse()
    const modelUpd = this.modelUpdate.toModelUpdate()
    if (modelUpd)
      cargo.modelUpd = modelUpd
    return cargo
  }

  toBatchCargo(): BatchCargo {
    const batchCargo: BatchCargo = {}
    if (this.responses.length > 0)
      batchCargo.responses = this.responses.map(response => response.toResponse())
    const modelUpd = this.modelUpdate.toModelUpdate()
    if (modelUpd)
      batchCargo.modelUpd = modelUpd
    return batchCargo
  }
}
