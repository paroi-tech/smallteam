import { Type, Identifier } from "../../isomorphic/Cargo"
import { NewContributorFragment, UpdContributorFragment, ContributorQuery } from "../../isomorphic/fragments/Contributor"
import { ContributorModel, registerContributor } from "./Models/ContributorModel"
import { NewProjectFragment, UpdProjectFragment, ProjectIdFragment, ProjectQuery } from "../../isomorphic/fragments/Project"
import { ProjectModel, registerProject } from "./Models/ProjectModel"
import { NewTaskFragment, UpdTaskFragment, TaskIdFragment } from "../../isomorphic/fragments/Task"
import { TaskModel, registerTask } from "./Models/TaskModel"
import { NewStepFragment, StepIdFragment } from "../../isomorphic/fragments/Step"
import { StepModel, registerStep } from "./Models/StepModel"
import { NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { StepTypeModel, registerStepType } from "./Models/StepTypeModel"
import { FlagModel, registerFlag } from "./Models/FlagModel"
import { ComponentEvent, Transmitter, Dash } from "bkb"
import ModelEngine, { CommandType, ModelEvent } from "./ModelEngine"
import App from "../App/App"
import { registerComment } from "./Models/CommentModel"
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel"
import { GenericCommandBatch } from "./GenericCommandBatch"
import { Model, CommandBatch, GlobalModels, ReadonlyCollection, Collection } from "./modelDefinitions"
import { FragmentMeta } from "../../isomorphic/FragmentMeta";
import { toIdentifier } from "../../isomorphic/meta";
import { makeHKMap } from "../../isomorphic/libraries/HKCollections";

export { CommandType, ModelEvent } from "./ModelEngine"
export { Model, WhoUseItem, CommandBatch } from "./modelDefinitions"

export { CommentModel } from "./Models/CommentModel"
export { ContributorModel } from "./Models/ContributorModel"
export { FlagModel } from "./Models/FlagModel"
export { ProjectModel } from "./Models/ProjectModel"
export { StepModel } from "./Models/StepModel"
export { StepTypeModel } from "./Models/StepTypeModel"
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine
  readonly global: GlobalModels

  constructor(private dash: Dash<App>) {
    this.engine = new ModelEngine(dash)
    registerContributor(this.engine)
    registerComment(this.engine)
    registerFlag(this.engine)
    registerTaskLogEntry(this.engine)
    registerProject(this.engine)
    registerTask(this.engine)
    registerStep(this.engine)
    registerStepType(this.engine)
    this.global = createGlobal(this)
  }

  // --
  // -- ModelCommandMethods
  // --

  public exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    return this.engine.exec(cmd, type, fragOrId)
  }

  public query(type: Type, filters?: any): Promise<any[]> {
    return this.engine.query(type, filters)
  }

  public reorder(type: Type, idList: Identifier[], groupId?: Identifier): Promise<any[]> {
    return this.engine.reorder(type, { idList, groupId })
  }

  // --
  // -- ModelEventMethods
  // --

  public on(eventName: string, modeOrCb, callback?): this {
    this.dash.on(eventName, modeOrCb, callback)
    return this
  }

  public listen(eventName: string): Transmitter<ModelEvent> {
    return this.dash.listen(eventName)
  }

  // --
  // -- Model
  // --

  public createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine)
  }
}

function createGlobal(model: ModelComp): GlobalModels {
  let batch = model.createCommandBatch()
  batch.query("StepType")
  batch.query("Flag")
  batch.query("Contributor")
  batch.query("Project", { archived: false })

  let propNames = ["stepTypes", "flags", "contributors", "projects"]
  let typeNames: Type[] = ["StepType", "Flag", "Contributor", "Project"]
  let isReady = false,
    collections = {}
  let batchPromise = batch.sendAll().then(results => {
    for (let i = 0; i < propNames.length; ++i)
      collections[propNames[i]] = toCollection<any, any>(results[i], typeNames[i])
    isReady = true
  })

  let obj = {
    isReady,
    load: batchPromise
  }

  let properties = {}
  for (let name of propNames) {
    properties[name] = {
      configurable: false,
      enumerable: true,
      get: function () {
        if (!collections[name])
          throw new Error(`Model "global" is not ready`)
        return collections[name]
      }
    }
  }
  Object.defineProperties(obj, properties)

  return obj as GlobalModels
}

function toCollection<M extends object, ID extends Identifier>(models: M[], type: Type): Collection<M, ID> {
  let map = makeHKMap<ID, M>()
  for (let model of models)
    map.set(toIdentifier(model, type) as ID, model)
  let coll: any = models
  coll.get = id => map.get(id)
  return coll
}
