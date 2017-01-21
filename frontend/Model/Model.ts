
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
  archived: boolean
  rootTaskId: string
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


type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

export async function queryProjects(filters: AsFilter<ProjectFields>): Promise<ProjectModel[]> {
  let response = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'Project',
      filters
    })
  })
  try {
    return createProjectModel(validateData(projectMeta, await response.json()))
  } catch (err) {
    console.log('parsing failed', err)
    throw err
  }
}

function createProjectModel(data: ProjectFields[]): Promise<ProjectModel[]> {
  return null as any;
  // for (let item of data) {
  //   item.rootTask =
  // }
}

function validateData(meta: Meta, data: any): any {
  for (let fieldName in meta.fields) {
    if (!meta.fields.hasOwnProperty(fieldName))
      continue
    let res = isValidValue(meta.fields[fieldName], data[fieldName])
    if (res !== true)
      throw new Error(`Type ${meta.type}, field "${fieldName}": ${res}`)
  }
  let remaining: string[] = []
  for (let fieldName in data) {
    if (!data.hasOwnProperty(fieldName))
      continue
    if (!meta.fields[fieldName])
      remaining.push(fieldName)
  }
  if (remaining.length > 0)
    throw new Error(`Type ${meta.type}, unknown fields: ${remaining.join(", ")}`)
  return data
}

function isValidValue(field: FieldMeta, value: any): true | string {
  if (value === undefined || value === null)
    return field.nullable ? true : `required value`
  if (typeof value !== field.dataType)
    return `invalid type "${typeof value}", required: "${field.dataType}"`
  if (typeof value === "string" && !field.emptyable && value.trim() === "")
    return `cannot be empty`
  return true
}

interface FieldMeta {
  dataType: "string" | "boolean" | "number"
  nullable?: boolean
  emptyable?: boolean
}

interface Meta {
  type: string
  fields: {
    [name: string]: FieldMeta
  }
}

const projectMeta: Meta = {
  type: "Project",
  fields: {
    id: {
      dataType: "string",
    },
    code: {
      dataType: "string",
    },
    archived: {
      dataType: "boolean",
    },
    rootTaskId: {
      dataType: "string",
    }
  }
}

// interface ProjectFields {
//   id: string
//   code: string
//   archived: boolean
//   rootTaskId: string
// }
//
// interface ProjectModel extends ProjectFields {
//   readonly rootTask: TaskModel
//   readonly steps: StepModel[]
// }

// export default class Model {
//   get()
// }

