
interface MediaDef {
  id: string
  ts: string
  baseName?: string
  originalName?: string
  ownerId?: string
  externalRef?: ExternalRef
}

interface VariantDef {
  id: string
  media: MediaDef
  code: string
  imType: string
  weightB: number
  img?: ImageDef
  binData: Buffer
}

interface ImageDef {
  width: number
  height: number
  dpi?: number
}

export type MulterFile = Express.Multer.File

export interface ExternalRef {
  type: string
  id: string
}

export type MediaOrVariantId = { mediaId: string } | { variantId: string }

export interface StoreMediaParameters {
  file: MulterFile
  ownerId?: string
  externalRef?: ExternalRef
  /**
   * If this parameter is `true` and a media with the same value of `externalRef` already exists, then the previous media is replaced. Otherwise, a new media is added.
   *
   * Default value is: `false`.
   */
  overwrite?: boolean
}

export interface NewMedia {
  mediaId: string
  overwritten: boolean
}

export interface MediaFilter {
  externalRef?: ExternalRef
}

// --
// -- Fetch variant data
// --

export type VDMedia = Pick<MediaDef, "id" | "ts">

export type VariantData = Pick<VariantDef, "id" | "binData" | "weightB" | "imType"> & {
  media: VDMedia
  fileName: string
}

// --
// -- Find Media & Variant
// --

export type Media = Pick<MediaDef, "id" | "ts" | "baseName" | "originalName" | "ownerId" | "externalRef"> & {
  variants: Variants
}

export interface Variants {
  [code: string]: Variant
}

export type Variant = Pick<VariantDef, "id" | "code" | "imType" | "weightB" | "img"> & {
  fileName: string
}

export type MediaQuery = {
  externalRef: ExternalRef
} | MediaOrVariantId

// --
// -- Find MediaRef
// --

export interface MediaRef {
  externalRef?: ExternalRef
  ownerId?: string
}
