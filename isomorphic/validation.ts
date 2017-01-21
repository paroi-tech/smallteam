
export interface Meta {
  type: string
  fields: {
    [name: string]: FieldMeta
  }
}

export interface FieldMeta {
  dataType: "string" | "boolean" | "number"
  nullable?: boolean
  emptyable?: boolean
  id?: boolean
}

export function validateDataArray<T>(meta: Meta, data: any[]): T[] {
  for (let item of data)
    validateData<T>(meta, item)
  return data
}

export function validateData<T>(meta: Meta, data: any): T {
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
    return field.nullable ? true : `required value`
  if (typeof value !== field.dataType)
    return `invalid type "${typeof value}", required: "${field.dataType}"`
  if (typeof value === "string" && !field.emptyable && value.trim() === "")
    return `cannot be empty`
  return true
}
