import { FieldMeta, FragmentMeta, TypeVariant } from "./index"

export type PickUpdate<T, REQ extends keyof T, OPT extends keyof T> = {
  [Q in REQ]: T[Q]
} & {
  [P in OPT]?: T[P]
}

/**
 * Each filter can be of type: `value` or [op, value]. Example: [">=", value]
 */
export type AsFilter<T> = {
  readonly [P in keyof T]?: T[P] | [string, T[P]]
}

/**
 * Each filter can be of type: `value` or [op, value]. Example: [">=", value]
 */
export type SearchPick<T, OPT extends keyof T> = {
  [P in OPT]?: T[P] // | [string, T[P]] // TODO: Implement in SQL92Builder
} & {
  search?: string // | [string, string] // TODO: Implement in SQL92Builder
}

export function pickFragmentMeta(variant: TypeVariant, base: FragmentMeta, fieldNames: string[]): FragmentMeta {
  const fields = {}
  for (const name of fieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    fields[name] = base.fields[name]
  }
  return { type: base.type, variant, fields, orderFieldName: base.orderFieldName }
}

export function pickUpdateFragmentMeta(variant: "update", base: FragmentMeta, reqFieldNames: string[], optFieldNames: string[]): FragmentMeta {
  const fields = {}
  copyFields(fields, base, reqFieldNames)
  copyFields(fields, base, optFieldNames, true)
  return { type: base.type, variant, fields, orderFieldName: base.orderFieldName }
}

export function searchPickFragmentMeta(variant: "fetch", base: FragmentMeta, fieldNames: string[], withSearch = true): FragmentMeta {
  const fields: any = {}
  if (withSearch) {
    fields.search = {
      dataType: "string",
      optional: true
    } as FieldMeta
  }
  copyFields(fields, base, fieldNames, true)
  return { type: base.type, variant, fields, orderFieldName: base.orderFieldName }
}

function copyFields(to: object, base: FragmentMeta, fieldNames: string[], forceOptional = false) {
  for (const name of fieldNames) {
    if (!base.fields[name])
      throw new Error(`Unknown field "${name}" in meta ${base.type}`)
    if (to[name])
      throw new Error(`Conflict with field "${name}" in meta ${base.type}`)
    to[name] = forceOptional ? { ...base.fields[name], optional: true } : base.fields[name]
  }
}