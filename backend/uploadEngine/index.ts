import { Request, Response } from "express"
import * as multer from "multer"
import * as sql from "sql-bricks"
import * as sharp from "sharp"
import { fileCn } from "../utils/dbUtils"
import { fileBaseName } from "./utils"
import { insertInto } from "sql-bricks"

// --
// -- Base Types
// --

export interface ExternalRef {
  type: string
  id: string
}

interface Media {
  id: string
  ts: string
  baseName?: string
  originalName?: string
  ownerId?: string
  externalRef?: ExternalRef
}

interface Variant {
  id: string
  binData: Buffer
  weightB: number
  imType: string
  variantName?: string
  media: Media
  img?: Image
}

interface Image {
  width: number
  height: number
  dpi?: number
}

// URL: /get-file/{file.id}/{media.baseName}-{file.variantName}.{extension}

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

export async function storeMedia(params: StoreMediaParameters): Promise<void> {
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
      binData: params.file.buffer,
      weightB: params.file.size,
      imType: params.file.mimetype,
      variantName: undefined,
      img: await getImageMeta(params.file)
    })

    await transCn.commit()
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

type InsertMedia = Pick<Media, "baseName" | "originalName" | "ownerId" | "externalRef">

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

type UpdateMedia = Pick<Media, "baseName" | "originalName" | "ownerId">

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

type InsertVariant = Pick<Variant, "binData" | "weightB" | "imType" | "variantName" | "img"> & {
  "mediaId": string
}

async function insertVariant(variant: InsertVariant): Promise<string> {
  let variantId = (await fileCn.execSqlBricks(
    sql.insertInto("variant").values({
      "media_id": variant.mediaId,
      "bin_data": variant.binData.buffer,
      "weight_b": variant.weightB,
      "im_type": variant.imType,
      "variant_name": variant.variantName
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
  // Sharp cannot work on type "image/gif"
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(imType)
}

async function getImageMeta(f: MulterFile): Promise<Image | undefined> {
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

export type MediaOrVariantId = {
  mediaId: string
} | {
    variantId: string
  }

export async function removeMedia(id: MediaOrVariantId): Promise<boolean> {
  let mediaId: string
  if ("mediaId" in id)
    mediaId = id.mediaId
  else {
    let foundMediaId = await fileCn.singleValue(
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

type VDMedia = Pick<Media, "id" | "ts">

type VariantData = Pick<Variant, "id" | "binData" | "weightB" | "imType"> & {
  media: VDMedia
  name: string
}

export async function getVariantData(variantId: string): Promise<VariantData | undefined> {
  let row = await fileCn.singleRow(
    sql.select("v.bin_data, v.weight_b, v.im_type, v.variant_name, m.media_id, m.ts, m.orig_name, m.base_name")
      .from("variant v")
      .innerJoin("media m").using("media_id")
      .where("v.variant_id", variantId)
  )
  if (!row)
    return
  let name = fileName({
    imType: row["im_type"],
    originalName: row["orig_name"],
    baseName: row["base_name"],
    variantName: row["variant_name"]
  })
  return {
    id: variantId,
    weightB: row["weight_b"],
    imType: row["im_type"],
    media: {
      id: row["media_id"],
      ts: row["ts"]
    },
    name,
    binData: row["bin_data"]
  }
}

// --
// -- Fetch variant info
// --

export type MediaInfo = Pick<Media, "id" | "ts" | "baseName" | "originalName" | "ownerId">

export type VariantInfo = Pick<Variant, "id" | "weightB" | "imType" | "variantName" | "img"> & {
  media: MediaInfo
  name: string
  url: string
}

export interface Query {
  externalRef: ExternalRef
  variantName: string | null
}

export async function fetchListOfVariantInfo(query: Query): Promise<VariantInfo[]> {
  let rows = await fileCn.all(
    sqlSelectVariantInfo()
      .innerJoin("media_ref r").using("media_id")
      .where({
        "v.variant_name": query.variantName,
        "r.external_type": query.externalRef.type,
        "r.external_id": query.externalRef.id
      })
  )
  let result: VariantInfo[] = []
  for (let row of rows)
    result.push(toVariantInfo(row))
  return result
}

function sqlSelectVariantInfo() {
  return sql.select("v.variant_id, v.weight_b, v.im_type, v.variant_name, m.media_id, m.ts, m.base_name, m.orig_name," +
    " m.owner_id, i.width, i.height, i.dpi")
    .from("variant v")
    .innerJoin("media m").using("media_id")
    .leftJoin("variant_img i").using("variant_id")
}

function toVariantInfo(row: any[]): VariantInfo {
  let variantId = row["variant_id"].toString()
  let name = fileName({
    imType: row["im_type"],
    originalName: row["orig_name"],
    baseName: row["base_name"],
    variantName: row["variant_name"]
  })
  let img = !row["width"] || !row["height"] ? undefined : {
    width: row["width"],
    height: row["height"],
    dpi: row["dpi"]
  }
  return {
    id: variantId,
    weightB: row["weight_b"],
    imType: row["im_type"],
    variantName: row["variant_name"],
    media: {
      id: row["media_id"].toString(),
      ts: row["ts"],
      baseName: row["base_name"],
      originalName: row["orig_name"],
      ownerId: row["owner_id"]
    },
    name,
    url: `/get-file/${variantId}/${name}`,
    img
  }
}

// async function fetchImageMeta(variantId: string): Promise<ImageMeta | undefined> {
//   let values = await fetchFileMeta(variantId)
//   if ("width" in values && "height" in values)
//     return values as any
// }

// async function fetchFileMeta(variantId: string): Promise<MetaValues> {
//   let values: MetaValues = {}

//   // Fetch from 'file_meta_str'
//   let rows = await fileCn.all(
//     sql.select("code, val")
//       .from("file_meta_str")
//       .where("variant_id", variantId)
//   )
//   for (let row of rows)
//     values[row["code"]] = row["val"]

//   // Fetch from 'file_meta_int'
//   rows = await fileCn.all(
//     sql.select("code, val")
//       .from("file_meta_int")
//       .where("variant_id", variantId)
//   )
//   for (let row of rows)
//     values[row["code"]] = row["val"]

//   return values
// }

interface FileNameOptions {
  imType: string
  baseName?: string
  variantName?: string
  originalName?: string
}

function fileName(options: FileNameOptions) {
  let fileExt = toFileExtension(options.imType, options.originalName) || ""
  let n = [options.baseName, options.variantName].filter(tok => tok !== undefined).join("-")
  if (!n)
    n = options.originalName || "unamed"
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
// -- Common functions
// --

/**
 * @returns the list of media identifiers attached to the `externalRef`. Can be empty.
 */
async function findMediaByExternalRef(externalRef: ExternalRef): Promise<string[]> {
  let rows = await fileCn.all(
    sql.select("media_id")
      .from("media_ref")
      .where({
        "external_type": externalRef.type,
        "external_id": externalRef.id
      })
  )
  return rows.map(row => row.media_id)
}