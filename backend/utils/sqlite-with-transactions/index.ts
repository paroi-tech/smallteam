import { Database } from "sqlite"

export interface Connection extends Database {
  beginTransaction(): Promise<InTransactionConnection>
  singleRow<T = any>(sql: string): Promise<T>
  singleRow<T = any>(sql: string, mode: "acceptMissingRow"): Promise<T | undefined>
  singleValue<T = any>(sql: string): Promise<T>
  singleValue<T = any>(sql: string, mode?: "acceptMissingRow"): Promise<T | undefined>
}

export interface InTransactionConnection extends Connection {
  /**
   * @param force Force a new transaction on another connection, even if there is a current transaction
   */
  beginTransaction(force?: boolean): Promise<InTransactionConnection>
  readonly inTransaction: boolean
  commit(): Promise<void>
  rollback(): Promise<void>
}

const METHODS = ["run", "get", "all", "exec", "each", "prepare", "migrate"] // all methods except 'close'

export async function sqliteConnection(openSqliteConnection: () => Promise<Database>, poolOptions: PoolOptions = {}): Promise<Connection> {
  return await doCreateConnection(await createPool(openSqliteConnection, poolOptions)) as Connection
}

async function doCreateConnection(pool: Pool, transactionDb?: Database): Promise<Connection | InTransactionConnection> {
  let thisObj: Partial<InTransactionConnection> = {}
  let isRoot = !transactionDb,
    closed = false

  for (let method of METHODS) {
    thisObj[method] = async (...args: any[]) => {
      if (closed)
        throw new Error(`Invalid call to "${method}", the connection is closed`)
      return (transactionDb || pool.singleUse)[method](...args)
    }
  }

  thisObj.singleRow = async (sql: string, mode?: "acceptMissingRow") => {
    let rs = await thisObj.all!(sql)
    if (rs.length !== 1) {
      if (mode === "acceptMissingRow" && rs.length === 0)
        return
      throw new Error(`Cannot fetch one value, row count: ${rs.length}`)
    }
    return rs[0]
  }

  thisObj.singleValue = async (sql: string, mode?: "acceptMissingRow") => {
    let row = await thisObj.singleRow!(sql, mode as any)
    if (mode === "acceptMissingRow" && row === undefined)
      return
    let columns = Object.keys(row)
    if (columns.length !== 1)
      throw new Error(`Cannot fetch one value, column count: ${columns.length}`)
    return row[columns[0]]
  }

  let transactionDepth: number,
    rollbacked = false
  if (transactionDb) {
    transactionDepth = 1
    await transactionDb.exec("begin")
    for (let method of ["commit", "rollback"]) {
      thisObj[method] = async () => {
        if (closed)
          throw new Error(`Invalid call to "${method}", the connection is closed`)
        if (transactionDepth === 0)
          throw new Error(`Cannot ${method}, not in a transaction`)
        --transactionDepth
        if (transactionDepth === 0) {
          let cancelCommit = rollbacked && method === "commit"
          await transactionDb!.exec(cancelCommit ? "rollback" : method)
          pool.release(transactionDb!)
          transactionDb = undefined
          if (cancelCommit)
            throw new Error(`Invalid call to "commit", because an inner transaction has been rollbacked`)
        } else if (method === "rollback")
          rollbacked = true
      }
    }
  } else
    transactionDepth = 0

  thisObj.beginTransaction = async (force = false) => {
    if (closed)
      throw new Error(`Invalid call to "beginTransaction", the connection is closed`)
    if (!force && transactionDepth > 0) {
      ++transactionDepth
      return thisObj as InTransactionConnection
    }
    return await doCreateConnection(pool, await pool.grab()) as InTransactionConnection
  }

  thisObj.close = async () => {
    if (closed)
      throw new Error(`Invalid call to "close", the connection is already closed`)
    let promise: Promise<void> | undefined
    if (transactionDb)
      promise = (thisObj as InTransactionConnection).rollback()
    closed = true
    if (promise)
      await promise
    if (isRoot)
      await pool.close()
  }

  Object.defineProperties(thisObj, {
    inTransaction: {
      configurable: false,
      enumerable: true,
      get: function () {
        return transactionDepth > 0
      }
    }
  })

  return thisObj as Connection | InTransactionConnection
}

export interface PoolOptions {
  /**
   * In seconds. Default value is: 60.
   */
  connectionTtl?: number
  logError?(reason: any): void
}

interface Pool {
  readonly singleUse: Database
  grab(): Promise<Database>
  release(db: Database)
  close(): Promise<void>
}

interface PoolItem {
  db: Database
  releaseTime: number
}

async function createPool(openSqliteConnection: () => Promise<Database>, options: PoolOptions): Promise<Pool> {
  if (!options.logError)
    options.logError = console.log
  if (!options.connectionTtl)
    options.connectionTtl = 60
  let closed = false
  let singleUse = await openSqliteConnection()
  let available = [] as PoolItem[]
  let cleaning: any | null = null

  return {
    get singleUse() {
      if (closed)
        throw new Error(`Cannot use the main connection, the pool is closed`)
      return singleUse
    },
    grab: async () => {
      if (closed)
        throw new Error(`Invalid call to "grab", the pool is closed`)
      let pi = available.pop()
      if (pi)
        return pi.db
      return openSqliteConnection()
    },
    release: (db: Database) => {
      available.push({ db, releaseTime: Date.now() })
      if (closed)
        cleanOldConnections(true)
      else
        startCleaning()
    },
    close: async () => {
      if (closed)
        throw new Error(`Invalid call to "close", the pool is already closed`)
      closed = true
      await singleUse.close()
    }
  }

  function startCleaning() {
    if (cleaning !== null)
      return
    cleaning = setInterval(() => {
      cleanOldConnections()
      if (available.length === 0) {
        clearInterval(cleaning)
        cleaning = null
      }
    }, 20000) // 20 seconds
  }

  function cleanOldConnections(force = false) {
    let olderThanTime = Date.now() - 1000 * options.connectionTtl!
    let index: number
    for (index = 0; index < available.length; ++index) {
      if (!force && available[index].releaseTime > olderThanTime)
        break
      available[index].db.close().catch(options.logError)
    }
    if (index > 0)
      available = available.slice(index)
  }
}
