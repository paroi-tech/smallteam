require("./_AppFrame.scss")
import { render } from "@tomko/lt-monkberry"
import { OwnDash } from "../App/OwnDash"
import { ProjectModel } from "../AppModel/AppModel"
import { Model } from "../AppModel/modelDefinitions"
import { AccountModel } from "../AppModel/Models/AccountModel"
import BackgroundCommandManager from "../generics/BackgroundCommandManager/BackgroundCommandManager"
import { DropdownMenu } from "../generics/DropdownMenu/DropdownMenu"
import HeaderBar from "../generics/HeaderBar/HeaderBar"
import HomeWorkspace from "../generics/HomeWorkspace/HomeWorkspace"
import InvitationWorkspace from "../generics/invitations/InvitationWorkspace/InvitationWorkspace"
import NavBtn from "../generics/NavBtn/NavBtn"
import StatusBar from "../generics/StatusBar/StatusBar"
import WebhookWorkspace from "../generics/WebhookWorkspace/WebhookWorkspace"
import Workspace404 from "../generics/Workspace404/Workspace404"
import WorkspaceViewer from "../generics/WorkspaceViewer/WorkspaceViewer"
import AccountHome from "../semantics/accounts/AccountHome/AccountHome"
import AccountWorkspace from "../semantics/accounts/AccountWorkspace/AccountWorkspace"
import FlagWorkspace from "../semantics/flags/FlagWorkspace/FlagWorkspace"
import ProjectForm from "../semantics/projects/ProjectForm/ProjectForm"
import ProjectWorkspace from "../semantics/projects/ProjectWorkspace/ProjectWorkspace"
import StepWorkspace from "../semantics/steps/StepWorkspace/StepWorkspace"
import SearchWorkspace from "../semantics/tasks/SearchWorkspace/SearchWorkspace"
import Sidebar from "./Sidebar/Sidebar"

const template = require("./AppFrame.monk")

export default class AppFrame {
  readonly el: Element
  readonly viewer: WorkspaceViewer

  private model: Model
  private sidebar!: Sidebar

  constructor(private dash: OwnDash) {
    this.model = dash.app.model

    let view = render(template, {
      placeholders: {
        top: () => this.createHeaderBar().el,
        bottom: () => this.createStatusBar().el,
        side: () => this.createSidebar().el,
      }
    })

    this.el = view.rootEl()
    this.viewer = this.createWorkspaceViewer()
    view.ref("content").appendChild(this.viewer.el)
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
    viewer.addWorkspace("/settings/accounts", "dropdown", "Accounts", this.dash.create(AccountWorkspace))
    viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    viewer.addWorkspace("/search", "dropdown", "Search", this.dash.create(SearchWorkspace))
    viewer.add404Workspace("404 Not Found", this.dash.create(Workspace404))
    viewer.addHomeWorkspace("Home", this.dash.create(HomeWorkspace))

    if (this.model.session.account.role === "admin") {
      viewer.addWorkspace("/settings/invitations", "dropdown", "Invite accounts", this.dash.create(InvitationWorkspace))
      viewer.addWorkspace("/setting/webhooks", "dropdown", "Manage webhooks", this.dash.create(WebhookWorkspace))
    }

    let w = this.dash.create(AccountHome, this.model.session.account)
    viewer.addHomeWorkspace("Personal space", w, "/settings/my-profile")

    let projects = this.model.global.projects
    for (let p of projects)
      this.addProject(viewer, p)

    this.dash.listenToModel("createProject", data => this.addProject(viewer, data.model))
    this.dash.listenToModel("deleteProject", data => viewer.removeWorkspace(`/prj-${data.id}`))
  }

  private addProject(viewer: WorkspaceViewer, p: ProjectModel) {
    let path = `/prj-${p.id}`
    viewer.addWorkspace(path, "main", p.code, this.dash.create(ProjectWorkspace, p))
    this.sidebar.addProject(p, path)
  }

  private createHeaderBar() {
    let bar = this.dash.create(HeaderBar)

    let notifBtn = this.dash.create(NavBtn, {
      label: "Notifications",
      icon22: {
        position: "right",
        cssClass: "-notif"
      },
      canHaveAlert: true,
      onClick: () => {
        console.log("Notifications to implement...") // TODO:
      }
    })
    bar.entries.addItem(notifBtn)


    bar.entries.addItem(this.createSettingsMenu())
    bar.entries.addItem(this.createSessionMenu())

    return bar
  }

  private createSettingsMenu(): NavBtn {
    let menuBtn = this.dash.create(NavBtn, {
      label: "Settings",
      icon22: {
        position: "right",
        cssClass: "-setting"
      },
      withWrapper: true
    })

    let ddMenu = this.dash.create(DropdownMenu, {
      btnEl: menuBtn.btnEl,
      align: "left"
    })
    ddMenu.entries.createNavBtn(
      {
        label: "Steps",
        onClick: () => this.dash.app.navigate("/settings/steps"),
        icon22: {
          position: "left",
          cssClass: "-step"
        }
      },
      {
        label: "Accounts",
        onClick: () => this.dash.app.navigate("/settings/accounts")
      },
      {
        label: "Flags",
        onClick: () => this.dash.app.navigate("/settings/flags")
      },
      {
        label: "Search",
        onClick: () => this.dash.app.navigate("/search")
      }
    )

    if (this.model.session.account.role === "admin") {
      ddMenu.entries.createNavBtn({
        label: "Invitations",
        onClick: () => this.dash.app.navigate("/settings/invitations")
      })
      ddMenu.entries.createNavBtn({
        label: "Webhooks",
        onClick: () => this.dash.app.navigate("/setting/webhooks")
      })
    }

    // viewer.addWorkspace("/new-project", "dropdown", "New project", this.dash.create(ProjectForm, true))
    // viewer.addWorkspace("/settings/steps", "dropdown", "Manage steps", this.dash.create(StepWorkspace))
    // viewer.addWorkspace("/settings/accounts", "dropdown", "Accounts", this.dash.create(AccountWorkspace))
    // viewer.addWorkspace("/settings/flags", "dropdown", "Flags", this.dash.create(FlagWorkspace))
    // viewer.addWorkspace("/search", "dropdown", "Search", this.dash.create(SearchWorkspace))

    return menuBtn
  }

  private createSessionMenu(): NavBtn {
    let menuBtn = this.dash.create(NavBtn, {
      withWrapper: true,
      innerEl: {
        position: "left"
      }
    })

    updateSessionBtn(menuBtn, this.dash.app.model.session.account)

    this.dash.listenToModel("updateAccount", evData => {
      if (evData.model === this.dash.app.model.session.account)
        updateSessionBtn(menuBtn, this.dash.app.model.session.account)
    })

    let ddMenu = this.dash.create(DropdownMenu, {
      btnEl: menuBtn.btnEl,
      align: "right"
    })
    ddMenu.entries.createNavBtn(
      {
        label: "My profile",
        onClick: () => this.dash.app.navigate("/settings/my-profile"),
        icon22: {
          position: "left",
          cssClass: "-profile"
        }
      },
      {
        label: "Log out",
        onClick: () => this.dash.app.disconnect(),
        icon22: {
          position: "left",
          cssClass: "-logout"
        }
      },
    )

    return menuBtn
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
    this.sidebar = bar
    return bar
  }
}

function updateSessionBtn(menuBtn: NavBtn, account: AccountModel) {
  menuBtn.setLabel(account.name)
  let variant = account.avatar && account.avatar.getVariant("34x34")
  console.log(">> update btn", account.avatar, variant)
  menuBtn.innerEl!.style.backgroundImage = account.avatar ? `url("${variant ? variant.url : undefined}")` : ""
}