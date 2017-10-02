import { Type, Identifier } from "../../isomorphic/Cargo"
import { NewContributorFragment, UpdContributorFragment, ContributorQuery } from "../../isomorphic/fragments/Contributor"
import { ContributorModel, registerContributor } from "./Models/ContributorModel"
import { NewProjectFragment, UpdProjectFragment, ProjectIdFragment, ProjectQuery } from "../../isomorphic/fragments/Project"
import { ProjectModel, registerProject } from "./Models/ProjectModel"
import { NewTaskFragment, UpdTaskFragment, TaskIdFragment } from "../../isomorphic/fragments/Task"
import { TaskModel, registerTask } from "./Models/TaskModel"
import { NewStepFragment, StepIdFragment } from "../../isomorphic/fragments/Step"
import { StepModel, registerStep } from "./Models/StepModel"
import { NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType"
import { StepTypeModel, registerStepType } from "./Models/StepTypeModel"
import { FlagModel, registerFlag } from "./Models/FlagModel"
import ModelEngine, { CommandType } from "./ModelEngine"
import { ComponentEvent, Transmitter } from "bkb"
import { BgCommandManager, BgCommand } from "./BgCommandManager"

export interface WhoUseItem {
  type: Type,
  count: number
}

export interface ModelCommandMethods {
  exec(cmd: "create", type: "Contributor", frag: NewContributorFragment): Promise<ContributorModel>
  exec(cmd: "update", type: "Contributor", frag: UpdContributorFragment): Promise<ContributorModel>

  exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
  exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>
  exec(cmd: "delete", type: "Project", frag: ProjectIdFragment): Promise<void>

  exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
  exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
  exec(cmd: "delete", type: "Task", frag: TaskIdFragment): Promise<void>

  exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
  exec(cmd: "delete", type: "Step", frag: StepIdFragment): Promise<void>

  exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
  exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

  query(type: "Project", filters: ProjectQuery): Promise<Collection<ProjectModel, string>>
  query(type: "StepType"): Promise<Collection<StepTypeModel, string>>
  query(type: "Flag"): Promise<Collection<FlagModel, string>>
  query(type: "Contributor", filters?: ContributorQuery): Promise<Collection<ContributorModel, string>>

  reorder(type: "Flag", idList: string[]): Promise<string[]>
  reorder(type: "StepType", idList: string[]): Promise<string[]>
  reorder(type: "Task", idList: string[], group: "childOf", parentTaskId: string): Promise<string[]>
  reorder(type: "Contributor", idList: string[], group: "affectedTo", taskId: string): Promise<string[]>
}

export interface Collection<M, ID> extends Array<M> {
  get(id: ID): M | undefined
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
  readonly stepTypes: ReadonlyCollection<StepTypeModel, string>
  readonly flags: ReadonlyCollection<FlagModel, string>
  readonly contributors: ReadonlyCollection<ContributorModel, string>
  readonly projects: ReadonlyCollection<ProjectModel, string>
}

export interface Model extends ModelCommandMethods {
  createCommandBatch(): CommandBatch
  readonly global: GlobalModels
  readonly bgCommandMng: BgCommandManager
}
