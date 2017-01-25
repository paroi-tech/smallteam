export interface ImageFields {
  url: string
  width?: number
  height?: number
}

export interface ContributorFields {
  id: string
  name: string
  login: string
  email: string
}

export interface StepFields {
  id: string
  name: string
  typeId: string
}

export interface FlagFields {
  id: string
  label: string
  color: string
}

export interface CommentFields {
  id: string
  body: string
  createTs: number
  updateTs: number
}

export interface TaskLogFields {
  id: string
  startedTs: number
  endedTs?: number
}

export interface AttachmentInfo {
  attachedById: string //ContributorModel
  attachedTs: number
  weightKb: number
}

export interface PdfAttachment extends AttachmentInfo {
  type: 'pdf'
  url: string
}

export interface ImageAttachment extends AttachmentInfo, ImageFields {
  type: 'image'
}

export type Attachment = ImageAttachment | PdfAttachment

