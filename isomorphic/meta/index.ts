import commentMetaVariants from "./Comment"
import contributorMetaVariants from "./Contributor"
import flagMetaVariants from "./Flag"
import projectMetaVariants from "./Project"
import stepMetaVariants from "./Step"
import taskMetaVariants from "./Task"
import taskLogEntryMetaVariants from "./TaskLogEntry"
import { Type, Identifier } from "../Cargo"

export let types: ReadonlyArray<Type> = Object.freeze(["Comment", "Contributor", "Flag", "Project", "Step", "Task", "TaskLogEntry"]) as any

export type TypeVariant = "read" | "create" | "update" | "id" | "fetch"

export interface MetaVariants {
  read: FragmentMeta
  create?: FragmentMeta
  update?: FragmentMeta
  id?: FragmentMeta
  fetch?: FragmentMeta
}

export interface FragmentMeta {
  type: Type
  variant: TypeVariant
  fields: {
    [name: string]: FieldMeta
  }
  orderFieldName?: string
}

export interface FieldMeta {
  dataType: "string" | "boolean" | "number" | "string[]"
  id?: boolean
  update?: boolean
  optional?: boolean
  allowEmpty?: boolean
  maxLen?: number
  values?: string[] | boolean[] | number[]
}

let allMeta: { [type: string]: MetaVariants } = {
  Comment: commentMetaVariants,
  Contributor: contributorMetaVariants,
  Flag: flagMetaVariants,
  Project: projectMetaVariants,
  Step: stepMetaVariants,
  Task: taskMetaVariants,
  TaskLogEntry: taskLogEntryMetaVariants,
}

export function getFragmentMeta(type: Type, variant: TypeVariant = "read"): FragmentMeta {
  let variants = allMeta[type]
  if (!variants)
    throw new Error(`Unknown type "${type}" for fragment meta`)
  let result = variants[variant]
  if (!result)
    throw new Error(`Missing variant "${variant}" of fragment meta for type: ${type}`)
  return result
}

export function toIdentifier(frag: object, type: Type): Identifier {
  let fragMeta = getFragmentMeta(type, "id")
  let singleVal: string | undefined,
    values: { [fieldName: string]: string } | undefined
  for (let fieldName of Object.keys(fragMeta.fields)) {
    if (frag[fieldName] === undefined)
      throw new Error(`[${fragMeta.type}] Missing value for field: ${fieldName}`)
    if (values)
      singleVal = undefined
    else {
      singleVal = frag[fieldName]
      values = {}
    }
    values[fieldName] = frag[fieldName]
  }
  if (!values)
    throw new Error(`[${fragMeta.type}] No identifier`)
  return singleVal !== undefined ? singleVal : values
}
