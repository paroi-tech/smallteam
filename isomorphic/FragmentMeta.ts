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
  maxLen?: number
  values?: string[] | boolean[] | number[]
}

export type UpdPick<T, REQ extends keyof T, OPT extends keyof T> = {
  [Q in REQ]: T[Q]
} & {
  [P in OPT]?: T[P]
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

export function updPickFragmentMeta(variant: TypeVariant, base: FragmentMeta, reqFieldNames: string[], optFieldNames: string[]): FragmentMeta {
  let fields = {}
  for (let name of reqFieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    fields[name] = base.fields[name]
  }
  for (let name of optFieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    fields[name] = {
      ...base.fields[name],
      optional: true
    }
  }
  return { type: base.type, variant, fields }
}
