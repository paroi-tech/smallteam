import { TaskFragment } from "../../shared/meta/Task"
import { wait } from "../../shared/libraries/helpers"

export interface AutoSaveOptions<FRAG> {
  showSpinner?: (show: boolean) => void
  save: (frag: FRAG) => Promise<void>
  reset: () => void
  delayMs?: number
  maxDelayMs?: number
}

export class AutoSave<FRAG> {
  private values = new Map()
  private awaiting = false
  private nextSaveTs?: number
  private opt: Required<AutoSaveOptions<FRAG>>

  constructor(options: AutoSaveOptions<FRAG>) {
    this.opt = {
      showSpinner: options.showSpinner || (() => {}),
      save: options.save,
      reset: options.reset,
      delayMs: options.delayMs || 2000,
      maxDelayMs: options.delayMs || 10000
    }
  }

  use(frag: FRAG) {
    this.values.clear()
    for (let [fieldName, value] of Object.entries(frag))
      this.values.set(fieldName, value)
  }

  setValue<FIELD extends keyof FRAG, VAL extends FRAG[FIELD]>(fieldName: FIELD, value: VAL) {
    this.values.set(fieldName, value)
    this.deferSave(this.opt.delayMs)
  }

  private deferSave(ms: number) {
    this.nextSaveTs = Date.now() + ms
    if (this.awaiting)
      return
    this.awaiting = true
    wait(ms).then(() => {
      this.awaiting = false
      if (!this.nextSaveTs)
        return
      let now = Date.now()
      if (now < this.nextSaveTs) {
        this.deferSave(this.nextSaveTs - now)
        return
      }
      this.runSave()
    })
  }

  private runSave() {
    // TODO:
  }

  private async save() {
    this.opt.showSpinner(true)
    try {
      await this.opt.save(this.toFragment())
    } catch (err) {
      this.opt.reset()
    }
    this.opt.showSpinner(false)
  }

  private toFragment(): FRAG {
    let frag = {}
    for (let [fieldName, value] of this.values.entries())
      frag[fieldName] = value
    return frag as FRAG
  }
}

interface CancellableWait {
  cancel(): void
  promise: Promise<void>
}

function cancellableWait(ms: number): CancellableWait {
  let handle, rejectCb
  return {
    promise: new Promise<void>((resolve, reject) => {
      rejectCb = reject
      handle = setTimeout(resolve, ms)
    }),
    cancel() {
      clearTimeout(handle)
      rejectCb(new Error("Cancelled"))
    }
  }
}


// let a: AutoSave<TaskFragment>
// a.setValue("projectId", "")