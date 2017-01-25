export interface EntityMeta {
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
