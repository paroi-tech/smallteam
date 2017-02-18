import { Dash, ComponentEvent, Transmitter } from "bkb"
import App from "../App/App"
import ModelEngine, { appendGettersToModel, ModelEvent } from "./ModelEngine"
import { Type } from "../../isomorphic/Cargo"
import { ProjectFragment, NewProjectFragment, UpdProjectFragment, ProjectQuery, projectMeta } from "../../isomorphic/fragments/Project"
import { StepFragment, NewStepFragment, stepMeta } from "../../isomorphic/fragments/Step"
import { StepTypeFragment, NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { TaskFragment, NewTaskFragment, UpdTaskFragment } from "../../isomorphic/fragments/Task"
import { ImageFragment } from "../../isomorphic/fragments/Attachment"
import { ContributorFragment } from "../../isomorphic/fragments/Contributor"
import { FlagFragment } from "../../isomorphic/fragments/Flag"
import { CommentFragment } from "../../isomorphic/fragments/Comment"
import { TaskLogFragment } from "../../isomorphic/fragments/TaskLog"

export type CommandType = "create" | "update" | "delete"

export type ModelEvent = ModelEvent

export default class Model {
  private engine: ModelEngine

  constructor(private dash: Dash<App>) {
    this.engine = new ModelEngine(dash)
    registerProject(this.engine)
    registerTask(this.engine)
    registerStep(this.engine)
    registerStepType(this.engine)
  }

  // --
  // -- Events
  // --

  on(eventName: string, callback: (ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "eventOnly", callback: (ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "dataFirst", callback: (data: ModelEvent, ev: ComponentEvent<ModelEvent>) => void, thisArg?: any): this
  on(eventName: string, mode: "arguments", callback: (...args: any[]) => void, thisArg?: any): this

  public on(eventName: string, modeOrCb, callback?): this {
    this.dash.on(eventName, modeOrCb, callback)
    return this
  }

  listen(eventName: string): Transmitter<ModelEvent> {
    return this.dash.listen(eventName)
  }

  // --
  // -- Execute an API command
  // --

  public exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
  public exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>

  public exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
  public exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
  //public exec(cmd: "delete", type: "Task", taskId: string): Promise<void>

  public exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
  public exec(cmd: "delete", type: "Step", stepId: string): Promise<void>

  public exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
  public exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

  public exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
    return this.engine.exec(cmd, type, fragOrId)
  }

  // --
  // -- Query the API
  // --

  public query(type: "Project", filters: ProjectQuery): Promise<ProjectModel[]>
  public query(type: "StepType"): Promise<StepTypeModel[]>

  public query(type: Type, filters?: any): Promise<any[]> {
    return this.engine.query(type, filters)
  }

  // --
  // -- Update order nums
  // --

  public reorder(type: "StepType", idList: string[]): Promise<StepTypeModel[]>
  public reorder(type: "Task", idList: string[], parentTaskId: string): Promise<TaskModel[]>

  public reorder(type: Type, idList: string[], groupId?: string): Promise<any[]> {
    return this.engine.reorder("StepType", { idList, groupId })
  }
}

// --
// -- ProjectModel
// --

export interface ProjectModel extends ProjectFragment {
  readonly rootTask: TaskModel
  readonly steps: StepModel[]
  readonly tasks?: TaskModel[]
  getTasks(taskId: string): TaskModel
}

function registerProject(engine: ModelEngine) {
  engine.registerType("Project", function (frag: ProjectFragment): ProjectModel {
    let model = {
      get rootTask() {
        return engine.getModel("Task", frag.rootTaskId)
      },
      get steps() {
        return engine.getModels({
          type: "Step",
          index: "projectId",
          key: {
            projectId: frag.id
          },
          orderBy: ["orderNum", "asc"]
        })
      },
      get tasks() {
        return this.rootTask.children
      },
      getTasks(taskId: string) {
        let task: TaskModel = engine.getModel("Task", taskId)
        if (task.projectId !== frag.id)
          throw new Error(`The task ${taskId} is in the project ${task.projectId}, current project: ${frag.id}`)
        return task
      }
    }
    appendGettersToModel(model, "Project", frag)
    return model as any
  })
}

// --
// -- TaskModel
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
  engine.registerType("Task", function (frag: TaskFragment): TaskModel {
    let model = {
      get project() {
        return engine.getModel("Project", frag.projectId)
      },
      get currentStep() {
        return engine.getModel("Step", frag.curStepId)
      },
      get parent() {
        if (frag.parentTaskId === undefined)
          return undefined
        return engine.getModel("Task", frag.parentTaskId)
      },
      get children() {
        return engine.getModels({
          type: "Task",
          index: "parentTaskId",
          key: {
            parentTaskId: frag.id
          },
          orderBy: ["orderNum", "asc"]
        })
      }
    }
    appendGettersToModel(model, "Task", frag)
    return model as any
  })
}

// --
// -- StepModel
// --

export interface StepModel extends StepFragment {
  readonly project: ProjectModel
}

function registerStep(engine: ModelEngine) {
  engine.registerType("Step", function (frag: StepFragment): StepModel {
    let model = {
      get project() {
        return engine.getModel("Project", frag.projectId)
      }
      // get tasks() {
      //   return getModels({
      //     type: "Task",
      //     index: "curStepId",
      //     key: {
      //       curStepId: frag.id
      //     },
      //     orderBy: ["orderNum", "asc"]
      //   })
      // }
    }
    appendGettersToModel(model, "Step", frag)
    return model as any
  })
}

// --
// -- StepTypeModel
// --

export interface StepTypeModel extends StepTypeFragment {
  readonly hasProjects: boolean
}

function registerStepType(engine: ModelEngine) {
  engine.registerType("StepType", function (frag: StepTypeFragment): StepTypeModel {
    let model = {
      get hasProjects() {
        return engine.getModels({
          type: "Step",
          index: "stepTypeId",
          key: {
            stepTypeId: frag.id
          },
          orderBy: ["projectId", "asc"] // TODO: implement a function here => sort on project name
        }).length > 0
      }
    }
    appendGettersToModel(model, "StepType", frag)
    return model as any
  })
}

// --
// -- Not implemented
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
