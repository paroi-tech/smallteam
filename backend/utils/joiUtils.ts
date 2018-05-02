import Joi = require("joi")

export class DataValidationError extends Error {
  constructor(...params) {
    super(...params)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, DataValidationError)
  }
}

export default async function validate<T>(value: T, schema: Joi.SchemaLike): Promise<T> {
  try {
    let result = await Joi.validate(value, schema)
    return result
  } catch (error) {
    throw new DataValidationError(`Invalid data received: '${error.details[0].context.key}' did not pass validation.`)
  }
}
