export interface EntityMeta {
  type: string
  fields: {
    [name: string]: FieldMeta
  }
}

export interface FieldMeta {
  dataType: "string" | "boolean" | "number"
  id?: boolean
  update?: boolean
  optional?: boolean
  allowEmpty?: boolean
}

export function pickEntityMeta(type: string, base: EntityMeta, fieldNames: string[]): EntityMeta {
  let fields = {}
  for (let name of fieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    fields[name] = base.fields[name]
  }
  return { type, fields }
}