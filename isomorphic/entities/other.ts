export interface ImageFragment {
  url: string
  width?: number
  height?: number
}

export interface ContributorFragment {
  id: string
  name: string
  login: string
  email: string
}

export interface StepFragment {
  id: string
  name: string
  typeId: string
}

export interface FlagFragment {
  id: string
  label: string
  color: string
}

export interface CommentFragment {
  id: string
  body: string
  createTs: number
  updateTs: number
}

export interface TaskLogFragment {
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

export interface ImageAttachment extends AttachmentInfo, ImageFragment {
  type: 'image'
}

export type Attachment = ImageAttachment | PdfAttachment

