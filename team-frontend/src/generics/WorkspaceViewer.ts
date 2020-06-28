import { Dash } from "bkb"
import handledom from "handledom"
import { removeAllChildren } from "../../../shared-ui/libraries/utils"
import App from "../AppFrame/App"
import { ChildEasyRouter, createEasyRouter, EasyRouter } from "../libraries/EasyRouter"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.WorkspaceViewer {
  height: 100%;
  position: relative;

  &-body {
    bottom: 0;
    flex: 1 100%;
    overflow-y: auto;
    position: absolute;
    top: 42px;
    width: 100%;
  }

  &.-noTitleBar &-title {
    display: none;
  }

  &.-noTitleBar &-body {
    top: 0;
  }
}

.CustomMenuBtn {
  background: #5584ff;
  color: #fff;
  font-size: $f13;
  height: 20px;
  text-align: center;
  width: 20px;
}
`

const template = handledom`
<section class="WorkspaceViewer">
  <header class="WorkspaceViewer-title TitleBar" h="titleBar">
    <div class="Row">
      <h1 h="h1"></h1>
      <span class="DropdownMenuWrapper -asSuffix" h="customMenu"></span>
    </div>
  </header>
  <div class="WorkspaceViewer-body" h="body"></div>
</section>
`

export interface Workspace {
  readonly childRouter?: ChildEasyRouter
  activate(ctrl: ViewerController): void
  deactivate?(): void
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
  private workspaces = new Map<string | symbol, WorkspaceInfo>()

  private h1El: HTMLElement
  private customMenuPlaceEl: HTMLElement
  private bodyEl: HTMLElement

  constructor(private dash: Dash<App>) {
    dash.exposeEvent("navigate")

    const { root, ref } = template()
    this.el = root
    this.h1El = ref("h1")
    this.customMenuPlaceEl = ref("customMenu")
    this.bodyEl = ref("body")

    this.router = createEasyRouter()
    this.router.addAsyncErrorListener(err => dash.log.error(err))
    this.router.addNavigateListener(query => {
      dash.emit("navigate", query)
    })
  }

  start() {
    void this.router.start({
      baseUrl: `${this.dash.app.baseUrl}/`,
      hashMode: true,
      // noHistory: false,
      firstQueryString: ""
    })
  }

  addHomeWorkspace(title: string, w: Workspace, workspacePath?: string) {
    const path = workspacePath || ""
    this.workspaces.set(path, {
      workspace: w,
      path,
      defaultTitle: title
    })
    this.router.map({
      route: path,
      activate: () => {
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
      activate: () => {
        this.activateWorkspace(this.symb404)
      },
      title
    })
  }

  addWorkspace(path: string, menu: "main" | "dropdown", menuLabel: string, w: Workspace) {
    this.workspaces.set(path, { workspace: w, path, menu, defaultTitle: menuLabel })
    this.router.map({
      route: path,
      activate: () => {
        this.activateWorkspace(path)
      },
      title: menuLabel
    })
    if (w.childRouter) {
      this.router.map({
        route: `${path}/*`,
        child: w.childRouter,
        activate: () => {
          this.activateWorkspace(path)
        }
      })
    }
  }

  removeWorkspace(path: string) {
    const info = this.workspaces.get(path)
    if (info) {
      this.workspaces.delete(path)
      if (info === this.currentWInfo)
        void this.router.navigate("") // Home
    }
  }

  private activateWorkspace(path: string | symbol) {
    const info = this.workspaces.get(path)
    if (!info)
      throw new Error(`Unknown workspace path: ${typeof path === "string" ? path : "(symbol)"}`)
    if (this.currentWInfo) {
      if (this.currentWInfo.workspace.deactivate)
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
    const obj: ViewerController = {
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
    else
      this.el.classList.add("-noTitleBar")
  }
}
