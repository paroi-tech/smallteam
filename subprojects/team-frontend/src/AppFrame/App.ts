import { removeAllChildren } from "@smallteam-local/shared-ui/libraries/utils"
import ErrorDialog from "@smallteam-local/shared-ui/modal-dialogs/ErrorDialog"
import WarningDialog from "@smallteam-local/shared-ui/modal-dialogs/WarningDialog"
import { AppDash, EventCallback, EventName, Log, LogEvent } from "bkb"
import AppFrame from "../AppFrame/AppFrame"
import ModelComp, { Model, SessionData } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import { ReorderModelEvent, UpdateModelEvent } from "../AppModel/ModelEngine"
import { closeWsClient, initWsClient } from "../AppModel/ModelEngine/WsClient"
import LoginDialog, { LoginResult, SessionInfo } from "../generics/LoginDialog"
import PasswordRequestDialog from "../generics/PasswordRequestDialog"

export default class App {
  readonly log: Log
  readonly baseUrl: string
  private _model?: Model
  private appFrame?: AppFrame
  private ws?: WebSocket

  constructor(private dash: AppDash<App>) {
    this.log = dash.log
    this.baseUrl = document.documentElement.dataset.baseUrl ?? ""

    const env = document.documentElement.dataset.env ?? "prod"

    this.dash.listenTo<LogEvent>("log", data => {
      if (!console)
        return
      if (env === "local" || data.level === "error" || data.level === "warn") {
        // eslint-disable-next-line no-console
        if (console[data.level]) {
          // eslint-disable-next-line no-console
          console[data.level](...data.messages)
        } else {
          // eslint-disable-next-line no-console
          console.log(`[${data.level}]`, ...data.messages)
        }
      }
    })

    this.dash.addDashAugmentation(d => {
      return {
        listenToModel: (eventName: EventName, listener: EventCallback, thisArg?: any) => {
          return d.listenTo(this.model, eventName, listener, thisArg)
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

  async connect(): Promise<LoginResult> {
    let info: SessionInfo | undefined

    // First, we try to recover session, if there is an active one.
    try {
      const data = await fetch(`${this.baseUrl}/api/session/current`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      }).then(response => {
        if (!response.ok)
          throw new Error("Unable to get information about user session.")
        return response.json()
      })
      info = data.done ? data.info : undefined
    } catch (err) {
      this.log.warn(err)
    }

    // We show login dialog if session recovering failed.
    return info ?? await this.dash.create(LoginDialog).open()
  }

  async disconnect() {
    try {
      await fetch(`${this.baseUrl}/api/session/disconnect`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      }).then(response => {
        if (!response.ok)
          throw new Error("Unable to make a disconnection request.")
        return response.json()
      }).then(data => {
        if (!data.done)
          throw new Error("Unable to end session.")
        return true
      })
      await this.doCleanup()
    } catch (err) {
      const dialog = this.dash.create(ErrorDialog)
      await dialog.show([
        "Something went wrong. We could not disconnect you.",
        "Please try again."
      ])
    }
  }

  private async doCleanup() {
    if (this.ws)
      closeWsClient(this.ws)
    await this.navigate("") // This prevents the router to show current page at next login.
    document.location.reload(false)
  }

  async showPasswordResetDialog() {
    const dialog = this.dash.create(PasswordRequestDialog)
    try {
      await dialog.open()
    } catch (error) {
      this.log.error(error)
    }
  }

  async start(sessionData: SessionData, ws: WebSocket) {
    const { frontendId } = sessionData

    await this.initModel(sessionData)

    this.registerWs(ws, frontendId)
    // TODO: the 'error' event is not fired when the server is down. Use the close event and its code instead.
    ws.addEventListener("error", ev => {
      this.log.error("Error with websocket client:", ev)
      initWsClient().then(newWs => {
        this.log.debug("Websocket recreated with success.")
        this.registerWs(newWs, frontendId)
      }).catch(() => {
        this.log.error("Error while attempting to recreate websocket.")
        // TODO: add a flashing button beside BgManager that asks to refresh the page.
      })
    })
    ws.addEventListener("close", ev => this.log.debug("ws closed", ev))

    const appEl = document.querySelector(".js-app")

    if (appEl) {
      removeAllChildren(appEl)
      this.appFrame = this.dash.create(AppFrame)
      appEl.appendChild(this.appFrame.el)
    }
  }

  private registerWs(ws: WebSocket, frontendId: string) {
    this.ws = ws
    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data.modelUpd && data.frontendId !== frontendId)
          this.model.processModelUpdate(data.modelUpd)
      } catch (error) {
        this.log.error("Received bad JSON from ws server:", ev.data)
      }
    })
  }

  private async initModel(sessionData: SessionData) {
    this._model = this.dash.create(ModelComp, sessionData)

    const modelDash = this.dash.getPublicDashOf(this.model)

    modelDash.unmanagedListeners.on<UpdateModelEvent | ReorderModelEvent>("change", data => {
      if ("orderedIds" in data)
        this.log.debug(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        this.log.debug(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandAdded", data => {
      this.log.debug(`[BG] Add: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandDone", data => {
      this.log.debug(`[BG] Done: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandError", data => {
      this.log.debug(`[BG] Error: ${data.label}`, data.errorMessage)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("processing", data => {
      this.log.debug(`[PROCESSING] start ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("endProcessing", data => {
      this.log.debug(`[PROCESSING] end ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    await this.model.global.loading
  }
}
