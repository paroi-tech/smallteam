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

export type SearchPick<T, OPT extends keyof T> = {
  [P in OPT]?: T[P]
} & {
  search?: string
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
  copyFields(fields, base, reqFieldNames)
  copyFields(fields, base, optFieldNames, true)
  return { type: base.type, variant, fields }
}

export function searchPickFragmentMeta(variant: TypeVariant, base: FragmentMeta, fieldNames: string[]): FragmentMeta {
  let fields = {
    search: {
      dataType: "string",
      optional: true
    } as FieldMeta
  }
  copyFields(fields, base, fieldNames, true)
  return { type: base.type, variant, fields }
}

function copyFields(to: {}, base: FragmentMeta, fieldNames: string[], forceOptional = false) {
  for (let name of fieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    if (to[name])
      throw new Error(`Conflict with field "${name}" in meta ${base.type}`)
    to[name] = forceOptional ? { ...base.fields[name], optional: true } : base.fields[name]
  }
}