import { Request, Response } from "express"
import * as multer from "multer"
import { buildSelect, buildUpdate, buildDelete, buildInsert } from "./utils/sql92builder/Sql92Builder"
import { fileCn as cn } from "./utils/dbUtils"

// --
// -- Types declaration
// --

type ImageFilterCb = (err: Error | null, acceptFile: boolean) => void
type FileFilter = (req: Request, file: File, cb: ImageFilterCb) => void

type FileMeta = {
  fileId: string
  code: string
  value: number | string
}

export type MainMetaCode = "contributorAvatar" | "task"

export type File = Express.Multer.File

export type FileInfo = {
  id: string
  name: string
  mimeType: string
  weight: number
  uploaderId: string
}

export type FileObject = {
  info: FileInfo
  buffer: any
}

// --
// -- Public functions
// --

export function checkAttachmentType(f: File): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif|png|pdf)$/) !== null
}

export function checkImageType(f: File): boolean {
  return f.originalname.match(/\.(jpg|jpeg|png|gif|png)$/) !== null
}

export async function store(f: File, metaCode: MainMetaCode, metaVal: string, uploaderId: string) {
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

export async function update(f: File, fId: string, uploaderId: string) {
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

export async function fetchRelatedFilesInfo(metaCode: MainMetaCode, metaVal: string): Promise<FileInfo[]> {
  let arr = [] as FileInfo[]
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
