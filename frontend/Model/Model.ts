import { apiExec, apiQuery, registerType, getModel, getModels, appendGettersToModel } from "./modelEngine"
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

// --
// -- Project
// --

export interface ProjectModel extends ProjectFragment {
  readonly rootTask: TaskModel
  readonly steps: StepModel[]
  readonly tasks?: TaskModel[]
}

registerType("Project", function (frag: ProjectFragment): ProjectModel {
  let model = {
    get rootTask() {
      return getModel("Task", frag.rootTaskId)
    },
    get steps() {
      return getModels({
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
    }
  }
  appendGettersToModel(model, "Project", frag)
  return model as any
})

// --
// -- Task
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

registerType("Task", function (frag: TaskFragment): TaskModel {
  let model = {
    get project() {
      return getModel("Project", frag.projectId)
    },
    get currentStep() {
      return getModel("Step", frag.curStepId)
    },
    get parent() {
      if (frag.parentTaskId === undefined)
        return undefined
      return getModel("Task", frag.parentTaskId)
    },
    get children() {
      return getModels({
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

// --
// -- Step
// --

export interface StepModel extends StepFragment {
  readonly project: ProjectModel
}

registerType("Step", function (frag: StepFragment): StepModel {
  let model = {
    get project() {
      return getModel("Project", frag.projectId)
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

// --
// -- StepType
// --

export interface StepTypeModel extends StepTypeFragment {
  readonly hasProjects: boolean
}

registerType("StepType", function (frag: StepTypeFragment): StepTypeModel {
  let model = {
    get hasProjects() {
      return getModels({
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

// --
// -- Execute an API command
// --

type CommandType = "create" | "update" | "delete"

export async function exec(cmd: "create", type: "Project", frag: NewProjectFragment): Promise<ProjectModel>
export async function exec(cmd: "update", type: "Project", frag: UpdProjectFragment): Promise<ProjectModel>

export async function exec(cmd: "create", type: "Task", frag: NewTaskFragment): Promise<TaskModel>
export async function exec(cmd: "update", type: "Task", frag: UpdTaskFragment): Promise<TaskModel>
//export async function exec(cmd: "delete", type: "Task", taskId: string): Promise<void>

export async function exec(cmd: "create", type: "Step", frag: NewStepFragment): Promise<StepModel>
export async function exec(cmd: "delete", type: "Step", stepId: string): Promise<void>

export async function exec(cmd: "create", type: "StepType", frag: NewStepTypeFragment): Promise<StepTypeModel>
export async function exec(cmd: "update", type: "StepType", frag: UpdStepTypeFragment): Promise<StepTypeModel>

export async function exec(cmd: CommandType, type: Type, fragOrId: any): Promise<any> {
  return apiExec(cmd, type, fragOrId)
}

// --
// -- Query the API
// --

export async function query(type: "Project", filters: ProjectQuery): Promise<ProjectModel[]>
export async function query(type: "StepType"): Promise<StepTypeModel[]>

export async function query(type: Type, filters?: any): Promise<any[]> {
  return apiQuery(type, filters)
}
