import { Dash, ComponentEvent, Transmitter } from "bkb"
import App from "../App/App"
import ModelEngine, { appendGettersToModel, ModelEvent } from "./ModelEngine"
import { Type, Identifier } from "../../isomorphic/Cargo"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment, ProjectQuery, projectMeta } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment, stepMeta } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment } from "../../isomorphic/fragments/Task"
import { ImageFragment } from "../../isomorphic/fragments/Attachment"
import { ContributorFragment } from "../../isomorphic/fragments/Contributor"
import { FlagFragment } from "../../isomorphic/fragments/Flag"
import { CommentFragment } from "../../isomorphic/fragments/Comment"
import { TaskLogFragment } from "../../isomorphic/fragments/TaskLog"
import Deferred from "../libraries/Deferred"

// --
// -- Exported interfaces
// --

export type CommandType = "create" | "update" | "delete"

export type ModelEvent = ModelEvent

export interface CommandRunner {
  exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
  exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>

  exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
  exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
  //exec(cmd: "delete", type: "Task", taskId: string): Promise<void>

  exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
  exec(cmd: "delete", type: "Step", stepId: string): Promise<void>

  exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
  exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

  query(type: "Project", filters: ProjectQuery): Promise<ProjectModel[]>
  query(type: "StepType"): Promise<StepTypeModel[]>

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

// --
// -- Component ModelComp
// --

export default class ModelComp implements Model {
  private engine: ModelEngine

  constructor(private dash: Dash<App>) {
    this.engine = new ModelEngine(dash)
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
    return new CommandBatch(this.engine)
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

  public reorder(type: Type, idList: Identifier[], groupId?: Identifier): Promise<Identifier[]> {
    return this.engine.reorder(type, { idList, groupId })
  }
}

// --
// -- Class CommandBatch
// --

interface EngineCommand {
  method: string
  args: any[]
  deferred: Deferred<any>
}

class CommandBatch implements CommandRunner {
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

  public reorder(type: Type, idList: Identifier[], groupId?: Identifier): Promise<Identifier[]> {
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
  hasStep(stepTypeId: string): boolean
  findStep(stepTypeId: string): StepModel | undefined
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
      hasStep(stepTypeId: string) {
        return !!this.findStep(stepTypeId)
      },
      findStep(stepTypeId: string) {
        return engine.findSingleFromIndex({
          type: "Step",
          index: ["projectId", "stepTypeId"],
          key: {
            projectId: getFrag().id,
            stepTypeId
          }
        })
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
  // readonly createdBy: ContributorModel
  // readonly affectedTo?: ContributorModel
  // readonly comments: CommentModel[]
  // readonly flags: FlagModel[]
  // readonly attachments: Attachment[]
  // readonly logs: TaskLogModel[]
  // setCurrentStep(stepId: string): Promise<StepModel>
  // createChildTask(label: string): Promise<TaskModel>
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
        })
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
  readonly hasProjects: boolean
  readonly isSpecial: boolean
}

function registerStepType(engine: ModelEngine) {
  engine.registerType("StepType", function (getFrag: () => StepTypeFragment): StepTypeModel {
    let model = {
      get isSpecial() {
        return isStepSpecial(getFrag())
      },
      get hasProjects() {
        return engine.getModels({
          type: "Step",
          index: "stepTypeId",
          key: {
            stepTypeId: getFrag().id
          },
          orderBy: ["projectId", "asc"] // TODO: implement a function here => sort on project name
        }).length > 0
      }
    }
    appendGettersToModel(model, "StepType", getFrag)
    return model as any
  })
}

// --
// -- Configuration - Not implemented
// --

// interface ImageModel extends ImageFragment {
// }

// interface ContributorModel extends ContributorFragment {
//   readonly avatar: ImageModel
// }

// interface FlagModel extends FlagFragment {
// }

// interface CommentModel extends CommentFragment {
//   readonly task: TaskModel
//   readonly writtenBy: ContributorModel
// }

// interface TaskLogModel extends TaskLogFragment {
//   readonly task: TaskModel
//   readonly step: StepModel
//   readonly startedBy: ContributorModel
//   readonly endedBy?: ContributorModel
// }
