import { wait } from "../../shared/libraries/helpers"

export type DelayedStatus = false | "delaying" | "running"

export interface DelayedActionOptions {
  action: () => Promise<void>
  onChangeStatus?: (status: DelayedStatus) => void
  logError: (err: any) => void
  delayMs?: number
  maxDelayMs?: number
}

export class DelayedAction {
  private opt: Required<DelayedActionOptions>
  private delaying = false
  private running = false
  private waitSeq = 0
  private saveSeq = 0
  private maxNextSaveTs?: number
  private nextSaveTs?: number

  constructor({ onChangeStatus, action, delayMs, maxDelayMs, logError }: DelayedActionOptions) {
    this.opt = {
      action: action,
      onChangeStatus: onChangeStatus || (() => { }),
      logError,
      delayMs: delayMs || 2000,
      maxDelayMs: maxDelayMs || 10000
    }
  }

  get delayedStatus(): DelayedStatus {
    return this.delaying ? "delaying" : this.running ? "running" : false
  }

  reset({ flush = false }: { flush?: boolean } = {}) {
    if (flush && this.delaying)
      this.opt.action().catch(err => this.opt.logError(err))
    this.maxNextSaveTs = undefined
    this.nextSaveTs = undefined
    this.delaying = false
    this.running = false
  }

  async flush() {
    ++this.saveSeq
    await this.save()
  }

  delay() {
    this.delayFor(this.opt.delayMs)
  }

  private delayFor(ms: number) {
    let now = Date.now()
    this.nextSaveTs = now + ms
    if (this.maxNextSaveTs)
      this.nextSaveTs = Math.min(this.nextSaveTs, this.maxNextSaveTs)
    else
      this.maxNextSaveTs = now + this.opt.maxDelayMs
    if (this.delaying) {
      if (now < this.maxNextSaveTs)
        return
      ms = 0
    }
    this.opt.onChangeStatus("delaying")
    this.delaying = true
    let waitId = ++this.waitSeq
    // console.log(`.. [${waitId}] wait`, ms)
    wait(ms).then(() => {
      //console.log(`.. [${waitId}] wait-then`, waitId === this.waitSeq)
      if (waitId !== this.waitSeq || !this.nextSaveTs)
        return
      this.delaying = false
      let now = Date.now()
      if (now < this.nextSaveTs) {
        this.delayFor(this.nextSaveTs - now)
        return
      }
      if (this.running && (!this.maxNextSaveTs || now < this.maxNextSaveTs)) {
        this.delayFor(now + this.opt.delayMs)
        return
      }
      this.maxNextSaveTs = undefined
      this.running = true
      let saveId = ++this.saveSeq
      // console.log(`.. [${waitId}][${saveId}] save`)
      this.save().then(() => {
        // console.log(`.. [${waitId}][${saveId}] save-end`, saveId === this.saveSeq)
        if (saveId === this.saveSeq)
          this.running = false
      })
    })
  }

  private async save() {
    this.opt.onChangeStatus("running")
    try {
      await this.opt.action()
      await wait(3000)
    } catch (err) {
      this.opt.logError(err)
    }
    this.opt.onChangeStatus(false)
  }
}

// interface CancellableWait {
//   cancel(): void
//   promise: Promise<void>
// }

// function cancellableWait(ms: number): CancellableWait {
//   let handle, rejectCb
//   return {
//     promise: new Promise<void>((resolve, reject) => {
//       rejectCb = reject
//       handle = setTimeout(resolve, ms)
//     }),
//     cancel() {
//       clearTimeout(handle)
//       rejectCb(new Error("Cancelled"))
//     }
//   }
// }
