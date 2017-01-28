import { Database } from "sqlite"

export type PrimitiveValue = string | number | boolean
export type SqlFn = "current_timestamp" | "current_date" | "current_time"
export type VanillaValue = { "vanilla": SqlFn }
export type Value = PrimitiveValue | VanillaValue | (string | VanillaValue)[] | (number | VanillaValue)[] | (boolean | VanillaValue)[]
//export type NullOperator = "is null" | "is not null"
export type InOperator = "in" | "not in"
export type PrimitiveOperator = "=" | ">" | ">=" | "<" | "<=" | "<>"
export type Operator = PrimitiveOperator | InOperator

export interface SelectBuilder {
  select(select: string): this
  from(from: string): this
  join(table: string, critType: "on", leftOperand: string, op: Operator, val: Value): this
  join(table: string, critType: "on", leftOperand: string, val: Value): this
  join(table: string, critType: "on", filter: string): this
  join(table: string, critType: "using", columns: string | string[]): this
  innerJoin(table: string, critType: "on", leftOperand: string, op: Operator, val: Value): this
  innerJoin(table: string, critType: "on", leftOperand: string, val: Value): this
  innerJoin(table: string, critType: "on", filter: string): this
  innerJoin(table: string, critType: "using", columns: string | string[]): this
  leftJoin(table: string, critType: "on", leftOperand: string, op: Operator, val: Value): this
  leftJoin(table: string, critType: "on", leftOperand: string, val: Value): this
  leftJoin(table: string, critType: "on", filter: string): this
  leftJoin(table: string, critType: "using", columns: string | string[]): this
  rightJoin(table: string, critType: "on", leftOperand: string, op: Operator, val: Value): this
  rightJoin(table: string, critType: "on", leftOperand: string, val: Value): this
  rightJoin(table: string, critType: "on", filter: string): this
  rightJoin(table: string, critType: "using", columns: string | string[]): this
  outerJoin(table: string, critType: "on", leftOperand: string, op: Operator, val: Value): this
  outerJoin(table: string, critType: "on", leftOperand: string, val: Value): this
  outerJoin(table: string, critType: "on", filter: string): this
  outerJoin(table: string, critType: "using", columns: string | string[]): this
  where(leftOperand: string, op: Operator, val: Value): this
  where(leftOperand: string, val: Value): this
  where(filter: string): this
  andWhere(leftOperand: string, op: Operator, val: Value): this
  andWhere(leftOperand: string, val: Value): this
  andWhere(filter: string): this
  orWhere(leftOperand: string, op: Operator, val: Value): this
  orWhere(leftOperand: string, val: Value): this
  orWhere(filter: string): this
  groupBy(groupBy: string): this
  having(leftOperand: string, op: Operator, val: Value): this
  having(leftOperand: string, val: Value): this
  having(filter: string): this
  andHaving(leftOperand: string, op: Operator, val: Value): this
  andHaving(leftOperand: string, val: Value): this
  andHaving(filter: string): this
  orHaving(leftOperand: string, op: Operator, val: Value): this
  orHaving(leftOperand: string, val: Value): this
  orHaving(filter: string): this
  orderBy(orderBy: string | number): this
  toSql(): string
}

export function buildSelect(): SelectBuilder {
  return new BSelect()
}

export interface InsertBuilder {
  insertInto(table: string): this
  values(values: ValueMap): this
  toSql(): string
}

export function buildInsert(): InsertBuilder {
  return new BInsert()
}

export interface UpdateBuilder {
  update(table: string): this
  set(values: ValueMap): this
  where(leftOperand: string, op: Operator, val: Value): this
  where(leftOperand: string, val: Value): this
  where(filter: string): this
  toSql(): string
}

export function buildUpdate(): UpdateBuilder {
  return new BUpdate()
}

export interface DeleteBuilder {
  deleteFrom(table: string): this
  where(leftOperand: string, op: Operator, val: Value): this
  where(leftOperand: string, val: Value): this
  where(filter: string): this
  toSql(): string
}

export function buildDelete(): DeleteBuilder {
  return new BDelete()
}

interface GroupFilter {
  type: "or" | "and"
  filters: Filter[]
}

type Filter = GroupFilter | string

interface OnJoinCriterion {
  type: "on",
  val: Filter
}
interface UsingJoinCriterion {
  type: "using",
  val: string[]
}
type JoinCriterion = OnJoinCriterion | UsingJoinCriterion

interface Join {
  type: "inner" | "left" | "right" | "outer"
  table: string
  criterion: JoinCriterion
}

export interface ValueMap {
  [column: string]: PrimitiveValue | VanillaValue
}

interface SelectQuery {
  select: string[]
  from: string
  joins: Join[]
  where: Filter
  groupBy: string[]
  having: Filter
  orderBy: (string | number)[]
}

interface InsertQuery {
  table: string
  values: ValueMap
}

interface UpdateQuery {
  table: string
  set: ValueMap
  where: Filter
}

interface DeleteQuery {
  table: string
  where: Filter
}

class BUpdate implements UpdateBuilder {
  private q: Partial<UpdateQuery> = {}

  public update(table: string): this {
    if (this.q.table)
      throw new Error(`Cannot call "update" twice`)
    this.q.table = table
    return this
  }

  public set(values: ValueMap): this {
    if (!this.q.set)
      this.q.set = { ...values }
    else {
      for (let column in values) {
        if (values.hasOwnProperty(column))
          this.q.set[column] = values[column]
      }
    }
    return this
  }

  public where(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    if (this.q.where)
      throw new Error(`Cannot call "where" twice`)
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public andWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public orWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("or", filter, opOrVal, val, this.q.where)
    return this
  }

  public toSql(): string {
    if (this.q.table === undefined)
      throw new Error(`Missing: update`)
    if (this.q.set === undefined)
      throw new Error(`Missing: set`)
    let lines = [
      `update ${this.q.table}`,
      `set ${updateSetToSql(this.q.set)}`
    ]
    if (this.q.where !== undefined)
      lines.push(`where ${filterToSql(this.q.where)}`)
    return lines.join("\n")
  }
}

function updateSetToSql(set: ValueMap) {
  let arr: string[] = []
  for (let column in set) {
    if (set.hasOwnProperty(column))
      arr.push(`${column} = ${toSqlPrimVal(set[column])}`)
  }
  return arr.join(", ")
}

class BInsert implements InsertBuilder {
  private q: Partial<InsertQuery> = {}

  public insertInto(table: string): this {
    if (this.q.table)
      throw new Error(`Cannot call "insertInto" twice`)
    this.q.table = table
    return this
  }

  public values(values: ValueMap): this {
    if (!this.q.values)
      this.q.values = { ...values }
    else {
      for (let column in values) {
        if (values.hasOwnProperty(column))
          this.q.values[column] = values[column]
      }
    }
    return this
  }

  public toSql(): string {
    if (this.q.table === undefined)
      throw new Error(`Missing: insertInto`)
    if (this.q.values === undefined)
      throw new Error(`Missing: values`)
    let columns: string[] = [],
      values: string[] = []
    for (let column in this.q.values) {
      if (!this.q.values.hasOwnProperty(column))
        continue
      columns.push(column)
      values.push(toSqlPrimVal(this.q.values[column]))
    }
    let lines = [
      `insert into ${this.q.table} (${columns.join(", ")})`,
      `values (${values.join(", ")})`
    ]
    return lines.join("\n")
  }
}

class BDelete implements DeleteBuilder {
  private q: Partial<DeleteQuery> = {}

  public deleteFrom(table: string): this {
    if (this.q.table)
      throw new Error(`Cannot call "deleteFrom" twice`)
    this.q.table = table
    return this
  }

  public where(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    if (this.q.where)
      throw new Error(`Cannot call "where" twice`)
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public andWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public orWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("or", filter, opOrVal, val, this.q.where)
    return this
  }

  public toSql(): string {
    if (this.q.table === undefined)
      throw new Error(`Missing: deleteFrom`)
    let lines = [
      `delete from ${this.q.table}`
    ]
    if (this.q.where !== undefined)
      lines.push(`where ${filterToSql(this.q.where)}`)
    return lines.join("\n")
  }
}

class BSelect implements SelectBuilder {
  private q: Partial<SelectQuery> = {}

  public select(select: string): this {
    this.q.select = addColumns(select, this.q.select)
    return this
  }

  public from(from: string): this {
    if (this.q.from)
      throw new Error(`Cannot call "from" twice`)
    this.q.from = from
    return this
  }

  public join(table: string, critType: any, critValue: any, opOrVal?: Value | Operator, val?: Value): this {
    this.q.joins = addJoin("inner", table, critType, critValue, opOrVal, val, this.q.joins)
    return this
  }

  public innerJoin(table: string, critType: any, critValue: any, opOrVal?: Value | Operator, val?: Value): this {
    this.q.joins = addJoin("inner", table, critType, critValue, opOrVal, val, this.q.joins)
    return this
  }

  public leftJoin(table: string, critType: any, critValue: any, opOrVal?: Value | Operator, val?: Value): this {
    this.q.joins = addJoin("left", table, critType, critValue, opOrVal, val, this.q.joins)
    return this
  }

  public rightJoin(table: string, critType: any, critValue: any, opOrVal?: Value | Operator, val?: Value): this {
    this.q.joins = addJoin("right", table, critType, critValue, opOrVal, val, this.q.joins)
    return this
  }

  public outerJoin(table: string, critType: any, critValue: any, opOrVal?: Value | Operator, val?: Value): this {
    this.q.joins = addJoin("outer", table, critType, critValue, opOrVal, val, this.q.joins)
    return this
  }

  public where(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    if (this.q.where)
      throw new Error(`Cannot call "where" twice`)
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public andWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("and", filter, opOrVal, val, this.q.where)
    return this
  }

  public orWhere(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.where = addFilter("or", filter, opOrVal, val, this.q.where)
    return this
  }

  public groupBy(groupBy: string): this {
    this.q.groupBy = addColumns(groupBy, this.q.groupBy)
    return this
  }

  public having(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    if (this.q.having)
      throw new Error(`Cannot call "having" twice`)
    this.q.having = addFilter("and", filter, opOrVal, val, this.q.having)
    return this
  }

  public andHaving(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.having = addFilter("and", filter, opOrVal, val, this.q.having)
    return this
  }

  public orHaving(filter: string, opOrVal?: Value | Operator, val?: Value): this {
    this.q.having = addFilter("or", filter, opOrVal, val, this.q.having)
    return this
  }

  public orderBy(orderBy: string | number): this {
    this.q.orderBy = addColumns(orderBy, this.q.orderBy)
    return this
  }

  public toSql(): string {
    if (this.q.select === undefined)
      throw new Error(`Missing: select`)
    if (this.q.from === undefined)
      throw new Error(`Missing: from`)
    let lines = [
      `select ${this.q.select!.join(", ")}`,
      `from ${this.q.from}`
    ]
    if (this.q.joins) {
      for (let j of this.q.joins) {
        let crit = j.criterion.type === "using" ? j.criterion.val.join(", ") : filterToSql(j.criterion.val)
        lines.push(`${j.type} join ${j.table} ${j.criterion.type} ${crit}`)
      }
    }
    if (this.q.where !== undefined)
      lines.push(`where ${filterToSql(this.q.where)}`)
    if (this.q.groupBy !== undefined)
      lines.push(`group by ${this.q.groupBy.join(", ")}`)
    if (this.q.having !== undefined)
      lines.push(`having ${filterToSql(this.q.having)}`)
    if (this.q.orderBy !== undefined)
      lines.push(`order by ${this.q.orderBy.join(", ")}`)
    return lines.join("\n")
  }
}

// function hasValue(smtg: any): boolean {
//   return smtg !== null && smtg !== undefined && smtg !== "" && (!Array.isArray(smtg) || smtg.length !== 0)
// }

function addColumns<T>(toAdd: T | string, to?: (T | string)[]): (T | string)[] {
  let columns = typeof toAdd === "string" ? toAdd.split(/\s*,\s*/) : [toAdd]
  if (to)
    to.push(...columns)
  else
    to = columns
  return to
}

function addJoin(type: "inner" | "left" | "right" | "outer", table: string, critType: "on" | "using", critValue: any,
    opOrVal?: Value | Operator, val?: Value, to?: Join[]): Join[] {
  if (!this.q.joins)
    this.q.joins = []
  if (critType === "using" && typeof critValue === "string")
    critValue = [critValue]
  else if (critType === "on")
    critValue = toFilter(critValue, opOrVal, val)
  this.q.joins.push({
    type,
    table,
    criterion: {
      type: critType,
      val: critValue
    }
  })
  return this
}

function addFilter(type: "or" | "and", newFilter: string, opOrVal?: Value | Operator, val?: Value, to?: Filter): Filter | undefined {
  let toAdd = toFilter(newFilter, opOrVal, val)
  if (toAdd === null)
    return to
  if (!to)
    to = toAdd
  else if (typeof to === "string") {
    to = {
      type,
      filters: [to, toAdd]
    }
  } else {
    if (to.type !== type)
      throw new Error(`Cannot add a "${type}" filter in a "${to.type}" filter`)
    to.filters.push(toAdd)
  }
  return to
}

/**
 * @returns null if the filter must be ignored
 */
function toFilter(filter: string, opOrVal?: Value | Operator, val?: Value): string | null {
  if (opOrVal === undefined)
    return filter
  // if (opOrVal === "is null" || opOrVal === "is not null")
  //   return `${filter} ${opOrVal}`
  let op: Operator
  if (val === undefined) {
    op = "="
    val = opOrVal as Value
  } else {
    op = opOrVal as Operator
    if (op === "in" || op === "not in" && !Array.isArray(val))
      val = [val as any]
  }
  let escVal = toSqlVal(val)
  return escVal === null ? null : `${filter} ${op} ${escVal}`
}

/**
 * @returns null if the value must be ignored
 */
function toSqlVal(val: Value): string | null {
  if (Array.isArray(val)) {
    if (val.length === 0)
      return null
    let arr: string[] = []
    for (let v of val)
      arr.push(toSqlPrimVal(v))
    return "(" + arr.join(", ") + ")"
  }
  return toSqlPrimVal(val)
}

function toSqlPrimVal(val: PrimitiveValue | VanillaValue): string {
  switch (typeof val) {
    case "string":
      return "'" + (val as string).replace("'", "''") + "'"
    case "number":
      return val.toString()
    case "boolean":
      return val ? "1" : "0"
    default:
      return (val as VanillaValue).vanilla
  }
}

function filterToSql(f: Filter): string {
  if (typeof f === "string")
    return f
  let arr: string[] = []
  for (let sub of f.filters)
    arr.push(filterToSql(sub))
  return arr.join(` ${f.type} `)
}
