import Deferred from "../libraries/Deferred"
import ModelEngine from "./ModelEngine"
import { Type, Identifier } from "../../isomorphic/Cargo"
import { ModelCommandMethods } from "./modelDefinitions"
import GenericBgCommandManager from "./BgCommandManager";

interface EngineCommand {
  method: string
  args: any[]
  deferred: Deferred<any>
}

export class GenericCommandBatch implements ModelCommandMethods {
  private commands: EngineCommand[] = []

  constructor(private engine: ModelEngine, private bgCommandMng: GenericBgCommandManager) {
  }

  public exec(...args): Promise<any> {
    let deferred = new Deferred<any>()
    this.commands.push({
      method: "exec",
      args,
      deferred
    })
    return this.bgCommandMng.add(deferred.promise, `${args[0]} ${args[1]}`).promise
  }

  public query(...args): Promise<any[]> {
    let deferred = new Deferred<any[]>()
    this.commands.push({
      method: "query",
      args,
      deferred
    })
    return this.bgCommandMng.add(deferred.promise, `query ${args[0]}`).promise
  }

  public reorder(type: Type, idList: Identifier[], groupId?: Identifier): Promise<any[]> {
    let deferred = new Deferred<Identifier[]>()
    this.commands.push({
      method: "reorder",
      args: [type, { idList, groupId }],
      deferred
    })
    return this.bgCommandMng.add(deferred.promise, `reorder ${type}`).promise
  }

  public async sendAll(): Promise<any[]> {
    let count = this.commands.length
    try {
      this.engine.startBatchRecord()
      let promises: Promise<any>[] = []
      for (let c of this.commands)
        promises.push(this.engine[c.method](...c.args))
      await this.engine.sendBatchRecord()
      for (let i = 0; i < count; ++i)
        this.commands[i].deferred.pipeTo(promises[i])
      return Promise.all(promises)
    } catch (err) {
      this.engine.cancelBatchRecord(err)
      for (let c of this.commands)
        c.deferred.reject(err)
      throw err
    }
  }
}
