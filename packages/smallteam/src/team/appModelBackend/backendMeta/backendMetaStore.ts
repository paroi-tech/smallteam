import { Type } from "@local-packages/shared/dist/Cargo"
import { FieldMeta, FragmentMeta } from "@local-packages/shared/dist/meta/index"

// --
// -- Types
// --

export type ColumnType = "timestamp" | "datetime" | "date" | "time" | "bigint" | "integer" | "smallint" | "bit" | "string"

export interface DbColumnMeta {
  column: string
  columnType: ColumnType
}

export interface BackendFragmentMeta {
  table: string
  columns: {
    [fieldName: string]: DbColumnMeta
  }
  fieldNames: {
    [columnName: string]: string
  }
}

// --
// -- Properties
// --

const backendMetaMap = new Map<string, BackendFragmentMeta>()

// --
// -- Fill the map
// --

export function addBackendFragmentMeta(fragMeta: FragmentMeta,
  columnProps: { [fieldName: string]: Partial<DbColumnMeta> }, tableName?: string) {
  const columns = {}
  const fieldNames = {}
  for (const fieldName of Object.keys(columnProps)) {
    const fieldMeta = fragMeta.fields[fieldName]
    if (!fieldMeta)
      throw new Error(`Unknown field "${fieldName}" in type "${fragMeta.type}"`)
    const colProps = columnProps[fieldName]
    const colName = colProps ? (colProps.column || camelToUnderscoredName(fieldName)) : camelToUnderscoredName(fieldName)
    columns[fieldName] = {
      column: colName,
      columnType: toColumnType(fieldMeta, colProps)
    }
    fieldNames[colName] = fieldName
  }
  backendMetaMap.set(fragMeta.type, {
    table: tableName || fragMeta.type,
    columns,
    fieldNames
  })
}

function toColumnType(fieldMeta: FieldMeta, colProps: Partial<DbColumnMeta>): ColumnType {
  if (colProps.columnType)
    return colProps.columnType
  switch (fieldMeta.dataType) {
    case "string":
      return "string"
    case "boolean":
      return "bit"
    case "number":
      return "bigint"
    default:
      throw new Error(`Type "${fieldMeta.dataType}" cannot be converted to a SQL type`)
  }
}

/**
 * Thanks to https://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
 */
function camelToUnderscoredName(camelName: string): string {
  return camelName.replace(/([A-Z])/g, function (chr) { return "_" + chr.toLowerCase() })
}

// --
// -- Getters
// --

export function getFieldName(type: Type | string, columnName: string): string {
  const bm = backendMetaMap.get(type)
  if (!bm)
    throw new Error(`Unknown type: ${type}`)
  const fieldName = bm.fieldNames[columnName]
  if (fieldName === undefined)
    throw new Error(`Unknown column "${columnName}" in type: ${type}`)
  return fieldName
}

export function getDbColumnMeta(type: Type | string, fieldName: string): DbColumnMeta | null {
  const bm = backendMetaMap.get(type)
  if (!bm)
    throw new Error(`Unknown type: ${type}`)
  return bm.columns[fieldName] || null
}

// --
// -- toSqlValues
// --

export function toSqlValues(frag, meta: FragmentMeta, restrict?: "exceptId" | "onlyId"): any | null {
  const result = {}
  let empty = true
  for (const fieldName in meta.fields) {
    if (!meta.fields.hasOwnProperty(fieldName))
      continue
    const fieldMeta = meta.fields[fieldName]
    if ((restrict === "exceptId" && fieldMeta.id) || (restrict === "onlyId" && !fieldMeta.id))
      continue
    const colMeta = getDbColumnMeta(meta.type, fieldName)
    const val = frag[fieldName]
    if (colMeta && val !== undefined) {
      result[colMeta.column] = toSqlValue(val, colMeta)
      empty = false
    }
  }
  if (empty) {
    if (restrict === "onlyId")
      throw new Error(`Missing ID in type "${meta.type}"`)
    return null
  }
  return result
}

function toSqlValue(val, colMeta: DbColumnMeta) {
  if (val === null)
    return null
  const colType = colMeta.columnType
  if (colType === "timestamp" || colType === "datetime" || colType === "date") {
    if (typeof val === "number")
      return timestampToSqlValue(val, colType === "timestamp" ? "datetime" : colType)
    if (typeof val !== "string")
      throw new Error(`Invalid datetime value: "${val}"`)
    return val
  }
  if (colType === "time") {
    if (typeof val !== "string")
      throw new Error(`Invalid time value: "${val}"`)
    return val
  }
  if (colType === "bigint" || colType === "integer" || colType === "smallint") {
    if (typeof val === "string")
      return parseInt(val, 10)
    if (typeof val !== "number")
      throw new Error(`Invalid integer value: "${val}"`)
    return val
  }
  if (colType === "bit") {
    if (typeof val === "boolean")
      return val ? 1 : 0
    if (val !== 1 && val !== 0)
      throw new Error(`Invalid bit value: "${val}"`)
    return val
  }
  if (colType === "string") {
    if (typeof val !== "string")
      throw new Error(`Invalid string value: "${val}"`)
    return val
  }
  throw new Error(`Unknown column type "${colType}"`)
}

function timestampToSqlValue(val: number, type: "datetime" | "date"): string {
  const dt = new Date(val).toISOString()
  if (type === "datetime")
    return dt.slice(0, 10)
  return dt.slice(0, 19).replace("T", " ")
}
