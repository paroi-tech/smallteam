import { EntityMeta, FieldMeta } from "./entities/EntityMeta"

export function validateDataArray<T>(meta: EntityMeta, data: any[]): T[] {
  for (let item of data)
    validateData<T>(meta, item)
  return data
}

export function validateData<T>(meta: EntityMeta, data: any): T {
  for (let fieldName in meta.fields) {
    if (!meta.fields.hasOwnProperty(fieldName))
      continue
    let res = isValidValue(meta.fields[fieldName], data[fieldName])
    if (res !== true)
      throw new Error(`Type ${meta.type}, field "${fieldName}": ${res}`)
  }
  let remaining: string[] = []
  for (let fieldName in data) {
    if (!data.hasOwnProperty(fieldName))
      continue
    if (!meta.fields[fieldName])
      remaining.push(fieldName)
  }
  if (remaining.length > 0)
    throw new Error(`Type ${meta.type}, unknown fields: ${remaining.join(", ")}`)
  return data
}

export function isValidValue(field: FieldMeta, value: any): true | string {
  if (value === undefined || value === null)
    return field.optional ? true : `required value`
  if (typeof value !== field.dataType)
    return `invalid type "${typeof value}", required: "${field.dataType}"`
  if (typeof value === "string" && !field.allowEmpty && value.trim() === "")
    return `cannot be empty`
  return true
}
