import { removeAllChildren } from "@smallteam/shared-ui/libraries/utils"
import InfoDialog from "@smallteam/shared-ui/modal-dialogs/InfoDialog"
import WarningDialog from "@smallteam/shared-ui/modal-dialogs/WarningDialog"
import { AppDash, EventCallback, EventName, Log, LogEvent } from "bkb"
import AppFrame from "../AppFrame/AppFrame"
import ModelComp, { Model, SessionData } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import { ReorderModelEvent, UpdateModelEvent } from "../AppModel/ModelEngine"
import LoginDialog from "../generics/LoginDialog"
import PasswordRequestDialog from "../generics/PasswordRequestDialog"

export default class App {
  readonly log: Log
  readonly baseUrl: string
  private _model!: Model
  private appFrame?: AppFrame

  constructor(private dash: AppDash<App>) {
    this.log = dash.log
    this.baseUrl = document.documentElement!.dataset.baseUrl || ""

    this.dash.listenTo<LogEvent>("log", data => {
      if (!console)
        return
      // eslint-disable-next-line no-console
      if (data.level !== "trace" && console[data.level]) {
        // eslint-disable-next-line no-console
        console[data.level](...data.messages)
      } else {
        // eslint-disable-next-line no-console
        console.log(`[${data.level}]`, ...data.messages)
      }
    })

    this.dash.addDashAugmentation(d => {
      return {
        listenToModel: (eventName: EventName, listener: EventCallback, thisArg?: any) => {
          return d.listenTo(this._model, eventName, listener, thisArg)
        }
      }
    })
  }

  async alert(msg: string) {
    await this.dash.create(WarningDialog).show(msg)
  }

  get model(): Model {
    if (!this._model)
      throw new Error("The application is still not initialized")
    return this._model
  }

  async navigate(queryString: string): Promise<void> {
    if (!this.appFrame)
      return
    await this.appFrame.viewer.router.navigate(queryString)
  }

  async connect(): Promise<string> {
    let sessionAvailable = false
    let accountId: string | undefined

    // First, we try to recover session, if there is an active one.
    try {
      const response = await fetch(`${this.baseUrl}/api/session/current`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        this.log.warn("Unable to get a response from server while trying to recover session.")
      } else {
        const result = await response.json()
        if (result.done) {
          sessionAvailable = true
          accountId = result.accountId as string
        }
      }
    } catch (err) {
      this.log.warn(err)
    }

    if (sessionAvailable)
      return accountId!

    // We show login dialog if session recovering failed.
    return await this.dash.create(LoginDialog).open()
  }

  async disconnect() {
    try {
      const response = await fetch(`${this.baseUrl}/api/session/disconnect`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok) {
        this.log.error("Unable to get a response from server while trying to disconnect...")
      } else {
        const result = await response.json()

        if (result.done) {
          await this.navigate("") // This prevents the router to show current page at next login.
          document.location!.reload(false)
        } else {
          await this.dash.create(InfoDialog).show("Unable to end session. Please try again.")
        }
      }
    } catch (err) {
      // TODO: handle disconnection error.
      this.log.warn("Unable to disconnect user...")
    }
  }

  async showPasswordResetDialog() {
    const dialog = this.dash.create(PasswordRequestDialog)
    try {
      await dialog.open()
    } catch (error) {
      this.log.error(error)
    }
  }

  async start(sessionData: SessionData) {
    await this.initModel(sessionData)

    const appEl = document.querySelector(".js-app")

    if (appEl) {
      removeAllChildren(appEl)
      this.appFrame = this.dash.create(AppFrame)
      appEl.appendChild(this.appFrame.el)
    }
  }

  private async initModel(sessionData: SessionData) {
    this._model = this.dash.create(ModelComp, sessionData)

    const modelDash = this.dash.getPublicDashOf(this.model)

    modelDash.unmanagedListeners.on<UpdateModelEvent | ReorderModelEvent>("change", data => {
      if ("orderedIds" in data)
        this.log.trace(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        this.log.trace(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandAdded", data => {
      this.log.trace(`[BG] Add: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandDone", data => {
      this.log.trace(`[BG] Done: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandError", data => {
      this.log.trace(`[BG] Error: ${data.label}`, data.errorMessage)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("processing", data => {
      this.log.trace(`[PROCESSING] start ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("endProcessing", data => {
      this.log.trace(`[PROCESSING] end ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    await this.model.global.loading
  }
}
