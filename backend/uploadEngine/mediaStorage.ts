import { Request, Response } from "express"
import * as multer from "multer"
import * as sql from "sql-bricks"
import * as sharp from "sharp"
import { fileCn } from "../utils/dbUtils"
import { fileBaseName } from "./utils"

// --
// -- Base Types
// --

export interface ExternalRef {
  type: string
  id: string
}

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

// URL: /get-file/{file.id}/{media.baseName}-{variant.code}.{extension}

// --
// -- Store a media
// --

export type MulterFile = Express.Multer.File

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

export async function storeMedia(params: StoreMediaParameters): Promise<string> {
  let transCn = await fileCn.beginTransaction()

  try {
    let mediaId: string | undefined
    if (params.overwrite && params.externalRef) {
      let found = await findMediaByExternalRef(params.externalRef)
      if (found.length >= 1)
        mediaId = found[0]
    }

    if (mediaId === undefined) {
      mediaId = await insertMedia({
        baseName: fileBaseName(params.file.originalname),
        originalName: params.file.originalname,
        ownerId: params.ownerId,
        externalRef: params.externalRef
      })
    } else {
      await clearMediaVariants(mediaId)
      await updateMedia({
        baseName: fileBaseName(params.file.originalname),
        originalName: params.file.originalname,
        ownerId: params.ownerId
      }, mediaId)
    }

    await insertVariant({
      mediaId,
      code: "orig",
      weightB: params.file.size,
      imType: params.file.mimetype,
      img: await getImageMeta(params.file),
      binData: params.file.buffer
    })

    await transCn.commit()
    return mediaId
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

type InsertMedia = Pick<MediaDef, "baseName" | "originalName" | "ownerId" | "externalRef">

async function insertMedia(media: InsertMedia): Promise<string> {
  let mediaId = (await fileCn.execSqlBricks(
    sql.insertInto("media").values({
      "base_name": media.baseName,
      "orig_name": media.originalName,
      "owner_id": media.ownerId
    })
  )).getInsertedId()
  if (media.externalRef) {
    await fileCn.execSqlBricks(
      sql.insertInto("media_ref").values({
        "media_id": mediaId,
        "external_type": media.externalRef.type,
        "external_id": media.externalRef.id
      })
    )
  }
  return mediaId
}

async function clearMediaVariants(mediaId: string) {
  await fileCn.execSqlBricks(
    sql.deleteFrom("variant").where({
      "media_id": mediaId
    })
  )
}

type UpdateMedia = Pick<MediaDef, "baseName" | "originalName" | "ownerId">

async function updateMedia(media: UpdateMedia, mediaId: string) {
  await fileCn.execSqlBricks(
    sql.update("media")
      .set({
        "base_name": media.baseName,
        "orig_name": media.originalName,
        "owner_id": media.ownerId
      })
      .where({
        "media_id": mediaId
      })
  )
}

type InsertVariant = Pick<VariantDef, "code" | "imType" | "weightB" | "img" | "binData"> & {
  "mediaId": string
}

async function insertVariant(variant: InsertVariant): Promise<string> {
  let variantId = (await fileCn.execSqlBricks(
    sql.insertInto("variant").values({
      "media_id": variant.mediaId,
      "weight_b": variant.weightB,
      "im_type": variant.imType,
      "code": variant.code,
      "bin_data": variant.binData
    })
  )).getInsertedId()
  if (variant.img) {
    await fileCn.execSqlBricks(
      sql.insertInto("variant_img").values({
        "variant_id": variantId,
        "width": variant.img.width,
        "height": variant.img.height,
        "dpi": variant.img.dpi
      })
    )
  }
  return variantId
}

function isValidImage(imType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}

async function getImageMeta(f: MulterFile): Promise<ImageDef | undefined> {
  if (!isValidImage(f.mimetype))
    return
  try {
    let metadata = await sharp(f.buffer).metadata()
    if (metadata.width && metadata.height) {
      return {
        width: metadata.width,
        height: metadata.height,
        dpi: metadata.density
      }
    }
  } catch (err) {
    console.log(`Cannot process the image (type ${f.mimetype}): ${err.message}`)
  }
}

// --
// -- Remove medias
// --

export type MediaOrVariantId = { mediaId: string } | { variantId: string }

export async function removeMedia(id: MediaOrVariantId): Promise<boolean> {
  let mediaId: string
  if ("mediaId" in id)
    mediaId = id.mediaId
  else {
    let foundMediaId = await fileCn.singleValueSqlBricks(
      sql.select("media_id")
        .from("variant")
        .where("variant_id", id.variantId)
    )
    if (foundMediaId === undefined)
      return false
    mediaId = foundMediaId.toString()
  }

  await fileCn.execSqlBricks(
    sql.deleteFrom("variant").where("media_id", mediaId)
  )
  let result = await fileCn.execSqlBricks(
    sql.deleteFrom("media").where("media_id", mediaId)
  )
  return result.affectedRows === 1
}

export interface MediaFilter {
  externalRef?: ExternalRef
}

/**
 * @returns (async) The number of deleted medias
 */
export async function removeMedias(filter: MediaFilter): Promise<number> {
  if (!filter.externalRef)
    return 0
  let found = await findMediaByExternalRef(filter.externalRef)
  for (let mediaId of found)
    await removeMedia({ mediaId })
  return found.length
}

// --
// -- Fetch variant data
// --

export type VDMedia = Pick<MediaDef, "id" | "ts">

export type VariantData = Pick<VariantDef, "id" | "binData" | "weightB" | "imType"> & {
  media: VDMedia
  fileName: string
}

export async function getFileData(variantId: string): Promise<VariantData | undefined> {
  let row = await fileCn.singleRowSqlBricks(
    sql.select("v.bin_data, v.weight_b, v.im_type, v.code, m.media_id, m.ts, m.orig_name, m.base_name")
      .from("variant v")
      .innerJoin("media m").using("media_id")
      .where("v.variant_id", variantId)
  )
  if (!row)
    return
  let fileName = getFileName({
    imType: row["im_type"],
    code: row["code"],
    originalName: row["orig_name"],
    baseName: row["base_name"]
  })
  return {
    id: variantId,
    weightB: row["weight_b"],
    imType: row["im_type"],
    media: {
      id: row["media_id"],
      ts: row["ts"]
    },
    fileName,
    binData: row["bin_data"]
  }
}

// --
// -- Find Media & Variant
// --

export type Media = Pick<MediaDef, "id" | "ts" | "baseName" | "originalName" | "ownerId"> & {
  variants: Variants
}

export interface Variants {
  [code: string]: Variant
}

export type Variant = Pick<VariantDef, "id" | "code" | "imType" | "weightB" | "img"> & {
  fileName: string
  // url: string
}

export type MediaQuery = {
  externalRef: ExternalRef
} | MediaOrVariantId

export async function findMedias(query: MediaQuery): Promise<Media[]> {
  if (!query.externalRef)
    return []
  let rows = await fileCn.allSqlBricks(
    sqlSelectMedia()
      .innerJoin("media_ref r").using("media_id")
      .where({
        "r.external_type": query.externalRef.type,
        "r.external_id": query.externalRef.id
      })
  )
  let result: Media[] = []
  for (let row of rows) {
    let id = row["media_id"].toString()
    result.push({
      id,
      ts: row["ts"],
      baseName: row["base_name"],
      originalName: row["orig_name"],
      ownerId: row["owner_id"],
      variants: await fetchVariantsOf(id, row["base_name"], row["orig_name"])
    })
  }
  return result
}

export async function findMedia(query: MediaQuery): Promise<Media | undefined> {
  let medias = await findMedias(query)
  return medias.length === 1 ? medias[0] : undefined
}

function sqlSelectMedia() {
  return sql.select("m.media_id, m.ts, m.base_name, m.orig_name, m.owner_id")
    .from("media m")
}

async function fetchVariantsOf(mediaId: string, baseName?: string, originalName?: string): Promise<Variants> {
  let rows = await fileCn.allSqlBricks(
    sqlSelectVariant()
      .where("v.media_id", mediaId)
  )
  let result: Variants = {}
  for (let row of rows) {
    let code = row["code"]
    result[code] = toVariant(row, baseName, originalName)
  }
  return result
}

function sqlSelectVariant() {
  return sql.select("v.variant_id, v.weight_b, v.im_type, v.code, i.width, i.height, i.dpi")
    .from("variant v")
    .leftJoin("variant_img i").using("variant_id")
}

function toVariant(row: any[], baseName?: string, originalName?: string): Variant {
  let id = row["variant_id"].toString()
  let fileName = getFileName({
    imType: row["im_type"],
    code: row["code"],
    originalName,
    baseName
  })
  let img = !row["width"] || !row["height"] ? undefined : {
    width: row["width"],
    height: row["height"],
    dpi: row["dpi"]
  }
  return {
    id,
    weightB: row["weight_b"],
    imType: row["im_type"],
    code: row["code"],
    fileName,
    // url: `/get-file/${id}/${fileName}`,
    img
  }
}

interface FileNameOptions {
  imType: string
  code?: string
  baseName?: string
  originalName?: string
}

function getFileName(options: FileNameOptions) {
  let fileExt = toFileExtension(options.imType, options.originalName) || ""
  let n = [options.baseName, options.code].filter(tok => tok !== undefined).join("-")
  if (!n)
    n = options.originalName || "unamed"
  console.log(".................. >>> getFileName", `${n}${fileExt}`, options)
  return `${n}${fileExt}`
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 */
function toFileExtension(imType: string, originalName?: string): string | undefined {
  let [type, subType] = imType.split("/")
  if (subType.length >= 2 && subType.length <= 4)
    return `.${subType}`
  if (imType === "text/plain")
    return ".txt"
  if (imType === "text/javascript")
    return ".js"
  if (originalName) {
    let dotIndex = originalName.lastIndexOf(".")
    if (dotIndex !== -1)
      return originalName.substr(dotIndex)
  }
}

// --
// -- Find MediaRef
// --

export interface MediaRef {
  externalRef?: ExternalRef
  ownerId?: string
}

export async function findMediaRef(id: MediaOrVariantId): Promise<MediaRef | undefined> {
  let sb = sql.select("m.owner_id, r.external_type, r.external_id")
    .from("media m")
    .leftJoin("media_ref r").using("media_id")
  if ("mediaId" in id)
    sb = sb.where("m.media_id", id.mediaId)
  else {
    sb = sb.innerJoin("variant v").using("media_id")
      .where("v.variant_id", id.variantId)
  }
  let row = await fileCn.singleRowSqlBricks(sb)

  if (!row)
    return

  let externalRef = !row["external_type"] || !row["external_id"] ? undefined : {
    type: row["external_type"],
    id: row["external_id"]
  }
  return {
    externalRef,
    ownerId: row["owner_id"]
  }
}

// --
// -- Common functions
// --

/**
 * @returns the list of media identifiers attached to the `externalRef`. Can be empty.
 */
async function findMediaByExternalRef(externalRef: ExternalRef): Promise<string[]> {
  let rows = await fileCn.allSqlBricks(
    sql.select("media_id")
      .from("media_ref")
      .where({
        "external_type": externalRef.type,
        "external_id": externalRef.id
      })
  )
  return rows.map(row => row.media_id)
}