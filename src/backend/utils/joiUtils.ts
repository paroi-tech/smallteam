import Joi = require("joi")
import { ValidationError } from "./serverUtils"


export default async function validate<T>(value: T, schema: Joi.SchemaLike): Promise<T> {
  try {
    let result = await Joi.validate(value, schema)
    return result
  } catch (error) {
    let key = error.details[0].context.key
    throw new ValidationError(`Invalid data received: '${key}' did not pass validation.`)
  }
}

export function isHexString(str: string) {
  return Joi.validate(str, Joi.string().hex()).error === null
}
