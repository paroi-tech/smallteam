import Joi from "@hapi/joi"
import { ValidationError } from "./serverUtils"

export async function validate<T>(value: T, schema: Joi.ObjectSchema): Promise<T> {
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

export async function validateWithOptions<T>(value: T, schema: Joi.ObjectSchema, options: Joi.ValidationOptions) {
  let errorMsg: string | undefined
  let result = {} as any

  try {
    result = await schema.validateAsync(value, options)
  } catch (error) {
    errorMsg = `Validation failed: '${error.details.context.key}' did not pass validation.`
  }

  if (errorMsg)
    throw new ValidationError(errorMsg)

  return options.debug || options["warnings"] ? result : result.value
}

export function isHexString(str: string): boolean {
  let error = Joi.string().hex().validate(str).error
  return error !== undefined && error !== undefined
}
