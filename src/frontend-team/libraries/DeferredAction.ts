export interface DeferredActionOptions {
  action: () => Promise<void> | void
  onPending?: (pending: boolean) => void
  /**
   * Default value: `2000`.
   */
  delayMs?: number
  /**
   * Default value: `10000`.
   */
  maxDelayMs?: number
  /**
   * Must never thrown an exception.
   */
  logError?: (error: any) => void
}

class DeferredAction {
  private opt: Required<DeferredActionOptions>
  private waitSinceTs
  private waitUntilTs
  private waitHandler
  private runningAction = false
  private afterActionDeferAgain = false
  private closed = false

  constructor(options: DeferredActionOptions) {
    this.opt = {
      onPending: options.onPending || (() => { }),
      action: options.action,
      delayMs: options.delayMs || 2000,
      maxDelayMs: options.delayMs || 10000,
      logError: error => console.log(error)
    }
  }

  deferAction() {
    if (this.closed)
      throw new Error("Cannot call 'deferAction()' on a closed DeferredAction")

    if (this.runningAction) {
      this.afterActionDeferAgain = true
      return
    }

    let now = Date.now(),
      delay = this.opt.delayMs,
      untilTs = now + delay

    if (!this.waitSinceTs)
      this.waitSinceTs = now

    if (this.waitHandler !== undefined) {
      if (this.waitUntilTs >= untilTs)
        return
      let maxUntilTs = this.waitSinceTs + this.opt.maxDelayMs
      if (maxUntilTs < untilTs) {
        delay = Math.min(this.opt.maxDelayMs, Math.max(0, maxUntilTs - now))
        untilTs = now + delay
      }
      if (this.waitUntilTs === untilTs)
        return
      clearTimeout(this.waitHandler)
    }

    this.waitUntilTs = untilTs
    this.waitHandler = setTimeout(() => this.execAction(), delay)
    this.safeSetPending(true)
  }

  async actionAndClose() {
    if (this.closed)
      return
    this.closed = true
    if (this.waitHandler !== undefined) {
      clearTimeout(this.waitHandler)
      await this.execAction()
    }
  }

  cancelAndClose() {
    if (this.closed)
      return
    this.closed = true
    if (this.waitHandler) {
      clearTimeout(this.waitHandler)
      this.waitSinceTs = undefined
      this.waitUntilTs = undefined
      this.waitHandler = undefined
      this.safeSetPending(false)
    }
    this.afterActionDeferAgain = false
  }

  private async execAction() {
    this.waitSinceTs = undefined
    this.waitUntilTs = undefined
    this.waitHandler = undefined
    this.runningAction = true
    await this.safeAction()
    this.runningAction = false
    this.safeSetPending(false)
    if (this.afterActionDeferAgain) {
      this.afterActionDeferAgain = false
      if (this.closed)
        await this.safeAction()
      else
        this.deferAction()
    }
  }

  private async safeAction() {
    try {
      await this.opt.action()
    } catch (err) {
      this.opt.logError(err)
    }
  }

  private safeSetPending(pending: boolean) {
    try {
      this.opt.onPending(pending)
    } catch (err) {
      this.opt.logError(err)
    }
  }
}