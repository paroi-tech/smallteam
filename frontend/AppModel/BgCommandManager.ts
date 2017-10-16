import { Dash, Transmitter } from "bkb"
import Deferred from "../libraries/Deferred"

export interface BgCommand<R = any> {
  readonly label: string
  readonly startDt: Date
  readonly inProgress: boolean
  readonly done?: boolean
  readonly errorMessage?: string
  readonly promise: Promise<R>
  cancel(): Promise<void>
}

export interface BgCommandManager {
  getInProgressCommands(): Iterable<BgCommand>
  getErrorCommands(): Iterable<BgCommand>
}

export default class GenericBgCommandManager implements BgCommandManager {
  private inProgressCommands = new Set<BgCommand>()
  private errorCommands = new Set<BgCommand>()

  constructor(private dash: Dash<object>) {
    this.dash.exposeEvent("bgCommandAdded", "bgCommandDone", "bgCommandError")
  }

  public add<R>(promise: Promise<R>, label: string): BgCommand<R> {
    let cmd = bgCommandFactory(promise, label)
    this.inProgressCommands.add(cmd)
    cmd.promise.then(() => {
      this.inProgressCommands.delete(cmd)
      this.dash.emit("bgCommandDone", cmd)
    }, () => {
      this.inProgressCommands.delete(cmd)
      this.errorCommands.add(cmd)
      this.dash.emit("bgCommandError", cmd)
    })
    this.dash.emit("bgCommandAdded", cmd)
    return cmd
  }

  public getInProgressCommands(): Iterable<BgCommand> {
    return this.inProgressCommands.values()
  }

  public getErrorCommands(): Iterable<BgCommand> {
    return this.errorCommands.values()
  }
}

function bgCommandFactory<R>(original: Promise<R>, label: string): BgCommand {
  let inProgress = true,
    done: boolean | undefined,
    errorMsg: string | undefined,
    dfd = new Deferred<R>()

  original.then(onDone, err => {
    let msg = typeof err === "string" ? err : (err instanceof Error ? err.message : "Unexpected error")
    onError(msg, err)
  })

  function onDone(val) {
    if (!inProgress) {
      // TODO: emit event here: it is the original result but hidden by a cancel
      return
    }
    inProgress = false
    done = true
    dfd.resolve(val)
  }

  function onError(msg: string, err = new Error(msg)) {
    if (!inProgress) {
      // TODO: emit event here: it is the original error but hidden by a cancel
      return
    }
    inProgress = false
    done = false
    errorMsg = msg
    dfd.reject(err)
  }

  return {
    label,
    startDt: new Date(),
    get inProgress() {
      return inProgress
    },
    get done() {
      return done
    },
    get errorMessage() {
      return errorMsg
    },
    promise: dfd.promise,
    cancel: () => new Promise((resolve) => {
      if (inProgress)
        onError("Command is canceled")
      resolve()
    })
  }
}
