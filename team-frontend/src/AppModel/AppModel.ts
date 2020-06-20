import { Identifier, ModelUpdate, Type } from "../../../shared/Cargo"
import { OwnDash } from "../AppFrame/OwnDash"
import GenericBgCommandManager from "./BgCommandManager"
import { GenericCommandBatch } from "./GenericCommandBatch"
import { Collection, CommandBatch, GlobalModels, Model, Session, SessionData } from "./modelDefinitions"
import ModelEngine, { CommandType } from "./ModelEngine"
import { registerAccount } from "./Models/AccountModel"
import { registerComment } from "./Models/CommentModel"
import { registerFlag } from "./Models/FlagModel"
import { registerGitCommit } from "./Models/GitCommitModel"
import { registerMedia } from "./Models/MediaModel"
import { registerMediaVariant } from "./Models/MediaVariantModel"
import { ProjectModel, registerProject } from "./Models/ProjectModel"
import { registerStep, StepModel } from "./Models/StepModel"
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel"
import { registerTask, TaskModel } from "./Models/TaskModel"

export { CommandBatch, Model } from "./modelDefinitions"
export { CommandType, ReorderModelEvent, UpdateModelEvent } from "./ModelEngine"
export { AccountModel } from "./Models/AccountModel"
export { CommentModel } from "./Models/CommentModel"
export { FlagModel } from "./Models/FlagModel"
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"
export { ProjectModel }
export { StepModel }
export { Session, SessionData }


export const ARCHIVED_STEP_ID = "2"
export const ON_HOLD_STEP_ID = "1"

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  readonly bgManager: GenericBgCommandManager
  readonly global: GlobalModels
  readonly session: Session
  private engine: ModelEngine

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

  exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    return this.engine.exec(cmd, type, fragOrId)
  }

  fetch(type: Type, filters?: any): Promise<Collection<any, Identifier>> {
    return this.engine.fetch(type, filters)
  }

  reorder(type: Type, idList: Identifier[], groupName?: string, groupId?: Identifier): Promise<any[]> {
    return this.engine.reorder(type, { idList, groupName, groupId })
  }

  // --
  // -- Model
  // --

  createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine)
  }

  processModelUpdate(modelUpd: ModelUpdate) {
    this.engine.processModelUpdate(modelUpd)
  }

  findTaskByCode(code: string): TaskModel | undefined {
    let models = this.engine.getModels({
      type: "Task",
      index: "code",
      key: { code }
    })
    if (models.length === 1)
      return models[0]
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
      get() {
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
