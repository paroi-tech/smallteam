import { fileAttachmentMeta, imageAttachmentMeta } from "./fragments/Attachment"
import { commentMeta, newCommentMeta } from "./fragments/Comment"
import { contributorMeta, newContributorMeta } from "./fragments/Contributor"
import { flagMeta, newFlagMeta } from "./fragments/Flag"
import { projectMeta, newProjectMeta } from "./fragments/Project"
import { stepMeta, newStepMeta } from "./fragments/Step"
import { stepTypeMeta } from "./fragments/StepType"
import { taskMeta, newTaskMeta } from "./fragments/Task"
import { taskLogMeta } from "./fragments/TaskLog"

export default {
  FileAttachment: fileAttachmentMeta,
  ImageAttachment: imageAttachmentMeta,
  Comment: commentMeta,
  NewComment: newCommentMeta,
  Contributor: contributorMeta,
  NewContributor: newContributorMeta,
  Flag: flagMeta,
  NewFlag: newFlagMeta,
  Project: projectMeta,
  NewProject: newProjectMeta,
  Step: stepMeta,
  StepType: stepTypeMeta,
  NewStep: newStepMeta,
  Task: taskMeta,
  NewTask: newTaskMeta,
  TaskLog: taskLogMeta
}
