import { FragmentMeta, pickFragmentMeta } from "./FragmentMeta"

export interface TaskFragment {
  id: string
  code: string
  label: string
  description?: string
  // createdById: string
  // affectedToId?: string
  // curStepId: string
  createTs: number
  updateTs: number
}

export const taskMeta: FragmentMeta = {
  type: "Task",
  fields: {
    id: {
      dataType: "string",
      id: true
    },
    code: {
      dataType: "string",
      update: true
    },
    label: {
      dataType: "string",
      update: true
    },
    description: {
      dataType: "string",
      optional: true,
      update: true
    },
    // createdById: {
    //   dataType: "string",
    //   update: true
    // },
    // affectedToId: {
    //   dataType: "string",
    //   optional: true,
    //   update: true
    // },
    // curStepId: {
    //   dataType: "string",
    //   update: true
    // },
    createTs: {
      dataType: "number"
    },
    updateTs: {
      dataType: "number"
    }
  }
}

export type NewTaskFragment = Pick<TaskFragment, "label" | "description"> //  | "createdById" | "curStepId"

export const newTaskMeta = pickFragmentMeta("NewTask", taskMeta, ["label", "description"]) // , "createdById", "curStepId"
