import { Type, Identifier, ModelUpdate } from "../../shared/Cargo"
import { registerAccount } from "./Models/AccountModel"
import { registerProject, ProjectModel } from "./Models/ProjectModel"
import { registerTask } from "./Models/TaskModel"
import { registerStep, StepModel } from "./Models/StepModel"
import { registerFlag } from "./Models/FlagModel"
import { registerMedia } from "./Models/MediaModel"
import { registerMediaVariant } from "./Models/MediaVariantModel"
import ModelEngine, { CommandType } from "./ModelEngine"
import { registerComment } from "./Models/CommentModel"
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel"
import { GenericCommandBatch } from "./GenericCommandBatch"
import { Model, CommandBatch, GlobalModels, Collection, Session, SessionData } from "./modelDefinitions"
import GenericBgCommandManager from "./BgCommandManager"
import { OwnDash } from "../App/OwnDash"
import { registerGitCommit } from "./Models/GitCommitModel"

export { CommandType, UpdateModelEvent, ReorderModelEvent } from "./ModelEngine"
export { Model, CommandBatch } from "./modelDefinitions"

export { CommentModel } from "./Models/CommentModel"
export { AccountModel } from "./Models/AccountModel"
export { FlagModel } from "./Models/FlagModel"
export { ProjectModel }
export { StepModel }
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"
export { Session, SessionData }

export const ARCHIVED_STEP_ID = "2"
export const ON_HOLD_STEP_ID = "1"

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine
  readonly bgManager: GenericBgCommandManager
  readonly global: GlobalModels
  readonly session: Session

  constructor(private dash: OwnDash, sessionData: SessionData) {
    this.engine = new ModelEngine(dash, dash.app.baseUrl)
    this.bgManager = this.engine.bgManager
    registerAccount(this.engine)
    registerComment(this.engine)
    registerFlag(this.engine)
    registerTaskLogEntry(this.engine)
    registerProject(this.engine)
    registerTask(this.engine)
    registerStep(this.engine)
    registerMedia(this.engine)
    registerMediaVariant(this.engine)
    registerGitCommit(this.engine)
    this.global = createGlobal(this.dash, this.engine)
    this.session = createSession(this.global, sessionData.accountId)
  }

  // --
  // -- ModelCommandMethods
  // --

  public exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    return this.engine.exec(cmd, type, fragOrId)
  }

  public fetch(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    return this.engine.fetch(type, filters)
  }

  public reorder(type: Type, idList: Identifier[], groupName?: string, groupId?: Identifier): Promise<any[]> {
    return this.engine.reorder(type, { idList, groupName, groupId })
  }

  // --
  // -- Model
  // --

  public createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine)
  }

  public processModelUpdate(modelUpd: ModelUpdate) {
    this.engine.processModelUpdate(modelUpd)
  }
}

function createGlobal(dash: OwnDash, engine: ModelEngine): GlobalModels {
  let batch = new GenericCommandBatch(engine)
  batch.fetch("Step")
  batch.fetch("Flag")
  batch.fetch("Account")
  batch.fetch("Project", { archived: false })
  let isReady = false
  let batchPromise = batch.sendAll().then(results => {
    isReady = true
  })

  const collFactories = {
    "steps": {
      type: "Step",
      factory: () => engine.getAllModels<StepModel>("Step", ["orderNum", "asc"]).filter(step => step.orderNum !== null)
    },
    "specialSteps": {
      type: "Step",
      factory: () => engine.getAllModels<StepModel>("Step", ["orderNum", "asc"]).filter(step => step.orderNum === null)
    },
    "allSteps": {
      type: "Step",
      factory: () => engine.getAllModels<StepModel>("Step", ["orderNum", "asc"])
    },
    "flags": {
      type: "Flag",
      factory: () => engine.getAllModels("Flag", ["orderNum", "asc"])
    },
    "accounts": {
      type: "Account",
      factory: () => engine.getAllModels("Account", ["name", "asc"])
    },
    "projects": {
      type: "Project",
      factory: () => engine.getAllModels<ProjectModel>("Project", ["name", "asc"]).filter(project => !project.archived)
    }
  }

  let cache = new Map(),
    properties = {}
  for (let [name, options] of Object.entries(collFactories)) {
    properties[name] = {
      configurable: false,
      enumerable: true,
      get: function () {
        if (!isReady)
          throw new Error(`Model "global" is not ready`)
        let coll = cache.get(name)
        if (!coll)
          cache.set(name, coll = options.factory())
        return coll
      }
    }
    dash.listenTo(`change${options.type}`, model => cache.delete(name))
  }

  let obj = {
    isReady,
    loading: batchPromise
  }
  Object.defineProperties(obj, properties)
  return obj as GlobalModels
}

/**
 * @param asyncCollections Will be filled after the call of this method
 */
function makeGlobalProperties(propNames: string[], collFactories: object) {
}

function createSession(global: GlobalModels, accountId: string): Session {
  return {
    get account() {
      let account = global.accounts.get(accountId)
      if (!account)
        throw new Error(`Unknown session account "${accountId}"`)
      return account
    }
  }
}
