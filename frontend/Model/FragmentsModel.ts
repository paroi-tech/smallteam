import { ProjectFragment } from "../../isomorphic/fragments/Project"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { ImageFragment } from "../../isomorphic/fragments/Attachment"
import { ContributorFragment, StepFragment, FlagFragment, CommentFragment, TaskLogFragment } from "../../isomorphic/fragments/other"

export interface ProjectModel extends ProjectFragment {
  readonly rootTask: TaskModel
  //readonly steps: StepModel[]
}

export interface TaskModel extends TaskFragment {
  // readonly currentStep: StepModel
  // readonly parent?: TaskModel
  // readonly createdBy: ContributorModel
  // readonly affectedTo?: ContributorModel
  // readonly comments: CommentModel[]
  // readonly flags: FlagModel[]
  // readonly attachments: Attachment[]
  // readonly logs: TaskLogModel[]
  // setCurrentStep(stepId: string): Promise<StepModel>
  // createChildTask(label: string): Promise<TaskModel>
}

interface ImageModel extends ImageFragment {
}

interface ContributorModel extends ContributorFragment {
  readonly avatar: ImageModel
}

interface StepModel extends StepFragment {
  readonly project: ProjectModel
}

interface FlagModel extends FlagFragment {
}

interface CommentModel extends CommentFragment {
  readonly task: TaskModel
  readonly writtenBy: ContributorModel
}

interface TaskLogModel extends TaskLogFragment {
  readonly task: TaskModel
  readonly step: StepModel
  readonly startedBy: ContributorModel
  readonly endedBy?: ContributorModel
}