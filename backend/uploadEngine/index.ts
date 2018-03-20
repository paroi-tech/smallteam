import { Request, Response } from "express"
import * as multer from "multer"
import * as sql from "sql-bricks"
import * as sharp from "sharp"
// import { buildSelect, buildUpdate, buildDelete, buildInsert } from "../utils/sql92builder/Sql92Builder"
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

export interface MediaFilter {
  externalRef: ExternalRef
}

export async function removeMedia(mediaId: string): Promise<void> {
  await fileCn.execSqlBricks(
    sql.deleteFrom("file").where({
      "media_id": mediaId
    })
  )
  await fileCn.execSqlBricks(
    sql.deleteFrom("media").where({
      "media_id": mediaId
    })
  )
}

export async function removeMedias(filter: MediaFilter): Promise<void> {
  let found = await findMediaByExternalRef(filter.externalRef)
  for (let mediaId of found)
    await removeMedia(mediaId)
}

// --
// -- Fetch file data
// --

type FileDataMedia = Pick<Media, "id" | "ts">

type FileData = Pick<File, "id" | "binData" | "weightB" | "imType"> & {
  media: FileDataMedia
}

export async function getFileData(fileId: string): Promise<FileData | undefined> {
  let row = await fileCn.singleRow(
    sql.select("f.bin_data, f.weight_b, f.im_type, m.media_id, m.ts")
      .from("file f")
      .innerJoin("media m").using("media_id")
      .where("f.file_id", fileId)
  )
  if (!row)
    return
  return {
    id: fileId,
    weightB: row["weight_b"],
    imType: row["im_type"],
    media: {
      id: row["media_id"],
      ts: row["ts"]
    },
    binData: row["bin_data"]
  }
}

// --
// -- Fetch file info
// --

export type MediaInfo = Pick<Media, "id" | "ts" | "baseName" | "originalName">

export type FileInfo = Pick<File, "id" | "weightB" | "imType" | "variantName"> & {
  media: MediaInfo
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
    sql.select("f.file_id")
      .from("file f")
      .innerJoin("media_ref r").using("media_id")
      .where({
        "f.variant_name": query.variantName,
        "r.external_type": query.externalRef.type,
        "r.external_id": query.externalRef.id
      })
  )
  let result: FileInfo[] = []
  for (let row of rows)
    result.push(await fetchFileInfo(row["file_id"].toString()))
  return result
}

async function fetchFileInfo(fileId: string): Promise<FileInfo> {
  let row = await fileCn.singleRow(
    sql.select("f.weight_b, f.im_type, f.variant_name, m.media_id, m.ts, m.base_name, m.orig_name")
      .from("file f")
      .innerJoin("media m").using("media_id")
      .where("f.file_id", fileId)
  )
  if (!row)
    throw new Error(`Unknown file ID: ${fileId}`)
  let fileExt = toFileExtension(row["im_type"], row["orig_name"]) || ""
  return {
    id: fileId,
    weightB: row["weight_b"],
    imType: row["im_type"],
    variantName: row["variant_name"],
    media: {
      id: row["media_id"],
      ts: row["ts"],
      baseName: row["base_name"],
      originalName: row["orig_name"]
    },
    url: `/get-file/${fileId}/${row["base_name"]}-${row["variant_name"]}${fileExt}`,
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

















// type ImageFilterCb = (err: Error | null, acceptFile: boolean) => void
// type FileFilter = (req: Request, file: MulterFile, cb: ImageFilterCb) => void

// interface FileMeta {
//   fileId: string
//   code: string
//   value: number | string
// }

// type ImageDimension = {
//   width: number
//   height: number
// }

// export type MainMetaCode = "contributorAvatar" | "task"

// export type __FileInfo = {
//   id: string
//   name: string
//   mimeType: string
//   weight: number
//   uploaderId: string
// }

// export type FileObject = {
//   info: __FileInfo
//   buffer: any
// }

// let dimensions = [
//   { width: 32, height: 32 },
//   { width: 96, height: 96 }
// ]





// export async function updateFile(f: MulterFile, fId: string, uploaderId: string) {
//   let result = {
//     done: false
//   }
//   let transaction = await cn.beginTransaction()

//   try {
//     let sql = "UPDATE file SET bin_data=$data WHERE file_id=$fId"

//     await cn.exec(sql, {
//       $fId: fId,
//       $data: f.buffer
//     })
//     await addMetaInt(fId, "weight", f.size)
//     await addMetaStr(fId, "mime", f.mimetype)
//     await addMetaStr(fId, "name", f.originalname)
//     await addMetaStr(fId, "uploader", uploaderId)

//     await transaction.commit()
//     result.done = true
//   } finally {
//     if (transaction.inTransaction)
//       await transaction.rollback()
//   }

//   return result
// }

// export async function deleteFile(fId: string) {
//   let result = {
//     done: false
//   }
//   let transaction = await cn.beginTransaction()

//   try {
//     await removeAllMetaInt(fId)
//     await removeAllMetaStr(fId)
//     await removeFile(fId)

//     await transaction.commit()
//     result.done = true
//   } finally {
//     if (transaction.inTransaction)
//       await transaction.rollback()
//   }

//   return result
// }

// export async function fetchRelatedFilesInfo(metaCode: MainMetaCode, metaVal: string): Promise<__FileInfo[]> {
//   let arr = [] as __FileInfo[]
//   let sql = buildSelect()
//     .select("file_id")
//     .from("meta_str")
//     .where("code", "=", metaCode)
//     .andWhere("val", "=", metaVal)
//   let rs = await cn.all(sql.toSql())

//   for (let row of rs) {
//     let fId = row["file_id"].toString()
//     let info = await fetchFileInfo(fId)

//     arr.push(info)
//   }

//   return arr
// }

// async function fetchFileInfo(fId: string) {
//   let sql = buildSelect()
//     .select("file_id")
//     .from("file")
//     .where("file_id", "=", fId)
//   let rs = await cn.all(sql.toSql())

//   if (rs.length === 0)
//     return undefined

//   let info: any = {
//     id: fId
//   }

//   for (let meta of await getAllMeta(fId)) {
//     if (meta.code === "name")
//       info.name = meta.value as string
//     else if (meta.code === "weight")
//       info.weight = meta.value as number
//     else if (meta.code === "mime")
//       info.mimeType = meta.value as string
//     else if (meta.code == "uploader")
//       info.uploaderId = meta.value as string
//   }

//   return info
// }

// export async function fetchSingleRelatedFileInfo(metaCode: MainMetaCode, metaVal: string, fId: string): Promise<__FileInfo | undefined> {
//   let sql = buildSelect()
//     .select("file_id, code, val")
//     .from("meta_str")
//     .where("code", "=", metaCode)
//     .andWhere("val", "=", metaVal)
//     .andWhere("file_id", "=", fId)
//   let rs = await cn.all(sql.toSql())

//   if (rs.length !== 1)
//     return undefined

//   return fetchFileInfo(fId)
// }

// export async function fetchFileById(fId: string): Promise<FileObject | undefined> {
//   let sql = buildSelect()
//     .select("bin_data")
//     .from("file")
//     .where("file_id", "=", fId)
//   let rs = await cn.all(sql.toSql())

//   if (rs.length === 0)
//     return undefined

//   let info = await fetchFileInfo(fId)

//   return {
//     info,
//     buffer: rs[0]["bin_data"]
//   }
// }



// export async function storeFile(f: MulterFile, metaCode: MainMetaCode, metaVal: string, uploaderId: string) {
//   let transaction = await cn.beginTransaction()

//   try {
//     let sql = "insert into file(bin_data) values($data)"
//     let ps = await cn.exec(sql, {
//       $data: f.buffer
//     })
//     let fId = ps.lastID.toString()

//     await addMetaStr(fId, metaCode, metaVal)
//     await addMetaStr(fId, "uploader", uploaderId)
//     await addMetaStr(fId, "mime", f.mimetype)
//     await addMetaStr(fId, "name", f.originalname)
//     await addMetaInt(fId, "weight", f.size)

//     await transaction.commit()
//     return true
//   } catch {
//     return false
//   } finally {
//     if (transaction.inTransaction)
//       await transaction.rollback()
//   }
// }


// export async function fetchRelatedFiles(metaCode: MainMetaCode, metaVal: string) {
//   let arr = await fetchRelatedFilesInfo(metaCode, metaVal)
//   let result = [] as FileObject[]

//   for (let info of arr) {
//     let sql = buildSelect()
//       .select("bin_data")
//       .from("file")
//       .where("file_id", "=", info.id)
//     let rs = await cn.all(sql.toSql())

//     if (rs.length !== 0) {
//       result.push({
//         info,
//         buffer: rs[0]["bin_data"]
//       })
//     }
//   }

//   return result
// }



// function checkAttachmentType(f: MulterFile): boolean {
//   return f.originalname.match(/\.(jpg|jpeg|png|gif|png|pdf)$/) !== null
// }

// function checkImageType(f: MulterFile): boolean {
//   return f.originalname.match(/\.(jpg|jpeg|png|gif|png)$/) !== null
// }

// --
// -- Utility functions
// --

// async function getAllMeta(fId: string): Promise<FileMeta[]> {
//   let metaInt = await getAllMetaInt(fId)
//   let metaStr = await getAllMetaStr(fId)

//   return ([] as FileMeta[]).concat(metaStr, metaInt)
// }

// async function getAllMetaInt(fId: string): Promise<FileMeta[]> {
//   let sql = buildSelect()
//     .select("file_id, code, val")
//     .from("meta_int")
//     .where("file_id", "=", fId)
//   let rs = await cn.all(sql.toSql())

//   return rs.map(row => toMetaInt(row))
// }

// async function getAllMetaStr(fId: string): Promise<FileMeta[]> {
//   let sql = buildSelect()
//     .select("file_id, code, val")
//     .from("meta_str")
//     .where("file_id", "=", fId)
//   let rs = await cn.all(sql.toSql())

//   return rs.map(row => toMetaStr(row))
// }

// async function addMetaInt(fId: string, code: string, val: number) {
//   let sql = "INSERT OR REPLACE INTO meta_int VALUES($fId, $code, $val)"
//   await cn.exec(sql, {
//     $fId: fId,
//     $code: code,
//     $val: val
//   })
// }

// async function addMetaStr(fId: string, code: string, val: string) {
//   let sql = "INSERT OR REPLACE INTO meta_str VALUES($fId, $code, $val)"
//   await cn.exec(sql, {
//     $fId: fId,
//     $code: code,
//     $val: val
//   })
// }

// async function removeFile(fId: string) {
//   let sql = "DELETE FROM file WHERE file_id = $fId"
//   await cn.exec(sql, {
//     $fId: fId
//   })
// }

// async function removeAllMetaStr(fId: string) {
//   let sql = "DELETE FROM meta_str WHERE file_id = $fId"
//   await cn.exec(sql, {
//     $fId: fId
//   })
// }

// async function removeAllMetaInt(fId: string) {
//   let sql = "DELETE FROM meta_int WHERE file_id = $fId"
//   await cn.exec(sql, {
//     $fId: fId
//   })
// }

// function toMetaInt(row): FileMeta {
//   return {
//     fileId: row["file_id"].toString(),
//     code: row["code"],
//     value: row["val"]
//   }
// }

// function toMetaStr(row): FileMeta {
//   return {
//     fileId: row["file_id"].toString(),
//     code: row["code"],
//     value: row["val"]
//   }
// }

