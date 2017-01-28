import { Database } from "sqlite"

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

interface GroupFilter {
  type: "or" | "and"
  filters: Filter[]
}

type Filter = GroupFilter | string

interface SelectQuery {
  select: string[]
  from: string
  joins: Join[]
  where: Filter
  groupBy: string[]
  having: Filter
  orderBy: (string | number)[]
}

type Value = string | number | boolean | string[] | number[] | boolean[]
type Operator = "=" | ">" | ">=" | "<" | "<=" | "<>" | "in" | "not in" | "is null" | "is not null"

// private getCn: Promise<Database>

export class SelectBuilder {
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

  public join(table: string, critType: "on", filter: Filter): this
  public join(table: string, critType: "using", columns: string | string[]): this
  public join(table: string, critType: any, critValue: any): this {
    this.q.joins = addJoin("inner", table, critType, critValue, this.q.joins)
    return this
  }

  public innerJoin(table: string, critType: "on", filter: Filter): this
  public innerJoin(table: string, critType: "using", columns: string | string[]): this
  public innerJoin(table: string, critType: any, critValue: any): this {
    this.q.joins = addJoin("inner", table, critType, critValue, this.q.joins)
    return this
  }

  public leftJoin(table: string, critType: "on", filter: Filter): this
  public leftJoin(table: string, critType: "using", columns: string | string[]): this
  public leftJoin(table: string, critType: any, critValue: any): this {
    this.q.joins = addJoin("left", table, critType, critValue, this.q.joins)
    return this
  }

  public rightJoin(table: string, critType: "on", filter: Filter): this
  public rightJoin(table: string, critType: "using", columns: string | string[]): this
  public rightJoin(table: string, critType: any, critValue: any): this {
    this.q.joins = addJoin("right", table, critType, critValue, this.q.joins)
    return this
  }

  public outerJoin(table: string, critType: "on", filter: Filter): this
  public outerJoin(table: string, critType: "using", columns: string | string[]): this
  public outerJoin(table: string, critType: any, critValue: any): this {
    this.q.joins = addJoin("outer", table, critType, critValue, this.q.joins)
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

function filterToSql(f: Filter): string {
  if (typeof f === "string")
    return f
  let arr: string[] = []
  for (let sub of f.filters)
    arr.push(filterToSql(sub))
  return arr.join(` ${f.type} `)
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

function addJoin(type: "inner" | "left" | "right" | "outer", table: string, critType: any, critValue: any, to?: Join[]): Join[] {
  if (!this.q.joins)
    this.q.joins = []
  if (critType === "using" && typeof critValue === "string")
    critValue = [critValue]
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
  if (opOrVal === "is null" || opOrVal === "is not null")
    return `${filter} ${opOrVal}`
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

function toSqlPrimVal(val: string | number | boolean): string {
  switch (typeof val) {
    case "string":
      return (val as string).replace("'", "''")
    case "number":
      return val.toString()
    case "boolean":
      return val ? "1" : "0"
  }
  throw new Error(`Invalid type: ${typeof val}`)
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