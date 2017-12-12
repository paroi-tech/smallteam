import { Type, Identifier } from "../../isomorphic/Cargo"
import { ContributorCreateFragment, ContributorUpdateFragment } from "../../isomorphic/meta/Contributor"
import { registerContributor } from "./Models/ContributorModel"
import { ProjectCreateFragment, ProjectUpdateFragment, ProjectIdFragment } from "../../isomorphic/meta/Project"
import { registerProject, ProjectModel } from "./Models/ProjectModel"
import { TaskCreateFragment, TaskUpdateFragment, TaskIdFragment } from "../../isomorphic/meta/Task"
import { registerTask } from "./Models/TaskModel"
import { StepCreateFragment, StepUpdateFragment, StepFragment } from "../../isomorphic/meta/Step"
import { registerStep, StepModel } from "./Models/StepModel"
import { registerFlag } from "./Models/FlagModel"
import { registerFileInfo } from "./Models/FileInfoModel"
import { ComponentEvent, Transmitter, Dash } from "bkb"
import ModelEngine, { CommandType, toCollection } from "./ModelEngine"
import App from "../App/App"
import { registerComment } from "./Models/CommentModel"
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel"
import { GenericCommandBatch } from "./GenericCommandBatch"
import { Model, CommandBatch, GlobalModels, Collection, Session, SessionData } from "./modelDefinitions"
import { makeHKMap, HKMap } from "../../isomorphic/libraries/HKCollections"
import GenericBgCommandManager from "./BgCommandManager"

export { CommandType, UpdateModelEvent, ReorderModelEvent } from "./ModelEngine"
export { Model, CommandBatch } from "./modelDefinitions"

export { CommentModel } from "./Models/CommentModel"
export { ContributorModel } from "./Models/ContributorModel"
export { FlagModel } from "./Models/FlagModel"
export { ProjectModel }
export { StepModel }
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"
export { Session, SessionData }

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine
  readonly bgManager: GenericBgCommandManager
  readonly global: GlobalModels
  readonly session: Session

  constructor(private dash: Dash<App>, sessionData: SessionData) {
    this.engine = new ModelEngine(dash)
    this.bgManager = this.engine.bgManager
    registerContributor(this.engine)
    registerComment(this.engine)
    registerFlag(this.engine)
    registerTaskLogEntry(this.engine)
    registerProject(this.engine)
    registerTask(this.engine)
    registerStep(this.engine)
    registerFileInfo(this.engine)
    this.global = createGlobal(this.dash, this.engine)
    this.session = createSession(this.global, sessionData.contributorId)
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
}

function createGlobal(dash: Dash<App>, engine: ModelEngine): GlobalModels {
  let batch = new GenericCommandBatch(engine)
  batch.fetch("Step")
  batch.fetch("Flag")
  batch.fetch("Contributor")
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
    "contributors": {
      type: "Contributor",
      factory: () => engine.getAllModels("Contributor", ["name", "asc"])
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
    dash.listen(`change${options.type}`).onData(model => cache.delete(name))
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
