import { Dash, Bkb, Component } from "bkb"
import App from "../App/App"
import { Menu, MenuItem } from "../Menu/Menu"
import { DropdownMenu } from "../DropdownMenu/DropdownMenu"
import ProjectWorkspace from "../ProjectWorkspace/ProjectWorkspace"
import ProjectForm from "../ProjectForm/ProjectForm"
import StepTypeWorkspace from "../StepTypeWorkspace/StepTypeWorkspace"
import ContributorWorkspace from "../ContributorWorkspace/ContributorWorkspace"
import { Model, ProjectModel, TaskModel } from "../AppModel/AppModel"
import { render } from "monkberry"
import * as template from "./workspaceviewer.monk"
import { removeAllChildren } from "../libraries/utils";

// const template = require("html-loader!./panelselector.html")

/**
 * Properties required for an Component in order to be displayed in PanelSelector.
 */
export interface Workspace {
  activate(ctrl: ViewerController): void
  deactivate(): void
}

export interface ViewerController {
  setMenuLabel(label: string): this
  setTitle(title: string): this
  setContentEl(el: HTMLElement): this
  setSidebarEl(el: HTMLElement): this
}

interface WorkspaceInfo {
  w: Workspace
  path: string
  menu: "main" | "dropdown"
  defaultTitle: string
}

// /**
//  * Several types of components are displayed in the WorkspaceViewer.
//  *
//  * We store data about components currently displayed in the WorkspaceViewer. For now, we display
//  * four types of components in the PanelSelector:
//  *    - ProjectWorkspace
//  *    - ProjectForm
//  *    - StepsTypePanel
//  *    - ContributorPanel
//  */
// interface WorkspaceInfo {
//   workspace?: Workspace
//   projectModel?: ProjectModel
//   type: typeof ProjectWorkspace | typeof ProjectForm | typeof StepTypeWorkspace | typeof ContributorWorkspace
// }


export default class PanelSelector {
  readonly el: HTMLElement

  private model: Model
  private menu: Component<Menu>
  private dropdownMenu: Component<DropdownMenu>
  private currentWInfo: WorkspaceInfo | undefined

  private workspaces = new Map<string, WorkspaceInfo>()

  private view: MonkberryView

  private h1El: HTMLElement
  private sidebarEl: HTMLElement
  private bodyEl: HTMLElement

  /**
   * Create a new WorkspaceViewer.
   *
   * @param dash
   */
  constructor(private dash: Dash<App>) {
    this.model = dash.app.model
    this.el = this.createView()

    this.dash.listenTo<string>(this.menu, "select").call("dataFirst", path => this.activateWorkspace(path))
    this.dash.listenTo<string>(this.dropdownMenu, "select").call("dataFirst", path => this.activateWorkspace(path))
  }

  public addWorkspace(path: string, menu: "main" | "dropdown", menuLabel: string, w: Workspace) {
    this.workspaces.set(path, { w, path, menu, defaultTitle: menuLabel })
    if (menu === "main") {
      this.menu.addItem({
        id: path,
        label: menuLabel
      })
    } else {
      this.dropdownMenu.addItem({
        id: path,
        label: menuLabel
      })
    }
  }

  private activateWorkspace(path: string) {
    let info = this.workspaces.get(path)
    if (!info)
      throw new Error(`Unknown workspace path: ${path}`)
    if (this.currentWInfo) {
      this.currentWInfo.w.deactivate()
      this.h1El.textContent = info.defaultTitle
      removeAllChildren(this.bodyEl)
      removeAllChildren(this.sidebarEl)
    }
    info.w.activate(this.createViewController(info))
    this.currentWInfo = info
  }

  private createViewController(info: WorkspaceInfo): ViewerController {
    let obj = {
      setMenuLabel: (label: string) => {
        if (info.menu === "main")
          this.menu.setItemLabel(info.path, label)
        else
          this.dropdownMenu.setItemLabel(info.path, label)
        return obj
      },
      setTitle: (title: string) => {
        this.h1El.textContent = title
        return obj
      },
      setContentEl: (el: HTMLElement) => {
        removeAllChildren(this.bodyEl)
        this.bodyEl.appendChild(el)
        return obj
      },
      setSidebarEl: (el: HTMLElement) => {
        removeAllChildren(this.sidebarEl)
        this.sidebarEl.appendChild(el)
        return obj
      }
    }
    return obj
  }

  private createView() {
    let wrapperEl = document.createElement("div")
    this.view = render(template, wrapperEl)

    this.h1El = this.view.querySelector(".js-h1")
    this.sidebarEl = this.view.querySelector(".js-sidebar")
    this.bodyEl = this.view.querySelector(".js-body")

    this.menu = this.dash.create(Menu)
    this.view.querySelector(".js-menu-left").appendChild(this.menu.el)

    this.dropdownMenu = this.dash.create(DropdownMenu, {
      args: ["right"]
    })
    this.view.querySelector(".js-menu-right").appendChild(this.dropdownMenu.el)

    return wrapperEl
  }

  // /**
  //  * Show the board of a given project.
  //  *
  //  * @param projectId the ID of the project which board has to be shown
  //  */
  // private showProjectWorkspace(projectId: string) {
  //   let workspaceId = "ProjectWorkspace" + ":" + projectId
  //   let info = this.workspaceMap.get(workspaceId)
  //   if (!info)
  //     throw new Error(`Unknown project panel ID: ${projectId} in PanelSelector.`)
  //   if (!info.workspace) {
  //     info.workspace = this.dash.create(ProjectWorkspace, {
  //       args: [ info.projectModel ]
  //     })
  //     this.bodyEl.appendChild(info.workspace.el)
  //   }
  //   this.setCurrentWorkspace(info.workspace)
  // }

  // /**
  //  * Show the project form in the PanelSelector.
  //  *
  //  * @param project
  //  */
  // private showProjectForm(project?: ProjectModel) {
  //   this.projectForm.setProject(project)
  //   this.setCurrentWorkspace(this.projectForm)
  // }

  // /**
  //  * Display a setting workspace.
  //  * Setting workspaces are:
  //  *  - StepTypeWorkspace
  //  *  - ContributorWorkspace
  //  * @param panelId
  //  */
  // private showSettingWorksapce(panelId: string) {
  //   let info = this.workspaceMap.get(panelId)
  //   if (!info)
  //     throw new Error(`Unknown setting workspace id: ${panelId}`)
  //   if (!info.workspace) {
  //     if (info.type === StepTypeWorkspace) {
  //       info.workspace = this.dash.create<StepTypeWorkspace>(info.type)
  //       this.bodyEl.appendChild(info.workspace.el)
  //     } else if (info.type === ContributorWorkspace) {
  //       info.workspace = this.dash.create<ContributorWorkspace>(info.type)
  //       this.bodyEl.appendChild(info.workspace.el)
  //     } else
  //       throw new Error(`Unknown Workspace type: ${info.type}`)
  //   }
  //   this.setCurrentWorkspace(info.workspace)
  // }
}
