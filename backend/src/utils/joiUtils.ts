import Joi from "@hapi/joi"
import { ValidationError } from "./serverUtils"

export default async function validate<T>(value: T, schema: Joi.ObjectSchema): Promise<T> {
  let errorMsg: string | undefined
  let result: T | undefined

  try {
    result = await schema.validateAsync(value)
  } catch (error) {
    errorMsg = `Validation failed: '${error.details.context.key}' did not pass validation.`
  }

  if (errorMsg)
    throw new ValidationError(errorMsg)

  return result!
}

export function isHexString(str: string): boolean {
  return Joi.string().hex().validate(str).error !== null
}
