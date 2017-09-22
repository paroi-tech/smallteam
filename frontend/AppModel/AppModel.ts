import { Type, Identifier } from "../../isomorphic/Cargo";
import { NewContributorFragment, UpdContributorFragment, ContributorQuery } from "../../isomorphic/fragments/Contributor";
import { ContributorModel, registerContributor } from "./Models/ContributorModel";
import { NewProjectFragment, UpdProjectFragment, ProjectIdFragment, ProjectQuery } from "../../isomorphic/fragments/Project";
import { ProjectModel, registerProject } from "./Models/ProjectModel";
import { NewTaskFragment, UpdTaskFragment, TaskIdFragment } from "../../isomorphic/fragments/Task";
import { TaskModel, registerTask } from "./Models/TaskModel";
import { NewStepFragment, StepIdFragment } from "../../isomorphic/fragments/Step";
import { StepModel, registerStep } from "./Models/StepModel";
import { NewStepTypeFragment, UpdStepTypeFragment } from "../../isomorphic/fragments/StepType";
import { StepTypeModel, registerStepType } from "./Models/StepTypeModel";
import { FlagModel, registerFlag } from "./Models/FlagModel";
import { ComponentEvent, Transmitter, Dash } from "bkb";
import ModelEngine, { CommandType, ModelEvent } from "./ModelEngine";
import App from "../App/App";
import { registerComment } from "./Models/CommentModel";
import { registerTaskLogEntry } from "./Models/TaskLogEntryModel";
import { GenericCommandBatch } from "./GenericCommandBatch";
import { Model, CommandBatch } from "./modelDefinitions";

export { CommandType, ModelEvent } from "./ModelEngine"
export { Model, WhoUseItem, CommandBatch } from "./modelDefinitions"

export { CommentModel } from "./Models/CommentModel"
export { ContributorModel } from "./Models/ContributorModel"
export { FlagModel } from "./Models/FlagModel"
export { ProjectModel } from "./Models/ProjectModel"
export { StepModel } from "./Models/StepModel"
export { StepTypeModel } from "./Models/StepTypeModel"
export { TaskLogEntryModel } from "./Models/TaskLogEntryModel"
export { TaskModel } from "./Models/TaskModel"

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
  // -- ModelCommandMethods
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

  // --
  // -- ModelEventMethods
  // --

  public on(eventName: string, modeOrCb, callback?): this {
    this.dash.on(eventName, modeOrCb, callback)
    return this
  }

  public listen(eventName: string): Transmitter<ModelEvent> {
    return this.dash.listen(eventName)
  }

  // --
  // -- Model
  // --

  public createCommandBatch(): CommandBatch {
    return new GenericCommandBatch(this.engine)
  }
}
