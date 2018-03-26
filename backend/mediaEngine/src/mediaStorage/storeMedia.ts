import * as sql from "sql-bricks"
import * as sharp from "sharp"
import { MediaStorageContext } from "./internal-definitions"
import { StoreMediaParameters, NewMedia, MediaDef, VariantDef, MulterFile, ImageDef } from "./exported-definitions"
import { findMediaByExternalRef, fileBaseName } from "./common"

export async function storeMedia(cx: MediaStorageContext, params: StoreMediaParameters): Promise<NewMedia> {
  let transCn = await cx.cn.beginTransaction()

  try {
    let mediaId: string | undefined
    if (params.overwrite && params.externalRef) {
      let found = await findMediaByExternalRef(cx, params.externalRef)
      if (found.length >= 1)
        mediaId = found[0]
    }

    let overwritten = mediaId !== undefined

    if (mediaId === undefined) {
      mediaId = await insertMedia(cx, {
        baseName: fileBaseName(params.file.originalname),
        originalName: params.file.originalname,
        ownerId: params.ownerId,
        externalRef: params.externalRef
      })
    } else {
      await clearMediaVariants(cx, mediaId)
      await updateMedia(cx, {
        baseName: fileBaseName(params.file.originalname),
        originalName: params.file.originalname,
        ownerId: params.ownerId
      }, mediaId)
    }

    await insertVariant(cx, {
      mediaId,
      code: "orig",
      weightB: params.file.size,
      imType: params.file.mimetype,
      img: await getImageMeta(params.file),
      binData: params.file.buffer
    })

    await transCn.commit()
    return { mediaId, overwritten }
  } finally {
    if (transCn.inTransaction)
      await transCn.rollback()
  }
}

type InsertMedia = Pick<MediaDef, "baseName" | "originalName" | "ownerId" | "externalRef">

async function insertMedia(cx: MediaStorageContext, media: InsertMedia): Promise<string> {
  let mediaId = (await cx.cn.execSqlBricks(
    sql.insertInto("media").values({
      "base_name": media.baseName,
      "orig_name": media.originalName,
      "owner_id": media.ownerId
    })
  )).getInsertedId()
  if (media.externalRef) {
    await cx.cn.execSqlBricks(
      sql.insertInto("media_ref").values({
        "media_id": mediaId,
        "external_type": media.externalRef.type,
        "external_id": media.externalRef.id
      })
    )
  }
  return mediaId
}

async function clearMediaVariants(cx: MediaStorageContext, mediaId: string) {
  await cx.cn.execSqlBricks(
    sql.deleteFrom("variant").where({
      "media_id": mediaId
    })
  )
}

type UpdateMedia = Pick<MediaDef, "baseName" | "originalName" | "ownerId">

async function updateMedia(cx: MediaStorageContext, media: UpdateMedia, mediaId: string) {
  await cx.cn.execSqlBricks(
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

async function insertVariant(cx: MediaStorageContext, variant: InsertVariant): Promise<string> {
  let variantId = (await cx.cn.execSqlBricks(
    sql.insertInto("variant").values({
      "media_id": variant.mediaId,
      "weight_b": variant.weightB,
      "im_type": variant.imType,
      "code": variant.code,
      "bin_data": variant.binData
    })
  )).getInsertedId()
  if (variant.img) {
    await cx.cn.execSqlBricks(
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
