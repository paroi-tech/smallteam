
export interface TaskFields {
  id: string
  code: string
  label: string
  description?: string
  createTs: number
  updateTs: number
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
