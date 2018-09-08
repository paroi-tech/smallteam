import { wait } from "../../shared/libraries/helpers"

export interface AutoSaveOptions<FRAG> {
  showSpinner?: (show: boolean) => void
  save: (frag: FRAG) => Promise<void>
  delayMs?: number
  maxDelayMs?: number
  logError: (err: any) => void
}

export class AutoSave<FRAG> {
  private values?: Map<any, any>
  private awaiting = false
  private running = false
  private waitSeq = 0
  private saveSeq = 0
  private maxNextSaveTs?: number
  private nextSaveTs?: number
  private opt: Required<AutoSaveOptions<FRAG>>

  constructor({ showSpinner, save, delayMs, maxDelayMs, logError }: AutoSaveOptions<FRAG>) {
    this.opt = {
      showSpinner: showSpinner || (() => { }),
      save: save,
      delayMs: delayMs || 2000,
      maxDelayMs: maxDelayMs || 10000,
      logError
    }
  }

  use(frag: FRAG | undefined) {
    if (this.values)
      this.opt.save(this.toFragment()).catch(err => this.opt.logError(err))
    this.cancel()
    if (frag) {
      this.values = new Map()
      for (let [fieldName, value] of Object.entries(frag))
        this.values.set(fieldName, value)
    }
  }

  cancel() {
    this.values = undefined
    this.maxNextSaveTs = undefined
    this.nextSaveTs = undefined
  }

  async flush() {
    if (!this.values)
      return
    ++this.saveSeq
    await this.save()
  }

  setSingle<FIELD extends keyof FRAG, VAL extends FRAG[FIELD]>(fieldName: FIELD, value: VAL) {
    if (!this.values)
      return
    this.values.set(fieldName, value)
    this.deferSave(this.opt.delayMs)
  }

  set<VALUES extends Partial<FRAG>>(values: VALUES) {
    if (!this.values)
      return
    let updated = false
    for (let [fieldName, value] of Object.entries(values)) {
      let prev = this.values.get(fieldName)
      if (prev !== value) {
        this.values.set(fieldName, value)
        updated = true
      }
    }
    if (updated)
      this.deferSave(this.opt.delayMs)
  }

  private deferSave(ms: number) {
    let now = Date.now()
    this.nextSaveTs = now + ms
    if (this.maxNextSaveTs)
      this.nextSaveTs = Math.min(this.nextSaveTs, this.maxNextSaveTs)
    else
      this.maxNextSaveTs = now + this.opt.maxDelayMs
    if (this.awaiting) {
      if (now < this.maxNextSaveTs)
        return
      ms = 0
    }
    this.awaiting = true
    let waitId = ++this.waitSeq
    console.log(`.. [${waitId}] wait`, ms)
    wait(ms).then(() => {
      console.log(`.. [${waitId}] wait-then`, waitId === this.waitSeq)
      if (waitId !== this.waitSeq)
        return
      this.awaiting = false
      if (!this.nextSaveTs)
        return
      let now = Date.now()
      if (now < this.nextSaveTs) {
        this.deferSave(this.nextSaveTs - now)
        return
      }
      if (this.running && (!this.maxNextSaveTs || now < this.maxNextSaveTs)) {
        this.deferSave(now + this.opt.delayMs)
        return
      }
      this.maxNextSaveTs = undefined
      this.running = true
      let saveId = ++this.saveSeq
      console.log(`.. [${waitId}][${saveId}] save`)
      this.save().then(() => {
        console.log(`.. [${waitId}][${saveId}] save-end`, saveId === this.saveSeq)
        if (saveId === this.saveSeq)
          this.running = false
      })
    })
  }

  private async save() {
    this.opt.showSpinner(true)
    try {
      await this.opt.save(this.toFragment())
      // await wait(3000)
    } catch (err) {
      this.opt.logError(err)
    }
    this.opt.showSpinner(false)
  }

  private toFragment(): FRAG {
    if (!this.values)
      throw new Error("Call 'use' before")
    let frag = {}
    for (let [fieldName, value] of this.values.entries())
      frag[fieldName] = value
    return frag as FRAG
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
