import * as sql from "sql-bricks"
import { MediaOrVariantId, MediaFilter } from "./exported-definitions"
import { MediaStorageContext } from "./internal-definitions"
import { findMediaByExternalRef } from "./common"

export async function removeMedia(cx: MediaStorageContext, id: MediaOrVariantId): Promise<boolean> {
  let mediaId: string
  if ("mediaId" in id)
    mediaId = id.mediaId
  else {
    let foundMediaId = await cx.cn.singleValueSqlBricks(
      sql.select("media_id")
        .from("variant")
        .where("variant_id", id.variantId)
    )
    if (foundMediaId === undefined)
      return false
    mediaId = foundMediaId.toString()
  }

  await cx.cn.execSqlBricks(
    sql.deleteFrom("variant").where("media_id", mediaId)
  )
  let result = await cx.cn.execSqlBricks(
    sql.deleteFrom("media").where("media_id", mediaId)
  )
  return result.affectedRows === 1
}

/**
 * @returns (async) The number of deleted medias
 */
export async function removeMedias(cx: MediaStorageContext, filter: MediaFilter): Promise<number> {
  if (!filter.externalRef)
    return 0
  let found = await findMediaByExternalRef(cx, filter.externalRef)
  for (let mediaId of found)
    await removeMedia(cx, { mediaId })
  return found.length
}
