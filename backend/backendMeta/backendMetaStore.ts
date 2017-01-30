import { FragmentMeta, FieldMeta } from "../../isomorphic/FragmentMeta"
import { Type } from "../../isomorphic/Cargo"

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
  let columns = {},
    fieldNames = {}
  for (let fieldName of Object.keys(columnProps)) {
    let fieldMeta = fragMeta.fields[fieldName]
    if (!fieldMeta)
      throw new Error(`Unknown field "${fieldName}" in type "${fragMeta.type}"`)
    let colProps = columnProps[fieldName],
      colName = colProps ? (colProps.column || camelToUnderscoredName(fieldName)) : camelToUnderscoredName(fieldName)
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
  }
}

/**
 * Thanks to https://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
 */
function camelToUnderscoredName(camelName: string): string {
  return camelName.replace(/([A-Z])/g, function (chr) { return "_" + chr.toLowerCase(); });
}

// --
// -- Getters
// --

export function getFieldName(type: Type, columnName: string): string {
  let bm = backendMetaMap.get(type)
  if (!bm)
    throw new Error(`Unknown type: ${type}`)
  let fieldName = bm.fieldNames[columnName]
  if (fieldName === undefined)
    throw new Error(`Unknown column "${columnName}" in type: ${type}`)
  return fieldName
}

export function getDbColumnMeta(type: Type, fieldName: string): DbColumnMeta {
  let bm = backendMetaMap.get(type)
  if (!bm)
    throw new Error(`Unknown type: ${type}`)
  let column = bm.columns[fieldName]
  if (column === undefined)
    throw new Error(`Unknown field "${fieldName}" in type: ${type}`)
  return column
}
