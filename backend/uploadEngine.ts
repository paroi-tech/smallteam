import { Request, Response } from "express"
import * as multer from "multer"
import { buildSelect, buildUpdate, buildDelete, buildInsert } from "./utils/sql92builder/Sql92Builder"
import { fileCn } from "./utils/dbUtils"

type File = Express.Multer.File
type ImageFilterCb = (err: Error | null, acceptFile: boolean) => void
type FileFilter = (req: Request, file: File, cb: ImageFilterCb) => void

export function checkAvatarFileType(file: File): boolean {
  return file.originalname.match(/\.(jpg|jpeg|png|gif)$/) !== null
}

export async function changeAvatar(contributorId: string, f: File) {
  let result = {
    done: false
  }

  let sql = buildSelect()
    .select("file_id, code, val")
    .from("meta_int")
    .where("code", "=", "contributor_id")
    .andWhere("val", "=", contributorId)

  let transaction = await fileCn.beginTransaction()

  try {
    let rs = await fileCn.all(sql.toSql())

    if (rs.length === 0)
      await createAvatar(contributorId, f)
    else
      await updateAvatar(rs[0]["file_id"], f)

    await transaction.commit()
    result.done = true
  } catch (err) {
    console.log("Error while updating avatar", err)
  } finally {
    if (transaction.inTransaction)
      await transaction.rollback()
  }

  return result
}

async function createAvatar(contributorId: string, f: File) {
  let sql = "INSERT INTO file(bin_data) VALUES($data)"
  let ps = await fileCn.run(sql, {
    $data: f.buffer
  })
  let fId = ps.lastID

  await addMetaInt(fId, "contributor_id", parseInt(contributorId))
  await addMetaInt(fId, "weight", f.size)
  await addMetaStr(fId, "mime", f.mimetype)
  await addMetaStr(fId, "name", f.originalname)
}

async function updateAvatar(fId: number, f: File) {
  let sql = "UPDATE file SET bin_data=$data WHERE file_id=$fId"

  await fileCn.run(sql, {
    $fId: fId,
    $data: f.buffer
  })
  await addMetaInt(fId, "weight", f.size)
  await addMetaStr(fId, "mime", f.mimetype)
  await addMetaStr(fId, "name", f.originalname)
}

async function addMetaInt(fId: number, code: string, val: number) {
  let sql = "INSERT OR REPLACE INTO meta_int VALUES($fId, $code, $val)"

  await fileCn.run(sql, {
    $fId: fId.toString(),
    $code: code,
    $val: val
  })
}

async function addMetaStr(fId, code: string, val: string) {
  let sql = "INSERT OR REPLACE INTO meta_str VALUES($fId, $code, $val)"

  await fileCn.run(sql, {
    $fId: fId.toString(),
    $code: code,
    $val: val
  })
}
