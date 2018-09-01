export default class Deferred<T> {
  readonly promise: Promise<T>

  private resolveCb!: (result: T) => void
  private rejectCb!: (err: any) => void

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolveCb = resolve
      this.rejectCb = reject
    })
  }

  pipeTo(prom: Promise<T>): Promise<T> {
    prom.then(
      result => this.resolve(result),
      err => this.reject(err)
    )
    return this.promise
  }

  resolve(result: T): void {
    this.resolveCb(result)
  }

  reject(err: any): void {
    this.rejectCb(err)
  }
}
