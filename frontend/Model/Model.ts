
interface ImageFields {
  url: string
  width?: number
  height?: number
}

interface ImageModel extends ImageFields {
}

interface ContributorFields {
  id: string
  name: string
  login: string
  email: string
}

interface ContributorModel extends ContributorFields {
  readonly avatar: ImageModel
}

interface ProjectFields {
  id: string
  code: string
}

interface ProjectModel extends ProjectFields {
  readonly rootTask: TaskModel
  readonly steps: StepModel[]
}

interface StepFields {
  id: string
  name: string
  typeId: string
}

interface StepModel extends StepFields {
  readonly project: ProjectModel
}

interface TaskFields {
  id: string
  code: string
  label: string
  description?: string
  createTs: number
  updateTs: number
}

interface TaskModel extends TaskFields {
  readonly currentStep: StepModel
  readonly parent?: TaskModel
  readonly createdBy: ContributorModel
  readonly affectedTo?: ContributorModel
  readonly comments: CommentModel[]
  readonly flags: FlagModel[]
  readonly attachments: Attachment[]
  readonly logs: TaskLogModel[]
  setCurrentStep(stepId: string): Promise<StepModel>
  createChildTask(label: string): Promise<TaskModel>
}

interface FlagFields {
  id: string
  label: string
  color: string
}

interface FlagModel extends FlagFields {
}

interface CommentFields {
  id: string
  body: string
  createTs: number
  updateTs: number
}

interface CommentModel extends CommentFields {
  readonly task: TaskModel
  readonly writtenBy: ContributorModel
}

interface TaskLogFields {
  id: string
  startedTs: number
  endedTs?: number
}

interface TaskLogModel extends TaskLogFields {
  readonly task: TaskModel
  readonly step: StepModel
  readonly startedBy: ContributorModel
  readonly endedBy?: ContributorModel
}

interface AttachmentMeta {
  attachedBy: ContributorModel
  attachedTs: number
  weightKb: number
}

interface PdfAttachment extends AttachmentMeta {
  type: 'pdf'
  url: string
}

interface ImageAttachment extends AttachmentMeta, ImageFields {
  type: 'image'
}

type Attachment = ImageAttachment | PdfAttachment


export default class Model {

}

