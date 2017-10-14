import { Type, Identifier } from "../../isomorphic/Cargo"
import { ContributorCreateFragment, ContributorUpdateFragment, ContributorFetchFragment, ContributorIdFragment } from "../../isomorphic/meta/Contributor"
import { ContributorModel, registerContributor } from "./Models/ContributorModel"
import { ProjectCreateFragment, ProjectUpdateFragment, ProjectIdFragment, ProjectFetchFragment } from "../../isomorphic/meta/Project"
import { ProjectModel, registerProject } from "./Models/ProjectModel"
import { TaskCreateFragment, TaskUpdateFragment, TaskIdFragment } from "../../isomorphic/meta/Task"
import { TaskModel, registerTask } from "./Models/TaskModel"
import { StepCreateFragment, StepUpdateFragment, StepIdFragment } from "../../isomorphic/meta/Step"
import { StepModel, registerStep } from "./Models/StepModel"
import { FlagModel, registerFlag } from "./Models/FlagModel"
import ModelEngine, { CommandType } from "./ModelEngine"
import { ComponentEvent, Transmitter } from "bkb"
import { BgCommandManager, BgCommand } from "./BgCommandManager"
import { FlagCreateFragment, FlagUpdateFragment, FlagIdFragment } from "../../isomorphic/meta/Flag"
import { CommentIdFragment, CommentCreateFragment, CommentUpdateFragment } from "../../isomorphic/meta/Comment"

export interface ModelCommandMethods {
  exec(cmd: "create", type: "Contributor", frag: ContributorCreateFragment): Promise<ContributorModel>
  exec(cmd: "update", type: "Contributor", frag: ContributorUpdateFragment): Promise<ContributorModel>
  exec(cmd: "delete", type: "Contributor", frag: ContributorIdFragment): Promise<void>

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

  fetch(type: "Project", filters: ProjectFetchFragment): Promise<Collection<ProjectModel, string>>
  fetch(type: "Step"): Promise<Collection<StepModel, string>>
  fetch(type: "Flag"): Promise<Collection<FlagModel, string>>
  fetch(type: "Contributor", filters?: ContributorFetchFragment): Promise<Collection<ContributorModel, string>>

  reorder(type: "Flag", idList: string[]): Promise<string[]>
  reorder(type: "Step", idList: string[]): Promise<string[]>
  reorder(type: "Task", idList: string[], group: "childOf", parentTaskId: string): Promise<string[]>
  reorder(type: "Contributor", idList: string[], group: "affectedTo", taskId: string): Promise<string[]>
}

export interface Collection<M, ID> extends Array<M> {
  get(id: ID): M | undefined
  has(id: ID): boolean
}

export interface ReadonlyCollection<M, ID> extends ReadonlyArray<M> {
  get(id: ID): M | undefined
}

export interface CommandBatch extends ModelCommandMethods {
  sendAll(): Promise<any[]>
}

export interface GlobalModels {
  readonly isReady: boolean
  readonly load: Promise<void>
  readonly steps: ReadonlyCollection<StepModel, string>
  readonly flags: ReadonlyCollection<FlagModel, string>
  readonly contributors: ReadonlyCollection<ContributorModel, string>
  readonly projects: ReadonlyCollection<ProjectModel, string>
}

export interface SessionData {
  readonly contributorId: string
}

export interface Session {
  readonly contributor: ContributorModel
}

export interface Model extends ModelCommandMethods {
  createCommandBatch(): CommandBatch
  readonly global: GlobalModels
  readonly session: Session
  readonly bgManager: BgCommandManager
}
