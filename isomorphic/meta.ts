import { fileAttachmentMeta, imageAttachmentMeta } from "./fragments/Attachment"
import { commentMeta, newCommentMeta } from "./fragments/Comment"
import { contributorMeta, newContributorMeta } from "./fragments/Contributor"
import { flagMeta, newFlagMeta } from "./fragments/Flag"
import { projectMeta, newProjectMeta } from "./fragments/Project"
import { stepMeta, newStepMeta } from "./fragments/Step"
import { stepTypeMeta } from "./fragments/StepType"
import { taskMeta, newTaskMeta } from "./fragments/Task"
import { taskLogMeta } from "./fragments/TaskLog"
import { Type } from "./Cargo"
import { FragmentMeta, TypeVariant } from "./FragmentMeta"

export let types: ReadonlyArray<Type> = Object.freeze(["Comment", "Contributor", "Flag", "Project", "Step", "StepType", "Task", "TaskLog"]) as any

interface FragMetas {
  frag: FragmentMeta
  Upd?: FragmentMeta
  New?: FragmentMeta
  Q?: FragmentMeta
}

let fragmentMetaByTypes: { [type: string]: FragMetas } = {
  FileAttachment: { frag: fileAttachmentMeta },
  ImageAttachment: { frag: imageAttachmentMeta },
  Comment: { frag: commentMeta, New: newCommentMeta },
  Contributor: { frag: contributorMeta, New: newContributorMeta },
  Flag: { frag: flagMeta, New: newFlagMeta },
  Project: { frag: projectMeta, New: newProjectMeta },
  Step: { frag: stepMeta, New: newStepMeta },
  StepType: { frag: stepTypeMeta },
  Task: { frag: taskMeta, New: newTaskMeta },
  TaskLog: { frag: taskLogMeta },
}

export function getFragmentMeta(type: Type, variant?: TypeVariant): FragmentMeta {
  if (!fragmentMetaByTypes[type])
    throw new Error(`Unknown type "${type}" for fragment meta`)
  let key = variant === undefined ? "frag" : variant
  if (!fragmentMetaByTypes[type][key])
    throw new Error(`Missing variant "${key}" of fragment meta for type: ${type}`)
  return fragmentMetaByTypes[type][key]
}
