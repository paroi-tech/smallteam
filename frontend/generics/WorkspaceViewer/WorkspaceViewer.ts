import { Dash } from "bkb"
import { ChildEasyRouter, createEasyRouter, EasyRouter, ERQuery } from "../../libraries/EasyRouter"
import { removeAllChildren } from "../../libraries/utils"
import { render } from "@fabtom/lt-monkberry"
import App from "../../App/App";

const template = require("./WorkspaceViewer.monk")

export interface Workspace {
  activate(ctrl: ViewerController): void
  deactivate(): void
  readonly childRouter?: ChildEasyRouter
}

export interface ViewerController {
  // setMenuLabel(label: string): this
  setTitle(title: string): this
  setContentEl(el: HTMLElement): this
  setTitleRightEl(el: HTMLElement): this
}

interface WorkspaceInfo {
  workspace: Workspace
  path?: string
  menu?: "main" | "dropdown"
  defaultTitle: string
}

export default class WorkspaceViewer {
  readonly el: HTMLElement

  private currentWInfo: WorkspaceInfo | undefined

  private symb404 = Symbol("404")
  private workspaces = new Map<string | Symbol, WorkspaceInfo>()

  private h1El: HTMLElement
  private customMenuPlaceEl: HTMLElement
  private bodyEl: HTMLElement

  readonly router: EasyRouter

  constructor(private dash: Dash<App>) {
    let view = render(template)
    this.el = view.rootEl()
    this.h1El = view.ref("h1")
    this.customMenuPlaceEl = view.ref("customMenu")
    this.bodyEl = view.ref("body")

    this.router = createEasyRouter()
    this.router.addAsyncErrorListener(console.log)
  }

  public start() {
    this.router.start({
      baseUrl: `${this.dash.app.baseUrl}/`,
      hashMode: true,
      // noHistory: false,
      firstQueryString: ""
    })
  }

  public addHomeWorkspace(title: string, w: Workspace, workspacePath?: string) {
    let path = workspacePath || ""
    this.workspaces.set(path, {
      workspace: w,
      path,
      defaultTitle: title
    })
    this.router.map({
      route: path,
      activate: (query: ERQuery) => {
        this.activateWorkspace(path)
      }
    })
  }

  public add404Workspace(title: string, w: Workspace) {
    this.workspaces.set(this.symb404, {
      workspace: w,
      defaultTitle: title
    })
    this.router.mapUnknownRoutes({
      useQueryString: "404",
      activate: (query: ERQuery) => {
        this.activateWorkspace(this.symb404)
      },
      title
    })
  }

  public addWorkspace(path: string, menu: "main" | "dropdown", menuLabel: string, w: Workspace) {
    this.workspaces.set(path, { workspace: w, path, menu, defaultTitle: menuLabel })
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

  public removeWorkspace(path: string) {
    let info = this.workspaces.get(path)
    if (info) {
      this.workspaces.delete(path)
      if (info === this.currentWInfo)
        this.router.navigate("") // Home
    }
  }

  private activateWorkspace(path: string | Symbol, data?: any) {
    let info = this.workspaces.get(path)
    if (!info)
      throw new Error(`Unknown workspace path: ${path}`)
    if (this.currentWInfo) {
      this.currentWInfo.workspace.deactivate()
      this.h1El.textContent = info.defaultTitle
      removeAllChildren(this.bodyEl)
      removeAllChildren(this.customMenuPlaceEl)
    }
    info.workspace.activate(this.createViewController(info))
    this.currentWInfo = info
  }

  private createViewController(info: WorkspaceInfo): ViewerController {
    let obj = {
      setTitle: (title: string) => {
        this.h1El.textContent = title
        return obj
      },
      setContentEl: (el: HTMLElement) => {
        removeAllChildren(this.bodyEl)
        this.bodyEl.appendChild(el)
        return obj
      },
      setTitleRightEl: (el: HTMLElement) => {
        removeAllChildren(this.customMenuPlaceEl)
        this.customMenuPlaceEl.appendChild(el)
        return obj
      }
    }
    return obj
  }
}
