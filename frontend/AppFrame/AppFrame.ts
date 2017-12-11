import { Dash } from "bkb"
import { render } from "monkberry"
import App from "../App/App"
import HeaderBar from "../generics/HeaderBar/HeaderBar"
import StatusBar from "../generics/StatusBar/StatusBar"
import Sidebar from "./Sidebar/Sidebar"
import NavBtn, { NavBtnOptions } from "../generics/NavBtn/NavBtn";
import NavMenu from "../generics/NavMenu/NavMenu";
import WorkspaceViewer from "../generics/WorkspaceViewer/WorkspaceViewer";
import ProjectForm from "../semantics/projects/ProjectForm/ProjectForm";
import StepWorkspace from "../semantics/steps/StepWorkspace/StepWorkspace";
import ContributorWorkspace from "../semantics/contributors/ContributorWorkspace/ContributorWorkspace";
import FlagWorkspace from "../semantics/flags/FlagWorkspace/FlagWorkspace";
import SearchWorkspace from "../semantics/tasks/SearchWorkspace/SearchWorkspace";
import Workspace404 from "../generics/Workspace404/Workspace404";
import HomeWorkspace from "../generics/HomeWorkspace/HomeWorkspace";
import ContributorHome from "../semantics/contributors/ContributorHome/ContributorHome";
import { Model } from "../AppModel/modelDefinitions";
import { UpdateModelEvent } from "../AppModel/ModelEngine";
import { ProjectModel } from "../AppModel/AppModel";
import ProjectWorkspace from "../semantics/projects/ProjectWorkspace/ProjectWorkspace";
import BackgroundCommandManager from "../generics/BackgroundCommandManager/BackgroundCommandManager";
import { DropdownMenu, DropdownMenuOptions } from "../generics/DropdownMenu/DropdownMenu";

const template = require("./AppFrame.monk")

export default class AppFrame {
  readonly el: HTMLElement
  readonly viewer: WorkspaceViewer

  private model: Model

  constructor(private dash: Dash<App>) {
    this.model = dash.app.model

    let view = render(template, document.createElement("div"))
    this.el = view.nodes[0] as HTMLButtonElement

    let topEl =  this.el.querySelector(".js-top") as HTMLElement
    topEl.appendChild(this.createHeaderBar().el)

    let bottomEl =  this.el.querySelector(".js-bottom") as HTMLElement
    bottomEl.appendChild(this.createStatusBar().el)

    let sideEl =  this.el.querySelector(".js-side") as HTMLElement
    sideEl.appendChild(this.createSidebar().el)

    this.viewer = this.createWorkspaceViewer()
    let contentEl =  this.el.querySelector(".js-content") as HTMLElement
    contentEl.appendChild(this.viewer.el)
  }

  private createWorkspaceViewer() {
    let viewer = this.dash.create(WorkspaceViewer)
    this.createWorkspaces(viewer)
    viewer.start()
    return viewer
  }

  private createWorkspaces(viewer: WorkspaceViewer) {
    viewer.addWorkspace("/new-project", "dropdown", "New project", this.dash.create(ProjectForm, true))
    viewer.addWorkspace("/settings/steps", "dropdown", "Manage steps", this.dash.create(StepWorkspace))
    viewer.addWorkspace("/settings/contributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))
    viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    viewer.addWorkspace("/search", "dropdown", "Search", this.dash.create(SearchWorkspace))
    viewer.add404Workspace("404 Not Found", this.dash.create(Workspace404))
    viewer.addHomeWorkspace("Home", this.dash.create(HomeWorkspace))

    let w = this.dash.create(ContributorHome, this.model.session.contributor)
    viewer.addHomeWorkspace("Personal space", w, "/settings/my-profile")

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

  private createHeaderBar() {
    let bar = this.dash.create(HeaderBar)

    let notifBtn = this.dash.create(NavBtn, {
      label: "Notifications",
      cssClass: ["WithIcon", "right", "notif"],
      canHaveAlert: true,
      onClick: ev => {
        console.log("Notifications to implement…") // TODO:
      }
    } as NavBtnOptions)
    bar.entries.addItem(notifBtn)


    let settingsBtn = this.dash.create(NavBtn, {
      label: "Settings",
      cssClass: ["WithIcon", "right", "settings"],
      withWrapper: true
    } as NavBtnOptions)
    this.createSettingsMenu(settingsBtn.btnEl)
    bar.entries.addItem(settingsBtn)

    // TODO: Add the menu 'Session'
    return bar
  }

  private createSettingsMenu(btnEl: HTMLElement) {
    let ddMenu = this.dash.create(DropdownMenu, { btnEl } as DropdownMenuOptions)
    ddMenu.entries.createNavBtn(
      {
        label: "New project",
        onClick: async () => this.dash.app.navigate("/new-project")
      },
      {
        label: "Steps",
        onClick: async () => this.dash.app.navigate("/settings/steps")
      },
      {
        label: "Contributors",
        onClick: async () => this.dash.app.navigate("/settings/contributors")
      },
      {
        label: "Flags",
        onClick: async () => this.dash.app.navigate("/settings/flags")
      },
      {
        label: "Search",
        onClick: async () => this.dash.app.navigate("/search")
      }
    )
    // viewer.addWorkspace("/new-project", "dropdown", "New project", this.dash.create(ProjectForm, true))
    // viewer.addWorkspace("/settings/steps", "dropdown", "Manage steps", this.dash.create(StepWorkspace))
    // viewer.addWorkspace("/settings/contributors", "dropdown", "Contributors", this.dash.create(ContributorWorkspace))
    // viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    // viewer.addWorkspace("/search", "dropdown", "Search", this.dash.create(SearchWorkspace))
  }

  private createStatusBar() {
    let bar = this.dash.create(StatusBar)
    // TODO: Fill with background tasks
    let bgCommandManager = this.dash.create(BackgroundCommandManager)
    bar.addItem(bgCommandManager.buttonEl)
    return bar
  }

  private createSidebar() {
    let bar = this.dash.create(Sidebar)
    return bar
  }
}
