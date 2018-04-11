import { select } from "sql-bricks"
import { MediaOrVariantId, MediaRef } from "./exported-definitions"
import { MediaStorageContext } from "./internal-definitions"

export async function findMediaRef(cx: MediaStorageContext, id: MediaOrVariantId): Promise<MediaRef | undefined> {
  let sb = select("m.owner_id, r.external_type, r.external_id")
    .from("media m")
    .leftJoin("media_ref r").using("media_id")
  if ("mediaId" in id)
    sb = sb.where("m.media_id", id.mediaId)
  else {
    sb = sb.innerJoin("variant v").using("media_id")
      .where("v.variant_id", id.variantId)
  }
  let row = await cx.cn.singleRowSqlBricks(sb)

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
