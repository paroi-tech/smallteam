import { AppDash, Log, LogEvent, EventName, EventCallback } from "bkb"
import ModelComp, { Model, ProjectModel, Session, SessionData } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import { UpdateModelEvent, ReorderModelEvent } from "../AppModel/ModelEngine"
import WorkspaceViewer from "../generics/WorkspaceViewer/WorkspaceViewer"
import LoginDialog from "../generics/LoginDialog/LoginDialog"
import PasswordResetDialog from "../generics/PasswordResetDialog/PasswordResetDialog"
import ProjectForm from "../semantics/projects/ProjectForm/ProjectForm"
import StepWorkspace from "../semantics/steps/StepWorkspace/StepWorkspace"
import ContributorWorkspace from "../semantics/contributors/ContributorWorkspace/ContributorWorkspace"
import ContributorHome from "../semantics/contributors/ContributorHome/ContributorHome"
import FlagWorkspace from "../semantics/flags/FlagWorkspace/FlagWorkspace"
import ProjectWorkspace from "../semantics/projects/ProjectWorkspace/ProjectWorkspace"
import HomeWorkspace from "../generics/HomeWorkspace/HomeWorkspace"
import Workspace404 from "../generics/Workspace404/Workspace404"
import config from "../../isomorphic/config"
import SearchWorkspace from "../semantics/tasks/SearchWorkspace/SearchWorkspace"
import AppFrame from "../AppFrame/AppFrame"
import InfoDialog from "../generics/modal-dialogs/InfoDialog/InfoDialog"
import WarningDialog from "../generics/modal-dialogs/WarningDialog/WarningDialog"

export default class App {
  readonly log: Log
  private _model!: Model
  private appFrame?: AppFrame

  constructor(private dash: AppDash<App>) {
    this.log = dash.log

    this.dash.listenTo<LogEvent>("log", data => {
      console.log(`[${data.level}]`, ...data.messages)
    })

    this.dash.registerDashAugmentation(d => {
      return {
        listenToModel: (eventName: EventName, listener: EventCallback, thisArg?: any) => {
          return d.listenTo(this._model, eventName, listener, thisArg)
        }
      }
    })
  }

  public async alert(msg: string) {
    await this.dash.create(WarningDialog).show(msg)
  }

  public get model(): Model {
    if (!this._model)
      throw new Error("The application is still not initialized")
    return this._model
  }

  public async navigate(queryString: string): Promise<void> {
    if (!this.appFrame)
      return
    await this.appFrame.viewer.router.navigate(queryString)
  }

  public async connect(): Promise<string | number> {
    // First, we try to recover session, if there is one active...
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/current`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok)
        this.log.warn("Unable to get a response from server while trying to recover session.")
      else {
        let result = await response.json()
        if (result.done)
          return result.contributorId as string
      }
    } catch (err) {
      this.log.warn(err)
    }

    // Show login dialog if session recover failed.
    let dialog = this.dash.create(LoginDialog)
    return await dialog.open()
  }

  public async disconnect() {
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/disconnect`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({})
      })

      if (!response.ok)
        this.log.error("Unable to get a response from server while trying to disconnect...")
      else {
        let result = await response.json()

        if (result.done) {
          await this.navigate("") // This prevents the router to show current page at next login.
          document.location.reload(false)
        } else {
          await this.dash.create(InfoDialog).show("Unable to end session. Please try again.")
        }
      }
    } catch (err) {
      this.log.warn("Unable to disconnect user...")
    }
  }

  public async showPasswordResetDialog() {
    let dialog = this.dash.create(PasswordResetDialog)
    try {
      await dialog.open()
    } catch (error) {
      console.log(error)
    }
  }

  public async start(sessionData: SessionData) {
    await this.initModel(sessionData)

    let appEl = document.querySelector(".js-app")

    if (appEl) {
      this.appFrame = this.dash.create(AppFrame)
      appEl.appendChild(this.appFrame.el)
    }
  }

  private async initModel(sessionData: SessionData) {
    this._model = this.dash.create(ModelComp, sessionData)

    let modelDash = this.dash.getPublicDashOf(this.model)

    modelDash.unmanagedListeners.on<UpdateModelEvent | ReorderModelEvent>("change", data => {
      if ("orderedIds" in data)
        console.log(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandAdded", data => {
      console.log(`[BG] Add: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandDone", data => {
      console.log(`[BG] Done: ${data.label}`)
    })

    modelDash.unmanagedListeners.on<BgCommand>("bgCommandError", data => {
      console.log(`[BG] Error: ${data.label}`, data.errorMessage)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("processing", data => {
      console.log(`[PROCESSING] start ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    modelDash.unmanagedListeners.on<UpdateModelEvent>("endProcessing", data => {
      console.log(`[PROCESSING] end ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    await this.model.global.loading
  }
}
