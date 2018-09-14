import { Identifier, ModelUpdate, Type } from "../../shared/Cargo"
import { AccountCreateFragment, AccountIdFragment, AccountSearchFragment, AccountUpdateFragment } from "../../shared/meta/Account"
import { CommentCreateFragment, CommentIdFragment, CommentUpdateFragment } from "../../shared/meta/Comment"
import { FlagCreateFragment, FlagIdFragment, FlagUpdateFragment } from "../../shared/meta/Flag"
import { ProjectCreateFragment, ProjectIdFragment, ProjectSearchFragment, ProjectUpdateFragment } from "../../shared/meta/Project"
import { StepCreateFragment, StepIdFragment, StepUpdateFragment } from "../../shared/meta/Step"
import { TaskCreateFragment, TaskIdFragment, TaskSearchFragment, TaskUpdateFragment } from "../../shared/meta/Task"
import { BgCommand, BgCommandManager } from "./BgCommandManager"
import ModelEngine, { CommandType } from "./ModelEngine"
import { AccountModel } from "./Models/AccountModel"
import { FlagModel, registerFlag } from "./Models/FlagModel"
import { ProjectModel } from "./Models/ProjectModel"
import { registerStep, StepModel } from "./Models/StepModel"
import { TaskModel } from "./Models/TaskModel"

export interface ModelCommandMethods {
  exec(cmd: "create", type: "Account", frag: AccountCreateFragment): Promise<AccountModel>
  exec(cmd: "update", type: "Account", frag: AccountUpdateFragment): Promise<AccountModel>
  exec(cmd: "delete", type: "Account", frag: AccountIdFragment): Promise<void>

  exec(cmd: "create", type: "Project", frag: ProjectCreateFragment): Promise<ProjectModel>
  exec(cmd: "update", type: "Project", frag: ProjectUpdateFragment): Promise<ProjectModel>
  exec(cmd: "delete", type: "Project", frag: ProjectIdFragment): Promise<void>

  exec(cmd: "create", type: "Task", frag: TaskCreateFragment): Promise<TaskModel>
  exec(cmd: "update", type: "Task", frag: TaskUpdateFragment): Promise<TaskModel>
  exec(cmd: "delete", type: "Task", frag: TaskIdFragment): Promise<void>

  exec(cmd: "create", type: "Step", frag: StepCreateFragment): Promise<StepModel>
  exec(cmd: "update", type: "Step", frag: StepUpdateFragment): Promise<StepModel>
  exec(cmd: "delete", type: "Step", frag: StepIdFragment): Promise<void>

  exec(cmd: "create", type: "Flag", frag: FlagCreateFragment): Promise<FlagModel>
  exec(cmd: "update", type: "Flag", frag: FlagUpdateFragment): Promise<FlagModel>
  exec(cmd: "delete", type: "Flag", frag: FlagIdFragment): Promise<void>

  exec(cmd: "create", type: "Comment", frag: CommentCreateFragment): Promise<FlagModel>
  exec(cmd: "update", type: "Comment", frag: CommentUpdateFragment): Promise<FlagModel>
  exec(cmd: "delete", type: "Comment", frag: CommentIdFragment): Promise<void>

  fetch(type: "Project", filters: ProjectSearchFragment): Promise<Collection<ProjectModel, string>>
  fetch(type: "Step"): Promise<Collection<StepModel, string>>
  fetch(type: "Flag"): Promise<Collection<FlagModel, string>>
  fetch(type: "Account", filters?: AccountSearchFragment): Promise<Collection<AccountModel, string>>
  fetch(type: "Task", filters: TaskSearchFragment): Promise<Collection<TaskModel, string>>

  reorder(type: "Flag", idList: string[]): Promise<string[]>
  reorder(type: "Step", idList: string[]): Promise<string[]>
  reorder(type: "Task", idList: string[], group: "childOf", parentTaskId: string): Promise<string[]>
  reorder(type: "Account", idList: string[], group: "affectedTo", taskId: string): Promise<string[]>
}

export interface Collection<M, ID> extends Array<M> {
  get(id: ID): M | undefined
  has(id: ID): boolean
}

// export interface ReadonlyCollection<M, ID> extends ReadonlyArray<M> {
//   get(id: ID): M | undefined
// }

export interface CommandBatch extends ModelCommandMethods {
  sendAll(): Promise<any[]>
}

export interface GlobalModels {
  readonly isReady: boolean
  readonly loading: Promise<void>
  readonly steps: Collection<StepModel, string>
  readonly specialSteps: Collection<StepModel, string>
  readonly allSteps: Collection<StepModel, string>
  readonly flags: Collection<FlagModel, string>
  readonly accounts: Collection<AccountModel, string>
  readonly projects: Collection<ProjectModel, string>
}

export interface SessionData {
  readonly accountId: string
}

export interface Session {
  readonly account: AccountModel
}

export interface Model extends ModelCommandMethods {
  readonly global: GlobalModels
  readonly session: Session
  readonly bgManager: BgCommandManager
  createCommandBatch(): CommandBatch
  processModelUpdate(modelUpd: ModelUpdate)
  findTaskByCode(code: string): TaskModel | undefined
}
