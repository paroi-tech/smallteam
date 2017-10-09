import { Type, Identifier } from "../../isomorphic/Cargo"
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../isomorphic/meta/Contributor"
import { registerContributor } from "./Models/ContributorModel"
import { ProjectCreateFragment, ProjectUpdateFragment, ProjectIdFragment } from "../../isomorphic/meta/Project"
import { registerProject } from "./Models/ProjectModel"
import { TaskCreateFragment, TaskUpdateFragment, TaskIdFragment } from "../../isomorphic/meta/Task"
import { registerTask } from "./Models/TaskModel"
import { StepCreateFragment, StepIdFragment } from "../../isomorphic/meta/Step"
import { registerStep } from "./Models/StepModel"
import { StepTypeCreateFragment, StepTypeUpdateFragment } from "../../isomorphic/meta/StepType"
import { registerStepType } from "./Models/StepTypeModel"
import { registerFlag } from "./Models/FlagModel"
import { ComponentEvent, Transmitter, Dash } from "bkb"
import ModelEngine, { CommandType, toCollection } from "./ModelEngine"
import App from "../App/App"
import { registerComment } from "./Models/CommentModel"
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel"
import { GenericCommandBatch } from "./GenericCommandBatch"
import { Model, CommandBatch, GlobalModels, ReadonlyCollection, Collection, Session, SessionData } from "./modelDefinitions"
import { FragmentMeta, toIdentifier } from "../../isomorphic/meta"
import { makeHKMap, HKMap } from "../../isomorphic/libraries/HKCollections"
import GenericBgCommandManager from "./BgCommandManager"

export { CommandType, UpdateModelEvent, ReorderModelEvent } from "./ModelEngine"
export { Model, WhoUseItem, CommandBatch } from "./modelDefinitions"

export { CommentModel } from "./Models/CommentModel"
export { ContributorModel } from "./Models/ContributorModel"
export { FlagModel } from "./Models/FlagModel"
export { ProjectModel } from "./Models/ProjectModel"
export { StepModel } from "./Models/StepModel"
export { StepTypeModel } from "./Models/StepTypeModel"
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"
export { Session, SessionData }

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine
  readonly bgCommandMng: GenericBgCommandManager
  readonly global: GlobalModels
  readonly session: Session

  constructor(private dash: Dash<App>, sessionData: SessionData) {
    this.engine = new ModelEngine(dash)
    this.bgCommandMng = new GenericBgCommandManager(dash)
    registerContributor(this.engine)
    registerComment(this.engine)
    registerFlag(this.engine)
    registerTaskLogEntry(this.engine)
    registerProject(this.engine)
    registerTask(this.engine)
    registerStep(this.engine, this)
    registerStepType(this.engine)
    this.global = createGlobal(this)
    this.session = createSession(this.global, sessionData.contributorId)
  }

  // --
  // -- ModelCommandMethods
  // --

  public exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    return this.bgCommandMng.add(this.engine.exec(cmd, type, fragOrId), `${cmd} ${type}`).promise
  }

  public query(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    return this.bgCommandMng.add(this.engine.query(type, filters), `query ${type}`).promise
  }

  public reorder(type: Type, idList: Identifier[], groupName?: string, groupId?: Identifier): Promise<any[]> {
    return this.bgCommandMng.add(this.engine.reorder(type, { idList, groupName, groupId }), `reorder ${type}`).promise
  }

  // --
  // -- Model
  // --

  public createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine, this.bgCommandMng)
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
      collections[propNames[i]] = toCollection(results[i], typeNames[i])
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

function createSession(global: GlobalModels, contributorId: string): Session {
  return {
    get contributor() {
      let contributor = global.contributors.get(contributorId)
      if (!contributor)
        throw new Error(`Unknown session contributor "${contributorId}"`)
      return contributor
    }
  }
}
