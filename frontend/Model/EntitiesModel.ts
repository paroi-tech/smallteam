import { ProjectFields } from "../../isomorphic/entities/project"
import { TaskFields } from "../../isomorphic/entities/task"
import { ImageFields, ContributorFields, StepFields, FlagFields, CommentFields, TaskLogFields } from "../../isomorphic/entities/other"

export interface ProjectModel extends ProjectFields {
  readonly rootTask: TaskModel
  //readonly steps: StepModel[]
}

export interface TaskModel extends TaskFields {
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

interface ImageModel extends ImageFields {
}

interface ContributorModel extends ContributorFields {
  readonly avatar: ImageModel
}

interface StepModel extends StepFields {
  readonly project: ProjectModel
}

interface FlagModel extends FlagFields {
}

interface CommentModel extends CommentFields {
  readonly task: TaskModel
  readonly writtenBy: ContributorModel
}

interface TaskLogModel extends TaskLogFields {
  readonly task: TaskModel
  readonly step: StepModel
  readonly startedBy: ContributorModel
  readonly endedBy?: ContributorModel
}
