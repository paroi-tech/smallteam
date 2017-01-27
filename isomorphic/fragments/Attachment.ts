import { FragmentMeta, pickFragmentMeta } from "../FragmentMeta"

export interface AttachmentInfo {
  readonly attachedById: string //ContributorModel
  readonly attachedTs: number
  readonly weightKb: number
}

export interface FileAttachment extends AttachmentInfo {
  readonly type: "file"
  readonly url: string
}

export interface ImageFragment {
  readonly url: string
  readonly width?: number
  readonly height?: number
}

export interface ImageAttachment extends AttachmentInfo, ImageFragment {
  readonly type: "image"
}

export type Attachment = ImageAttachment | FileAttachment

export const imageAttachmentMeta: FragmentMeta = {
  type: "ImageAttachment",
  fields: {
    attachedById: {
      dataType: "string"
    },
    attachedTs: {
      dataType: "number"
    },
    weightKb: {
      dataType: "number"
    },
    type: {
      dataType: "string",
      values: ["image"]
    },
    url: {
      dataType: "string"
    },
    width: {
      dataType: "number",
      optional: true
    },
    height: {
      dataType: "number",
      optional: true
    }
  }
}

export const fileAttachmentMeta: FragmentMeta = {
  type: "ImageAttachment",
  fields: {
    attachedById: {
      dataType: "string"
    },
    attachedTs: {
      dataType: "number"
    },
    weightKb: {
      dataType: "number"
    },
    type: {
      dataType: "string",
      values: ["image"]
    }
  }
}
