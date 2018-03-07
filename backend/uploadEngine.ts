import { Request, Response } from "express"
import * as multer from "multer"
import { buildSelect, buildUpdate, buildDelete, buildInsert } from "./utils/sql92builder/Sql92Builder"
import { fileCn as cn } from "./utils/dbUtils"

// --
// -- Types - Extracted from the database
// --

interface MetaValues {
  [key: string]: string | number
}

interface ExternalRef {
  type: string
  id: string
}

interface Media {
  id: string
  ts: string
  baseName?: string
  originalName?: string
  externalRef?: ExternalRef
}

interface File {
  id: string
  binData: Buffer
  weightB: number
  imType: string
  variantName?: string
  media: Media
  meta: MetaValues
}

// --
// -- Types - Used when downloading a file
// --

type DownloadedMedia = Pick<Media, "id" | "ts">

type DownloadedFile = Pick<File, "id" | "binData" | "weightB" | "imType"> & {
  media: DownloadedMedia
}

// --
// -- Types - Used when querying
// --

type MediaInfo = Pick<Media, "id" | "ts" | "baseName" | "originalName">

type FileInfo = Pick<File, "id" | "weightB" | "imType" | "variantName"> & {
  media: MediaInfo
  url: string
  imageMeta?: ImageMeta
}

interface ImageMeta {
  width: number
  height: number
}

type QueryResult = FileInfo[]

interface Query {
  externalRef: ExternalRef
  variantName: string | null
}

// URL: /get-file/{file.id}/{media.baseName}-{file.variantName}.{extension}




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

export type MulterFile = Express.Multer.File

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

// --
// -- Public functions
// --

export function checkAttachmentType(f: MulterFile): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif|png|pdf)$/) !== null
}

export function checkImageType(f: MulterFile): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif|png)$/) !== null
}

export async function storeMedia(f: MulterFile, extType: string, extId: string, ownerId: string, baseName?: string) {
  let result = {
    done: false
  }

}

export async function storeFile(f: MulterFile, metaCode: MainMetaCode, metaVal: string, uploaderId: string) {
  let result = {
    done: false
  }
  let transaction = await cn.beginTransaction()

  try {
    let sql = "INSERT INTO file(bin_data) VALUES($data)"
    let ps = await cn.run(sql, {
      $data: f.buffer
    })
    let fId = ps.lastID.toString()

    await addMetaStr(fId, metaCode, metaVal)
    await addMetaStr(fId, "uploader", uploaderId)
    await addMetaStr(fId, "mime", f.mimetype)
    await addMetaStr(fId, "name", f.originalname)
    await addMetaInt(fId, "weight", f.size)

    await transaction.commit()
    result.done = true
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
  }

  return result
}

export async function updateFile(f: MulterFile, fId: string, uploaderId: string) {
  let result = {
    done: false
  }
  let transaction = await cn.beginTransaction()

  try {
    let sql = "UPDATE file SET bin_data=$data WHERE file_id=$fId"

    await cn.run(sql, {
      $fId: fId,
      $data: f.buffer
    })
    await addMetaInt(fId, "weight", f.size)
    await addMetaStr(fId, "mime", f.mimetype)
    await addMetaStr(fId, "name", f.originalname)
    await addMetaStr(fId, "uploader", uploaderId)

    await transaction.commit()
    result.done = true
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
  }

  return result
}

export async function deleteFile(fId: string) {
  let result = {
    done: false
  }
  let transaction = await cn.beginTransaction()

  try {
    await removeAllMetaInt(fId)
    await removeAllMetaStr(fId)
    await removeFile(fId)

    await transaction.commit()
    result.done = true
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
  }

  return result
}

export async function fetchRelatedFilesInfo(metaCode: MainMetaCode, metaVal: string): Promise<__FileInfo[]> {
  let arr = [] as __FileInfo[]
  let sql = buildSelect()
    .select("file_id")
    .from("meta_str")
    .where("code", "=", metaCode)
    .andWhere("val", "=", metaVal)
  let rs = await cn.all(sql.toSql())

  for (let row of rs) {
    let fId = row["file_id"].toString()
    let info = await fetchFileInfo(fId)

    arr.push(info)
  }

  return arr
}

export async function fetchFileInfo(fId: string) {
  let sql = buildSelect()
    .select("file_id")
    .from("file")
    .where("file_id", "=", fId)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 0)
    return undefined

  let info: any = {
    id: fId
  }

  for (let meta of await getAllMeta(fId)) {
    if (meta.code === "name")
      info.name = meta.value as string
    else if (meta.code === "weight")
      info.weight = meta.value as number
    else if (meta.code === "mime")
      info.mimeType = meta.value as string
    else if (meta.code == "uploader")
      info.uploaderId = meta.value as string
  }

  return info
}

export async function fetchSingleRelatedFileInfo(metaCode: MainMetaCode, metaVal: string, fId: string): Promise<__FileInfo | undefined> {
  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_str")
    .where("code", "=", metaCode)
    .andWhere("val", "=", metaVal)
    .andWhere("file_id", "=", fId)
  let rs = await cn.all(sql.toSql())

  if (rs.length !== 1)
    return undefined

  return fetchFileInfo(fId)
}

export async function fetchRelatedFiles(metaCode: MainMetaCode, metaVal: string) {
  let arr = await fetchRelatedFilesInfo(metaCode, metaVal)
  let result = [] as FileObject[]

  for (let info of arr) {
    let sql = buildSelect()
      .select("bin_data")
      .from("file")
      .where("file_id", "=", info.id)
    let rs = await cn.all(sql.toSql())

    if (rs.length !== 0) {
      result.push({
        info,
        buffer: rs[0]["bin_data"]
      })
    }
  }

  return result
}

export async function fetchFileById(fId: string): Promise<FileObject | undefined> {
  let sql = buildSelect()
    .select("bin_data")
    .from("file")
    .where("file_id", "=", fId)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 0)
    return undefined

  let info = await fetchFileInfo(fId)

  return {
    info,
    buffer: rs[0]["bin_data"]
  }
}

// --
// -- Utility functions
// --

async function getAllMeta(fId: string): Promise<FileMeta[]> {
  let metaInt = await getAllMetaInt(fId)
  let metaStr = await getAllMetaStr(fId)

  return ([] as FileMeta[]).concat(metaStr, metaInt)
}

async function getAllMetaInt(fId: string): Promise<FileMeta[]> {
  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_int")
    .where("file_id", "=", fId)
  let rs = await cn.all(sql.toSql())

  return rs.map(row => toMetaInt(row))
}

async function getAllMetaStr(fId: string): Promise<FileMeta[]> {
  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_str")
    .where("file_id", "=", fId)
  let rs = await cn.all(sql.toSql())

  return rs.map(row => toMetaStr(row))
}

async function addMetaInt(fId: string, code: string, val: number) {
  let sql = "INSERT OR REPLACE INTO meta_int VALUES($fId, $code, $val)"
  await cn.run(sql, {
    $fId: fId,
    $code: code,
    $val: val
  })
}

async function addMetaStr(fId: string, code: string, val: string) {
  let sql = "INSERT OR REPLACE INTO meta_str VALUES($fId, $code, $val)"
  await cn.run(sql, {
    $fId: fId,
    $code: code,
    $val: val
  })
}

async function removeFile(fId: string) {
  let sql = "DELETE FROM file WHERE file_id = $fId"
  await cn.run(sql, {
    $fId: fId
  })
}

async function removeAllMetaStr(fId: string) {
  let sql = "DELETE FROM meta_str WHERE file_id = $fId"
  await cn.run(sql, {
    $fId: fId
  })
}

async function removeAllMetaInt(fId: string) {
  let sql = "DELETE FROM meta_int WHERE file_id = $fId"
  await cn.run(sql, {
    $fId: fId
  })
}

function toMetaInt(row): FileMeta {
  return {
    fileId: row["file_id"].toString(),
    code: row["code"],
    value: row["val"]
  }
}

function toMetaStr(row): FileMeta {
  return {
    fileId: row["file_id"].toString(),
    code: row["code"],
    value: row["val"]
  }
}
