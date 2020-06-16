import Joi from "@hapi/joi"

export default async function validate<T>(value: T, schema: Joi.SchemaLike, options?: Joi.ValidationOptions): Promise<T> {
  return value // FIXME Implement that with Joi
  // try {
  //   let result = await Joi.validate(value, schema, options || {})
  //   return result
  // } catch (error) {
  //   let key = error.details?.[0]?.context?.key
  //   throw new ValidationError(`Invalid data received: '${key}' did not pass validation.\n${value}`)
  // }
}

// export function isHexString(str: string) {
//   return Joi.validate(str, Joi.string().hex()).error === null
// }
