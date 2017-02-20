export default class Deferred<T> {
  public readonly promise: Promise<T>

  private resolveCb?: (result: T) => void
  private rejectCb?: (err: any) => void
  private response?: ["resolve" | "reject", any]

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolveCb = resolve
      this.rejectCb = reject
      if (this.response) {
        let [type, val] = this.response
        if (type === "resolve")
          resolve(val)
        else
          reject(val)
      }
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
    if (this.resolveCb)
      this.resolveCb(result)
    else
      this.response = ["resolve", result]
  }

  public reject(err: any): void {
    if (this.rejectCb)
      this.rejectCb(err)
    else
      this.response = ["reject", err]
  }
}
