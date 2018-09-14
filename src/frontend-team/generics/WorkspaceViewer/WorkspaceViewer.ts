import { Dash } from "bkb"
import { ChildEasyRouter, createEasyRouter, EasyRouter, ERQuery } from "../../libraries/EasyRouter"
import { render } from "@fabtom/lt-monkberry"
import App from "../../App/App"
import { removeAllChildren } from "../../../sharedFrontend/libraries/utils"

const template = require("./WorkspaceViewer.monk")

export interface Workspace {
  readonly childRouter?: ChildEasyRouter
  activate(ctrl: ViewerController): void
  deactivate(): void
}

export interface ViewerController {
  showTitleBar(show: boolean): this
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

  readonly router: EasyRouter

  private currentWInfo: WorkspaceInfo | undefined

  private symb404 = Symbol("404")
  private workspaces = new Map<string | Symbol, WorkspaceInfo>()

  private h1El: HTMLElement
  private customMenuPlaceEl: HTMLElement
  private bodyEl: HTMLElement

  constructor(private dash: Dash<App>) {
    let view = render(template)
    this.el = view.rootEl()
    this.h1El = view.ref("h1")
    this.customMenuPlaceEl = view.ref("customMenu")
    this.bodyEl = view.ref("body")

    this.router = createEasyRouter()
    this.router.addAsyncErrorListener(err => dash.log.error(err))
    // this.router.addNavigateListener()
  }

  start() {
    this.router.start({
      baseUrl: `${this.dash.app.baseUrl}/`,
      hashMode: true,
      // noHistory: false,
      firstQueryString: ""
    })
  }

  addHomeWorkspace(title: string, w: Workspace, workspacePath?: string) {
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

  add404Workspace(title: string, w: Workspace) {
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

  addWorkspace(path: string, menu: "main" | "dropdown", menuLabel: string, w: Workspace) {
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

  removeWorkspace(path: string) {
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
    this.showTitleBar(true)
    info.workspace.activate(this.createViewController())
    this.currentWInfo = info
  }

  private createViewController(): ViewerController {
    let obj: ViewerController = {
      showTitleBar: (show: boolean) => {
        this.showTitleBar(show)
        return obj
      },
      setTitle: (title: string) => {
        this.showTitleBar(true)
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

  private showTitleBar(show: boolean) {
    if (show)
      this.el.classList.remove("-noTitleBar")
    else {
      this.el.classList.add("-noTitleBar")
      this.el.classList.add("-noTitleBar")
      this.el.classList.add("-noTitleBar")
    }
  }
}
