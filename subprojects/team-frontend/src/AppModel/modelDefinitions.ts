import { ModelUpdate } from "@smallteam-local/shared/dist/Cargo"
import { AccountCreateFragment, AccountIdFragment, AccountSearchFragment, AccountUpdateFragment } from "@smallteam-local/shared/dist/meta/Account"
import { CommentCreateFragment, CommentIdFragment, CommentUpdateFragment } from "@smallteam-local/shared/dist/meta/Comment"
import { FlagCreateFragment, FlagIdFragment, FlagUpdateFragment } from "@smallteam-local/shared/dist/meta/Flag"
import { ProjectCreateFragment, ProjectIdFragment, ProjectSearchFragment, ProjectUpdateFragment } from "@smallteam-local/shared/dist/meta/Project"
import { StepCreateFragment, StepIdFragment, StepUpdateFragment } from "@smallteam-local/shared/dist/meta/Step"
import { TaskCreateFragment, TaskIdFragment, TaskSearchFragment, TaskUpdateFragment } from "@smallteam-local/shared/dist/meta/Task"
import { BgCommandManager } from "./BgCommandManager"
import { AccountModel } from "./Models/AccountModel"
import { CommentModel } from "./Models/CommentModel"
import { FlagModel } from "./Models/FlagModel"
import { ProjectModel } from "./Models/ProjectModel"
import { StepModel } from "./Models/StepModel"
import { TaskModel } from "./Models/TaskModel"

export interface ModelCommandMethods {
  exec(cmd: "create", type: "Account", frag: AccountCreateFragment): Promise<AccountModel>
  exec(cmd: "update", type: "Account", frag: AccountUpdateFragment): Promise<void>
  exec(cmd: "delete", type: "Account", frag: AccountIdFragment): Promise<void>

  exec(cmd: "create", type: "Project", frag: ProjectCreateFragment): Promise<ProjectModel>
  exec(cmd: "update", type: "Project", frag: ProjectUpdateFragment): Promise<void>
  exec(cmd: "delete", type: "Project", frag: ProjectIdFragment): Promise<void>

  exec(cmd: "create", type: "Task", frag: TaskCreateFragment): Promise<TaskModel>
  exec(cmd: "update", type: "Task", frag: TaskUpdateFragment): Promise<void>
  exec(cmd: "delete", type: "Task", frag: TaskIdFragment): Promise<void>

  exec(cmd: "create", type: "Step", frag: StepCreateFragment): Promise<StepModel>
  exec(cmd: "update", type: "Step", frag: StepUpdateFragment): Promise<void>
  exec(cmd: "delete", type: "Step", frag: StepIdFragment): Promise<void>

  exec(cmd: "create", type: "Flag", frag: FlagCreateFragment): Promise<FlagModel>
  exec(cmd: "update", type: "Flag", frag: FlagUpdateFragment): Promise<void>
  exec(cmd: "delete", type: "Flag", frag: FlagIdFragment): Promise<void>

  exec(cmd: "create", type: "Comment", frag: CommentCreateFragment): Promise<CommentModel>
  exec(cmd: "update", type: "Comment", frag: CommentUpdateFragment): Promise<void>
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
  readonly frontendId: string
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
