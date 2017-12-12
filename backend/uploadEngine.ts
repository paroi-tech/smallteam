import { Request, Response } from "express"
import * as multer from "multer"
import { buildSelect, buildUpdate, buildDelete, buildInsert } from "./utils/sql92builder/Sql92Builder"
import { fileCn as cn } from "./utils/dbUtils"

// --
// -- Types declaration
// --

type File = Express.Multer.File
type ImageFilterCb = (err: Error | null, acceptFile: boolean) => void
type FileFilter = (req: Request, file: File, cb: ImageFilterCb) => void

type FileMeta = {
  fileId: string
  code: string
  value: number | string
}

export type MainMetaCode = "contributor_id" | "task_id"

export type FileInfo = {
  id: string
  name: string
  mimeType: string
  weight: number
}

export type FileFragment = {
  info: FileInfo
  buffer: any
}

// --
// -- Public functions
// --

export function checkAvatarFileType(f: File): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif)$/) !== null
}

export function checkAttachmentType(f: File): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif|png)$/) !== null
}

export async function insertFile(f: File, metaCode: MainMetaCode, metaVal: string) {
  if (metaCode === "contributor_id")
    return await insertAvatar(f, metaVal)
  else if ("task_id")
    return await insertTaskAttachment(f, metaVal)
  else
    throw new Error(`Unknown MetaCode: ${metaCode}`)
}

export async function fetchRelatedFilesInfo(metaCode: MainMetaCode, metaVal: string): Promise<FileInfo[]> {
  let arr = [] as FileInfo[]
  let sql = buildSelect()
    .select("file_id")
    .from("meta_int")
    .where("code", "=", metaCode)
    .andWhere("val", "=", metaVal)
  let rs = await cn.all(sql.toSql())

  for (let row of rs) {
    let fileId = row["file_id"].toString()
    let info: any = {
      fileId
    }

    for (let meta of await getAllMeta(fileId)) {
      if (meta.code === "name")
        info.name = meta.value as string
      else if (meta.code === "weight")
        info.weight = meta.value as number
      else if (meta.code === "mime")
        info.mimeType = meta.value as string
    }

    arr.push(info)
  }

  return arr
}

export async function fetchRelatedFiles(metaCode: MainMetaCode, metaVal: string) {
  let arr = await fetchRelatedFilesInfo(metaCode, metaVal)
  let result = [] as FileFragment[]

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

export async function fetchFileById(fileId: string): Promise<FileFragment | undefined> {
  let sql = buildSelect()
    .select("bin_data")
    .from("file")
    .where("file_id", "=", fileId)
  let rs = await cn.all(sql.toSql())

  if (rs.length === 0)
    return undefined

  let info: any = {
    fileId
  }

  for (let meta of await getAllMeta(fileId)) {
    if (meta.code === "name")
      info.name = meta.value as string
    else if (meta.code === "weight")
      info.weight = meta.value as number
    else if (meta.code === "mime")
      info.mimeType = meta.value as string
  }

  return {
    info,
    buffer: rs[0]["bin_data"]
  }
}

// --
// -- Avatar
// --

async function insertAvatar(f: File, contributorId: string) {
  let result = {
    done: false
  }

  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_int")
    .where("code", "=", "contributor_id")
    .andWhere("val", "=", contributorId)

  let transaction = await cn.beginTransaction()

  try {
    let rs = await cn.all(sql.toSql())

    if (rs.length === 0)
      await createAvatar(f, contributorId)
    else
      await updateAvatar(f, rs[0]["file_id"])
    await transaction.commit()
    result.done = true
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
  }

  return result
}

async function createAvatar(f: File, contributorId: string) {
  let sql = "INSERT INTO file(bin_data) VALUES($data)"
  let ps = await cn.run(sql, {
    $data: f.buffer
  })
  let fId = ps.lastID.toString()

  await addMetaInt(fId, "contributor_id", parseInt(contributorId))
  await addMetaInt(fId, "weight", f.size)
  await addMetaStr(fId, "mime", f.mimetype)
  await addMetaStr(fId, "name", f.originalname)
}

async function updateAvatar(f: File, fileId: string) {
  let sql = "UPDATE file SET bin_data=$data WHERE file_id=$fId"

  await cn.run(sql, {
    $fId: fileId,
    $data: f.buffer
  })
  await addMetaInt(fileId, "weight", f.size)
  await addMetaStr(fileId, "mime", f.mimetype)
  await addMetaStr(fileId, "name", f.originalname)
}

// --
// -- Task attachments
// --

async function insertTaskAttachment(f: File, taskId: string) {

}

// --
// -- Utility functions
// --

async function getAllMeta(fileId: string): Promise<FileMeta[]> {
  let arr = [] as FileMeta[]

  arr = arr.concat(await getAllMetaInt(fileId))
  arr = arr.concat(await getAllMetaStr(fileId))

  return arr
}

async function getAllMetaInt(fileId: string): Promise<FileMeta[]> {
  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_int")
    .where("file_id", "=", fileId)
  let rs = await cn.all(sql.toSql())

  return rs.map(row => toMetaInt(row))
}

async function getAllMetaStr(fileId: string): Promise<FileMeta[]> {
  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_str")
    .where("file_id", "=", fileId)
  let rs = await cn.all(sql.toSql())

  return rs.map(row => toMetaStr(row))
}

async function addMetaInt(fileId: string, code: string, val: number) {
  let sql = "INSERT OR REPLACE INTO meta_int VALUES($fId, $code, $val)"

  await cn.run(sql, {
    $fId: fileId,
    $code: code,
    $val: val
  })
}

async function addMetaStr(fileId: string, code: string, val: string) {
  let sql = "INSERT OR REPLACE INTO meta_str VALUES($fId, $code, $val)"

  await cn.run(sql, {
    $fId: fileId,
    $code: code,
    $val: val
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
