import config from "../../isomorphic/config"
import { Dash, Bkb } from "bkb"
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
import { removeAllChildren } from "../libraries/utils"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { EasyRouter, createEasyRouter, ERQuery, ChildEasyRouter } from "../libraries/EasyRouter"

export interface Workspace {
  activate(ctrl: ViewerController): void
  deactivate(): void
  readonly childRouter?: ChildEasyRouter
}

export interface ViewerController {
  setMenuLabel(label: string): this
  setTitle(title: string): this
  setContentEl(el: HTMLElement): this
  setSidebarEl(el: HTMLElement): this
}

interface WorkspaceInfo {
  workspace: Workspace
  path: string
  menu: "main" | "dropdown"
  defaultTitle: string
}

export default class WorkspaceViewer {
  readonly el: HTMLElement

  private model: Model
  private menu: Menu
  private dropdownMenu: DropdownMenu
  private currentWInfo: WorkspaceInfo | undefined

  private workspaces = new Map<string, WorkspaceInfo>()

  private view: MonkberryView

  private h1El: HTMLElement
  private sidebarEl: HTMLElement
  private bodyEl: HTMLElement

  readonly router: EasyRouter

  constructor(private dash: Dash<App>) {
    this.model = dash.app.model
    this.el = this.createView()

    this.dash.listenToChildren<string>("select").onData(path => this.router.navigate(path).catch(console.log))

    // Handler for project deletion event.
    this.dash.listenTo<UpdateModelEvent>(this.model, "deleteProject").onData(data => {
      let projectId = data.id as string
      let path = `prj-${projectId}`
      let info = this.workspaces.get(path)
      if (info) {
        (info.menu === "main" ? this.menu : this.dropdownMenu).removeItem(info.path)
        this.workspaces.delete(path)
        if (info === this.currentWInfo) {
          removeAllChildren(this.bodyEl)
          removeAllChildren(this.sidebarEl)
          this.h1El.textContent = ""
        }
      }
    })

    this.router = createEasyRouter()
    this.router.addAsyncErrorListener(console.log)
    this.router.mapUnknownRoutes({
      useQueryString: '404',
      activate: (query: ERQuery) => {
        console.log("404", query)
      },
      title: '404 Not Found'
    })
    this.router.map({
      route: "",
      activate: (query: ERQuery) => {
        console.log("MAIN PAGE", query)
      }
    })
  }

  public start() {
    this.router.start({
      baseUrl: config.urlPrefix,
      hashMode: true,
      // noHistory: false,
      firstQueryString: ""
    })
  }

  public addWorkspace(path: string, menu: "main" | "dropdown", menuLabel: string, w: Workspace) {
    this.workspaces.set(path, { workspace: w, path, menu, defaultTitle: menuLabel })
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
    this.router.map({
      route: path,
      activate: (query: ERQuery) => {
        this.activateWorkspace(path)
      },
      title: menuLabel
    })
    if (w.childRouter) {
      this.router.map({
        route: `${path}/*`,
        child: w.childRouter,
        activate: (query: ERQuery) => {
          this.activateWorkspace(path)
        }
      })
    }
  }

  private activateWorkspace(path: string) {
    let info = this.workspaces.get(path)
    if (!info)
      throw new Error(`Unknown workspace path: ${path}`)
    if (this.currentWInfo) {
      this.currentWInfo.workspace.deactivate()
      this.h1El.textContent = info.defaultTitle
      removeAllChildren(this.bodyEl)
      removeAllChildren(this.sidebarEl)
    }
    info.workspace.activate(this.createViewController(info))
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
    let el = document.createElement("div")
    this.view = render(template, el)

    this.h1El = el.querySelector(".js-h1") as HTMLElement
    this.sidebarEl = el.querySelector(".js-sidebar") as HTMLElement
    this.bodyEl = el.querySelector(".js-body") as HTMLElement

    this.menu = this.dash.create(Menu)

    let navLeftEl = el.querySelector(".js-nav-left") as HTMLElement
    navLeftEl.appendChild(this.menu.el)

    this.dropdownMenu = this.dash.create(DropdownMenu, "right")
    let navRightEl = el.querySelector(".js-nav-right") as HTMLElement
    navRightEl.appendChild(this.dropdownMenu.el)

    return el
  }

  public addElementToHeader(el: HTMLElement) {
    let headerEl = this.el.querySelector(".js-nav-right") as HTMLElement
    headerEl.insertBefore(el, this.dropdownMenu.el)
  }
}
