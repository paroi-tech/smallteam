import { ApplicationDash, Log, LogItem } from "bkb"
import ModelComp, { Model, ProjectModel, Session, SessionData } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import WorkspaceViewer from "../generics/WorkspaceViewer/WorkspaceViewer"
import LoginDialog from "../generics/LoginDialog/LoginDialog"
import BackgroundCommandManager from "../generics/BackgroundCommandManager/BackgroundCommandManager"
import ProjectForm from "../semantics/projects/ProjectForm/ProjectForm"
import StepWorkspace from "../semantics/steps/StepWorkspace/StepWorkspace"
import ContributorWorkspace from "../semantics/contributors/ContributorWorkspace/ContributorWorkspace"
import FlagWorkspace from "../semantics/flags/FlagWorkspace/FlagWorkspace"
import ProjectWorkspace from "../semantics/projects/ProjectWorkspace/ProjectWorkspace"
import HomeWorkspace from "../generics/HomeWorkspace/HomeWorkspace"
import Workspace404 from "../generics/Workspace404/Workspace404"
import config from "../../isomorphic/config"

export default class App {
  readonly log: Log
  private _model: Model
  private viewer?: WorkspaceViewer

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.log
  }

  public get model(): Model {
    if (!this._model)
      throw new Error("The application is still not initialized")
    return this._model
  }

  public async navigate(queryString: string): Promise<void> {
    if (!this.viewer)
      return
    await this.viewer.router.navigate(queryString)
  }

  public async connect(): Promise<SessionData> {
    // First, we try to recover session, if any...
    try {
      let response = await fetch(`${config.urlPrefix}/api/session/recover`, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })

      if (!response.ok)
        this.log.warn("Error. Unable to get a response from server while trying to recover session...")
      else {
        let result = await response.json()

        if (result.done) {
          this.log.info("Session recovered...")
          return {
            contributorId: result.contributorId
          }
        }
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
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      })

      if (!response.ok)
        this.log.warn("Error. Unable to get a response from server while trying to disconnect...")
      else {
        let result = await response.json()

        if (result.done) {
          await this.navigate("") // This prevents the router to show current page next login.
          document.location.reload(false)
        }
      }
    } catch (err) {
      this.log.warn("Unable to disconnect user...")
    }
  }

  public async start(sessionData: SessionData) {
    await this.initModel(sessionData)

    let appEl = document.querySelector(".js-app")

    if (appEl) {
      this.viewer = this.dash.create(WorkspaceViewer)
      this.createWorkspaces(this.viewer)
      this.viewer.start()
      appEl.appendChild(this.viewer.el)

      let bgCommandManager = this.dash.create(BackgroundCommandManager)

      this.viewer.addElementToHeader(bgCommandManager.buttonEl)
    }
  }

  public async restart() {

  }

  private createWorkspaces(viewer: WorkspaceViewer) {
    viewer.addWorkspace("/new-project", "dropdown", "New project", this.dash.create(ProjectForm))
    viewer.addWorkspace("/settings/steps", "dropdown", "Manage steps", this.dash.create(StepWorkspace))
    viewer.addWorkspace("/settings/contributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))
    viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    viewer.add404Workspace("404 Not Found", this.dash.create(Workspace404))
    viewer.addHomeWorkspace("Home", this.dash.create(HomeWorkspace))

    let projects = this.model.global.projects
    for (let p of projects)
      this.addProject(viewer, p)

    this.dash.listenTo<UpdateModelEvent>(this.model, "createProject").onData(
      data => this.addProject(viewer, data.model)
    )

    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteProject").onData(
      data => viewer.removeWorkspace(`/prj-${data.id}`)
    )
  }

  private addProject(viewer: WorkspaceViewer, p: ProjectModel) {
    viewer.addWorkspace(`/prj-${p.id}`, "main", p.code, this.dash.create(ProjectWorkspace, p))
  }

  private async initModel(sessionData: SessionData) {
    this._model = this.dash.create(ModelComp, sessionData)

    this.dash.onData("log", (data: LogItem) => {
      console.log(`[LOG] ${data.type} `, data.messages)
    })

    this.dash.listenTo(this.model, "change").onData(data => {
      if (data.orderedIds)
        console.log(`[MODEL] ${data.cmd} ${data.type}`, data.orderedIds)
      else
        console.log(`[MODEL] ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandAdded").onData(data => {
      console.log(`[BG] Add: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandDone").onData(data => {
      console.log(`[BG] Done: ${data.label}`)
    })

    this.dash.listenTo<BgCommand>(this.model, "bgCommandError").onData(data => {
      console.log(`[BG] Error: ${data.label}`, data.errorMessage)
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "processing").onData(data => {
      console.log(`[PROCESSING] start ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    this.dash.listenTo<UpdateModelEvent>(this.model, "endProcessing").onData(data => {
      console.log(`[PROCESSING] end ${data.cmd} ${data.type} ${data.id}`, data.model)
    })

    await this.model.global.load
  }
}
