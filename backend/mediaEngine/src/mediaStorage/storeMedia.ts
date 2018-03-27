import * as sql from "sql-bricks"
import * as sharp from "sharp"
import { MediaStorageContext } from "./internal-definitions"
import { StoreMediaParameters, NewMedia, MediaDef, VariantDef, MulterFile, ImageMeta } from "./exported-definitions"
import { findMediaByExternalRef, fileBaseName } from "./common"
import { ImageVariantConfiguration } from ".";

const IMG_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
const SHARP_OUTPUT_TYPES = ["image/png", "image/jpeg", "image/webp"]

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

    let imgMeta = await getImageMeta(params.file)

    await insertVariant(cx, {
      mediaId,
      code: "orig",
      weightB: params.file.size,
      imType: params.file.mimetype,
      img: imgMeta,
      binData: params.file.buffer
    })

    if (imgMeta && params.externalRef && cx.imagesConf[params.externalRef.type]) {
      for (let variantConf of cx.imagesConf[params.externalRef.type])
        await resizeAndInsertVariant(cx, mediaId, variantConf, params.file, imgMeta)
    }

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
  )).getInsertedIdString()
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
    sql.deleteFrom("variant").where("media_id", mediaId)
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
      .where("media_id", mediaId)
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
  )).getInsertedIdString()
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
  return IMG_TYPES.includes(imType)
}

async function getImageMeta(f: MulterFile): Promise<ImageMeta | undefined> {
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
    console.log(`Cannot read the image meta (type ${f.mimetype}): ${err.message}`)
  }
}

async function resizeAndInsertVariant(cx: MediaStorageContext, mediaId: string, targetConf: ImageVariantConfiguration, f: MulterFile, fImgMeta: ImageMeta) {
  let resize: SharpResize | undefined
  let binData: Buffer
  let imgMeta: ImageMeta
  let imType = outputImageMimeType(f.mimetype, targetConf.imType)
  try {
    if (targetConf.embed)
      resize = await resizeEmbedImage(targetConf, f, fImgMeta)
    else
      resize = await resizeCropImage(targetConf, f, fImgMeta)
    if (!resize)
      return
    binData = await resize.sharpInst.toBuffer()
  } catch (err) {
    console.log(`Cannot resize (${targetConf.embed ? "embed" : "crop"}) the image (type ${f.mimetype}): ${err.message}`)
    return
  }

  await insertVariant(cx, {
    mediaId,
    code: targetConf.code,
    weightB: binData.byteLength,
    imType: imType,
    img: resize.imgMeta,
    binData
  })
}

interface SharpResize {
  sharpInst: sharp.SharpInstance
  imgMeta: ImageMeta
}

function resizeCropImage(targetConf: ImageVariantConfiguration, f: MulterFile, fImgMeta: ImageMeta): SharpResize {
  if (targetConf.width !== undefined && targetConf.height !== undefined) {
    if (targetConf.width === fImgMeta.width && targetConf.height === fImgMeta.height)
      return
    if (targetConf.width > fImgMeta.width || targetConf.height > fImgMeta.height)
      return
    return {

    }


  }







    let metadata = await sharp(f.buffer).metadata()
}

function outputImageMimeType(origMimeType: string | undefined, queriedImType?: string) {
  if (queriedImType && SHARP_OUTPUT_TYPES.includes(queriedImType))
    return queriedImType
  if (origMimeType && SHARP_OUTPUT_TYPES.includes(origMimeType))
    return origMimeType
  return "image/webp"
}