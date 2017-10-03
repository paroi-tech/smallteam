import { ApplicationDash, ApplicationBkb, Log, LogItem } from "bkb"
import WorkspaceViewer from "../WorkspaceViewer/WorkspaceViewer"
import ModelComp, { Model, ProjectModel } from "../AppModel/AppModel"
import { BgCommand } from "../AppModel/BgCommandManager"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypeWorkspace from "../StepTypeWorkspace/StepTypeWorkspace"
import ContributorWorkspace from "../ContributorWorkspace/ContributorWorkspace"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import BackgroundCommandManager from "../BackgroundCommandManager/BackgroundCommandManager"
import LoginDialog from "../LoginDialog/LoginDialog"
import FlagWorkspace from "../FlagWorkspace/FlagWorkspace"

export default class App {
  readonly log: Log
  private _model: Model

  constructor(private dash: ApplicationDash<App>) {
    this.log = dash.log
  }

  public get model(): Model {
    if (!this._model)
      throw new Error("The application is still not initialized")
    return this._model
  }

  public connect(): Promise<void> {
    let resolveCb: () => void
    let promise = new Promise<void>(resolve => {
      resolveCb = resolve
    })
    let dialog = this.dash.create(LoginDialog)

    dialog.el.addEventListener("close", function () {
      if (this.returnValue)
        resolveCb()
      else
        console.log("Unsuccessfull login...")
    })
    document.body.appendChild(dialog.el)
    dialog.el.showModal()

    return promise
  }

  public async start() {
    await this.initModel()

    let appEl = document.querySelector(".js-app")

    if (appEl) {
      let viewer = this.dash.create(WorkspaceViewer)

      this.createWorkspaces(viewer)
      appEl.appendChild(viewer.el)

      let bgCommandManager = this.dash.create(BackgroundCommandManager)

      viewer.addElementToHeader(bgCommandManager.buttonEl)
    }
  }

  private createWorkspaces(viewer: WorkspaceViewer) {
    viewer.addWorkspace("createProject", "dropdown", "New project", this.dash.create(ProjectForm))
    viewer.addWorkspace("manageStepTypes", "dropdown", "Manage step types", this.dash.create(StepTypeWorkspace))
    viewer.addWorkspace("manageContributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))
    viewer.addWorkspace("manageFlags", "dropdown", "Flags", this.dash.create(FlagWorkspace))

    let projects = this.model.global.projects
    for (let p of projects)
      this.addProject(viewer, p)

    this.dash.listenTo<UpdateModelEvent>(this.model, "createProject").onData(data => this.addProject(viewer, data.model))
  }

  private addProject(viewer: WorkspaceViewer, p: ProjectModel) {
    viewer.addWorkspace(`prj-${p.id}`, "main", p.code, this.dash.create(ProjectWorkspace, p))
  }

  private async initModel() {
    this._model = this.dash.create(ModelComp)

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

    await this.model.global.load
  }
}
