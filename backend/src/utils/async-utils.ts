
export interface PromiseToHandle<T = any> {
  resolve: [T] extends [void] ? () => void : (result: T) => void
  reject: (error: any) => void
  promise: Promise<T>
}

export function promiseToHandle<T = any>(): PromiseToHandle<T> {
  let resolve!: any
  let reject!: (error: any) => void
  const promise = new Promise<T>((resolveCb, rejectCb) => {
    resolve = resolveCb
    reject = rejectCb
  })
  return { promise, resolve, reject }
}

export function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

const locks = new Map<any, Promise<void>>()
// let num = 0

export async function onceAtATime<T>(lock: any, task: () => Promise<T>): Promise<T> {
  // let id = ++num
  const previous = locks.get(lock)
  const { promise, resolve } = promiseToHandle()
  locks.set(lock, promise)
  if (previous)
    await previous
  try {
    // appLog.debug(`[ONCE][${id}] begin`, uniqueKey)
    return await task()
  } finally {
    // appLog.debug(`[ONCE][${id}] end`, uniqueKey, locks.get(uniqueKey) === promise ? "(delete lock)" : "(KEEP lock)")
    if (locks.get(lock) === promise)
      locks.delete(lock)
    resolve()
  }
}

export async function waitAfterOnceAtATime(uniqueKey: any) {
  while (true) {
    let current = locks.get(uniqueKey)
    if (!current)
      break
    await current
  }
}