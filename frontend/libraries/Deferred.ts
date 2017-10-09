export default class Deferred<T> {
  public readonly promise: Promise<T>

  private resolveCb: (result: T) => void
  private rejectCb: (err: any) => void

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolveCb = resolve
      this.rejectCb = reject
    })
  }

  public pipeTo(prom: Promise<T>): Promise<T> {
    prom.then(
      result => this.resolve(result),
      err => this.reject(err)
    )
    return this.promise
  }

  public resolve(result: T): void {
    this.resolveCb(result)
  }

  public reject(err: any): void {
    this.rejectCb(err)
  }
}
