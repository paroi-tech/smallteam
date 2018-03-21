import { Request, Response } from "express"
import * as multer from "multer"
import * as sql from "sql-bricks"
import * as sharp from "sharp"
import { fileCn as cn, fileCn } from "../utils/dbUtils"
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

interface File {
  id: string
  binData: Buffer
  weightB: number
  imType: string
  variantName?: string
  meta?: MetaValues
  media: Media
}

interface MetaValues {
  [key: string]: string | number
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
  let transaction = await cn.beginTransaction()

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
      await clearMediaFiles(mediaId)
      await updateMedia({
        baseName: fileBaseName(params.file.originalname),
        originalName: params.file.originalname,
        ownerId: params.ownerId
      }, mediaId)
    }

    await insertFile({
      mediaId,
      binData: params.file.buffer,
      weightB: params.file.size,
      imType: params.file.mimetype,
      // variantName: string,
      meta: await getFileMetaValues(params.file)
    })

    await transaction.commit()
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
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

async function clearMediaFiles(mediaId: string) {
  await fileCn.execSqlBricks(
    sql.deleteFrom("file").where({
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

type InsertFile = Pick<File, "binData" | "weightB" | "imType" | "variantName" | "meta"> & {
  "mediaId": string
}

async function insertFile(file: InsertFile): Promise<string> {
  let fileId = (await fileCn.execSqlBricks(
    sql.insertInto("file").values({
      "media_id": file.mediaId,
      "bin_data": file.binData.buffer,
      "weight_b": file.weightB,
      "im_type": file.imType,
      "variant_name": file.variantName
    })
  )).getInsertedId()
  if (file.meta) {
    for (let code of Object.keys(file.meta)) {
      let val = file.meta[code]
      await fileCn.execSqlBricks(
        sql.insertInto(typeof val === "number" ? "file_meta_int" : "file_meta_str").values({
          "file_id": fileId,
          "code": code,
          "val": val
        })
      )
    }
  }
  return fileId
}

function isValidImage(imType: string) {
  // Sharp cannot work on type "image/gif"
  return ["image/png", "image/jpeg", "image/webp"].includes(imType)
}

async function getFileMetaValues(f: MulterFile): Promise<MetaValues> {
  if (!isValidImage(f.mimetype))
    return {}
  try {
    let metadata = await sharp(f.buffer).metadata()
    let result = {}
    result["width"] = metadata.width
    result["height"] = metadata.height
    return result
  } catch (err) {
    console.log(`Cannot process the image (type ${f.mimetype}): ${err.message}`)
    return {}
  }
}

// --
// -- Remove medias
// --

export type MediaOrFileId = {
  mediaId: string
} | {
    fileId: string
  }

export async function removeMedia(id: MediaOrFileId): Promise<boolean> {
  let mediaId: string
  if ("mediaId" in id)
    mediaId = id.mediaId
  else {
    let foundMediaId = await fileCn.singleValue(
      sql.select("media_id")
        .from("file")
        .where("file_id", id.fileId)
    )
    if (foundMediaId === undefined)
      return false
    mediaId = foundMediaId.toString()
  }

  await fileCn.execSqlBricks(
    sql.deleteFrom("file").where("media_id", mediaId)
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
// -- Fetch file data
// --

type FileDataMedia = Pick<Media, "id" | "ts">

type FileData = Pick<File, "id" | "binData" | "weightB" | "imType"> & {
  media: FileDataMedia
  name: string
}

export async function getFileData(fileId: string): Promise<FileData | undefined> {
  let row = await fileCn.singleRow(
    sql.select("f.bin_data, f.weight_b, f.im_type, f.variant_name, m.media_id, m.ts, m.orig_name, m.base_name")
      .from("file f")
      .innerJoin("media m").using("media_id")
      .where("f.file_id", fileId)
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
    id: fileId,
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
// -- Fetch file info
// --

export type MediaInfo = Pick<Media, "id" | "ts" | "baseName" | "originalName" | "ownerId">

export type FileInfo = Pick<File, "id" | "weightB" | "imType" | "variantName"> & {
  media: MediaInfo
  name: string
  url: string
  imageMeta?: ImageMeta
}

export interface ImageMeta {
  width: number
  height: number
}

export interface Query {
  externalRef: ExternalRef
  variantName: string | null
}

export async function fetchListOfFileInfo(query: Query): Promise<FileInfo[]> {
  let rows = await fileCn.all(
    sqlSelectFileInfo()
      .innerJoin("media_ref r").using("media_id")
      .where({
        "f.variant_name": query.variantName,
        "r.external_type": query.externalRef.type,
        "r.external_id": query.externalRef.id
      })
  )
  let result: FileInfo[] = []
  for (let row of rows)
    result.push(await toFileInfo(row))
  return result
}

function sqlSelectFileInfo() {
  return sql.select("f.file_id, f.weight_b, f.im_type, f.variant_name, m.media_id, m.ts, m.base_name, m.orig_name, m.owner_id")
    .from("file f")
    .innerJoin("media m").using("media_id")
}

async function toFileInfo(row: any[]): Promise<FileInfo> {
  let fileId = row["file_id"].toString()
  let name = fileName({
    imType: row["im_type"],
    originalName: row["orig_name"],
    baseName: row["base_name"],
    variantName: row["variant_name"]
  })
  return {
    id: fileId,
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
    url: `/get-file/${fileId}/${name}`,
    imageMeta: await fetchImageMeta(fileId)
  }
}

async function fetchImageMeta(fileId: string): Promise<ImageMeta | undefined> {
  let values = await fetchFileMeta(fileId)
  if ("width" in values && "height" in values)
    return values as any
}

async function fetchFileMeta(fileId: string): Promise<MetaValues> {
  let values: MetaValues = {}

  // Fetch from 'file_meta_str'
  let rows = await fileCn.all(
    sql.select("code, val")
      .from("file_meta_str")
      .where("file_id", fileId)
  )
  for (let row of rows)
    values[row["code"]] = row["val"]

  // Fetch from 'file_meta_int'
  rows = await fileCn.all(
    sql.select("code, val")
      .from("file_meta_int")
      .where("file_id", fileId)
  )
  for (let row of rows)
    values[row["code"]] = row["val"]

  return values
}

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