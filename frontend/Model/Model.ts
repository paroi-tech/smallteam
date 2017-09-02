import { Dash, ComponentEvent, Transmitter } from "bkb"
import App from "../App/App"
import ModelEngine, { appendGettersToModel, ModelEvent, CommandType } from "./ModelEngine"
import { Type, Identifier } from "../../isomorphic/Cargo"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment, ProjectQuery, projectMeta } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment, StepIdFragment, stepMeta } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment } from "../../isomorphic/fragments/Task"
import { ImageFragment } from "../../isomorphic/fragments/Attachment"
import { ContributorFragment, ContributorQuery } from "../../isomorphic/fragments/Contributor"
import { FlagFragment } from "../../isomorphic/fragments/Flag"
import { CommentFragment } from "../../isomorphic/fragments/Comment"
import { TaskLogEntryFragment } from "../../isomorphic/fragments/TaskLogEntry"
import Deferred from "../libraries/Deferred"

// --
// -- Exported interfaces
// --

export { CommandType, ModelEvent } from "./ModelEngine"

export interface WhoUseItem {
  type: Type,
  count: number
}

export interface CommandRunner {
  exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
  exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>

  exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
  exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
  //exec(cmd: "delete", type: "Task", taskId: string): Promise<void>

  exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
  exec(cmd: "delete", type: "Step", frag: StepIdFragment): Promise<void>

  exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
  exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

  query(type: "Project", filters: ProjectQuery): Promise<ProjectModel[]>
  query(type: "StepType"): Promise<StepTypeModel[]>
  query(type: "Flag"): Promise<FlagModel[]>
  query(type: "Contributor", filters?: ContributorQuery): Promise<ContributorModel[]>

  reorder(type: "StepType", idList: string[]): Promise<string[]>
  reorder(type: "Task", idList: string[], parentTaskId: string): Promise<string[]>
}

export interface Model extends CommandRunner {
  on(eventName: string, callback: (ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "eventOnly", callback: (ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "dataFirst", callback: (data: ModelEvent, ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "arguments", callback: (...args: any[]) => void, thisArg?: any): this

  listen(eventName: string): Transmitter<ModelEvent>

  createCommandBatch(): CommandBatch
}

export interface CommandBatch extends CommandRunner {
  sendAll(): Promise<any[]>
}

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine

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
  }

  // --
  // -- Model
  // --

  public on(eventName: string, modeOrCb, callback?): this {
    this.dash.on(eventName, modeOrCb, callback)
    return this
  }

  public listen(eventName: string): Transmitter<ModelEvent> {
    return this.dash.listen(eventName)
  }

  public createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine)
  }

  // --
  // -- CommandRunner
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
}

// --
// -- Class GenericCommandBatch
// --

interface EngineCommand {
  method: string
  args: any[]
  deferred: Deferred<any>
}

class GenericCommandBatch implements CommandRunner {
  private commands: EngineCommand[] = []

  constructor(private engine: ModelEngine) {
  }

  public exec(...args): Promise<any> {
    let deferred = new Deferred<any>()
    this.commands.push({
      method: "exec",
      args,
      deferred
    })
    return deferred.promise
  }

  public query(...args): Promise<any[]> {
    let deferred = new Deferred<any[]>()
    this.commands.push({
      method: "query",
      args,
      deferred
    })
    return deferred.promise
  }

  public reorder(type: Type, idList: Identifier[], groupId?: Identifier): Promise<any[]> {
    let deferred = new Deferred<Identifier[]>()
    this.commands.push({
      method: "reorder",
      args: [type, { idList, groupId }],
      deferred
    })
    return deferred.promise
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

// --
// -- Configuration - ProjectModel
// --

export interface ProjectModel extends ProjectFragment {
  readonly rootTask: TaskModel
  readonly steps: StepModel[]
  readonly specialSteps: StepModel[]
  hasStepType(stepTypeId: string): boolean
  findStepByType(stepTypeId: string): StepModel | undefined
  findStep(stepId: string): StepModel | undefined
  readonly tasks?: TaskModel[]
  getTask(taskId: string): TaskModel
}

function registerProject(engine: ModelEngine) {
  engine.registerType("Project", function (getFrag: () => ProjectFragment): ProjectModel {
    let model = {
      get rootTask() {
        return engine.getModel("Task", getFrag().rootTaskId)
      },
      get steps() {
        return engine.getModels({
          type: "Step",
          index: "projectId",
          indexCb: { "normal": isStepNormal },
          key: {
            projectId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        })
      },
      get specialSteps() {
        return engine.getModels({
          type: "Step",
          index: "projectId",
          indexCb: { "special": isStepSpecial },
          key: {
            projectId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        })
      },
      hasStepType(stepTypeId: string) {
        return !!this.findStepByType(stepTypeId)
      },
      findStepByType(stepTypeId: string) {
        let item = engine.findSingleFromIndex({
          type: "Step",
          index: ["projectId", "typeId"],
          key: {
            projectId: getFrag().id,
            typeId: stepTypeId
          }
        })
        return item
      },
      findStep(stepId: string) {
        for (let step of this.steps) {
          if (step.id === stepId)
            return step
        }
        return undefined
      },
      get tasks() {
        return this.rootTask.children
      },
      getTask(taskId: string) {
        let task: TaskModel = engine.getModel("Task", taskId)
        if (task.projectId !== getFrag().id)
          throw new Error(`The task ${taskId} is in the project ${task.projectId}, current project: ${getFrag().id}`)
        return task
      }
    }
    appendGettersToModel(model, "Project", getFrag)
    return model as any
  })
}

function isStepNormal(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum === "number"
}

function isStepSpecial(step: StepFragment | StepTypeFragment) {
  return typeof step.orderNum !== "number"
}

// --
// -- Configuration - TaskModel
// --

export interface TaskModel extends TaskFragment {
  readonly project: ProjectModel
  readonly currentStep: StepModel
  readonly parent?: TaskModel
  readonly children?: TaskModel[]
  readonly createdBy: ContributorModel
  affectedTo?: ContributorModel[]
  // readonly comments: CommentModel[] // => TODO: Async load
  flags?: FlagModel[]
  readonly logEntries: TaskLogEntryModel[]
  // readonly attachments: Attachment[] // => TODO: Async load
}

function registerTask(engine: ModelEngine) {
  engine.registerType("Task", function (getFrag: () => TaskFragment): TaskModel {
    let model = {
      get project() {
        return engine.getModel("Project", getFrag().projectId)
      },
      get currentStep() {
        return engine.getModel("Step", getFrag().curStepId)
      },
      get parent() {
        let parentId = getFrag().parentTaskId
        if (parentId === undefined)
          return undefined
        return engine.getModel("Task", parentId)
      },
      get children() {
        return engine.getModels({
          type: "Task",
          index: "parentTaskId",
          key: {
            parentTaskId: getFrag().id
          },
          orderBy: ["orderNum", "asc"]
        }, undefined)
      }
    }
    appendGettersToModel(model, "Task", getFrag)
    return model as any
  })
}

// --
// -- Configuration - StepModel
// --

export interface StepModel extends StepFragment {
  readonly project: ProjectModel
  readonly isSpecial: boolean
  readonly taskCount: number
}

function registerStep(engine: ModelEngine) {
  engine.registerType("Step", function (getFrag: () => StepFragment): StepModel {
    let model = {
      get project() {
        return engine.getModel("Project", getFrag().projectId)
      },
      get isSpecial() {
        return isStepSpecial(getFrag())
      },
      get taskCount() {
        return engine.countModels({
          type: "Task",
          index: "curStepId",
          key: {
            curStepId: getFrag().id
          }
        })
      }
    }
    appendGettersToModel(model, "Step", getFrag)
    return model as any
  })
}

// --
// -- Configuration - StepTypeModel
// --

export interface StepTypeModel extends StepTypeFragment {
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
  readonly isSpecial: boolean
}

function registerStepType(engine: ModelEngine) {
  engine.registerType("StepType", function (getFrag: () => StepTypeFragment): StepTypeModel {
    let model = {
      get isSpecial() {
        return isStepSpecial(getFrag())
      }
      // get hasProjects() {
      //   return engine.getModels({
      //     type: "Step",
      //     index: "typeId",
      //     key: {
      //       typeId: getFrag().id
      //     },
      //     orderBy: ["projectId", "asc"] // TODO: implement a function here => sort on project name
      //   }).length > 0
      // }
    }
    appendGettersToModel(model, "StepType", getFrag)
    return model as any
  })
}

// --
// -- Configuration - ContributorModel
// --

interface ContributorModel extends ContributorFragment {
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
}

function registerContributor(engine: ModelEngine) {
  engine.registerType("Contributor", function (getFrag: () => ContributorFragment): ContributorModel {
    let model = {}
    appendGettersToModel(model, "Contributor", getFrag)
    return model as any
  })
}

// --
// -- Configuration - FlagModel
// --

export interface FlagModel extends FlagFragment {
  whoUse(): Promise<WhoUseItem[]> // TODO: to implement
}

function registerFlag(engine: ModelEngine) {
  engine.registerType("Flag", function (getFrag: () => FlagFragment): FlagModel {
    let model = {}
    appendGettersToModel(model, "Flag", getFrag)
    return model as any
  })
}

// --
// -- Configuration - CommentModel
// --

interface CommentModel extends CommentFragment {
  readonly task: TaskModel
  readonly writtenBy: ContributorModel
}

function registerComment(engine: ModelEngine) {
  engine.registerType("Comment", function (getFrag: () => CommentFragment): CommentModel {
    let model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get writtenBy() {
        return engine.getModel("Contributor", getFrag().writtenById)
      }
    }
    appendGettersToModel(model, "Comment", getFrag)
    return model as any
  })
}

// --
// -- Configuration - TaskLogEntryModel
// --

interface TaskLogEntryModel extends TaskLogEntryFragment {
  readonly task: TaskModel
  readonly step: StepModel
  readonly contributor: ContributorModel
}

function registerTaskLogEntry(engine: ModelEngine) {
  engine.registerType("TaskLogEntry", function (getFrag: () => TaskLogEntryFragment): TaskLogEntryModel {
    let model = {
      get task() {
        return engine.getModel("Task", getFrag().taskId)
      },
      get step() {
        return engine.getModel("Step", getFrag().stepId)
      },
      get contributor() {
        return engine.getModel("Contributor", getFrag().contributorId)
      }
    }
    appendGettersToModel(model, "TaskLogEntry", getFrag)
    return model as any
  })
}

// --
// -- Configuration - Not implemented
// --

// interface ImageModel extends ImageFragment {
// }
