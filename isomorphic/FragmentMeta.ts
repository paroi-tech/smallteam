export type TypeVariant = "New" | "Upd"

export interface FragmentMeta {
  type: string
  variant?: TypeVariant
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
  values?: string[] | boolean[] | number[]
}

export function pickFragmentMeta(variant: TypeVariant, base: FragmentMeta, fieldNames: string[]): FragmentMeta {
  let fields = {}
  for (let name of fieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    fields[name] = base.fields[name]
  }
  return { type: base.type, variant, fields }
}