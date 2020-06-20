import ErrorDialog from "../../../../shared-ui/modal-dialogs/ErrorDialog"
import InfoDialog from "../../../../shared-ui/modal-dialogs/InfoDialog"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, ProjectModel } from "../../AppModel/AppModel"
import { DropdownMenu } from "../../generics/DropdownMenu"
import { createCustomMenuBtnEl } from "../../generics/workspaceUtils"
import { ViewerController, Workspace } from "../../generics/WorkspaceViewer"
import { ChildEasyRouter, createChildEasyRouter, ERQuery } from "../../libraries/EasyRouter"
import ArchivedTaskBoard from "../tasks/ArchivedTaskBoard"
import OnHoldTaskBoard from "../tasks/OnHoldTaskBoard"
import TaskBoard from "../tasks/TaskBoard"
import ProjectForm from "./ProjectForm"

// tslint:disable-next-line: no-unused-expression
scss`
.ProjectWorkspace {
  &-header {
    align-items: center;
    background-color: #205081;
    color: white;
    display: flex;
    flex-direction: row;
    font-weight: bold;
    justify-content: flex-start;
    padding: 5px 10px;
    vertical-align: baseline;
  }
}
`

export default class ProjectWorkspace implements Workspace {
  readonly childRouter: ChildEasyRouter

  private dropdownMenu: DropdownMenu
  private taskBoard: TaskBoard
  private onHoldTaskBoard: OnHoldTaskBoard
  private archivedTaskBoard: ArchivedTaskBoard
  private form: ProjectForm

  private model: Model

  private ctrl: ViewerController | undefined

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model

    this.dropdownMenu = this.createDropdownMenu()

    this.taskBoard = this.dash.create(TaskBoard, {
      rootTask: this.project.rootTask,
      dropdownMenu: this.createDropdownMenu()
    })
    this.onHoldTaskBoard = this.dash.create(OnHoldTaskBoard, this.project)
    this.archivedTaskBoard = this.dash.create(ArchivedTaskBoard, this.project)
    this.form = this.dash.create(ProjectForm)
    this.form.setProject(this.project)

    this.childRouter = createChildEasyRouter()
    this.childRouter.addAsyncErrorListener(err => dash.log.error(err))
    this.childRouter.map({
      route: ":task",
      activate: (query: ERQuery) => {
        let taskCode = query.routeParams!.task!
        let task = dash.app.model.findTaskByCode(taskCode)
        if (task)
          this.taskBoard.setTask(task)
      },
      title: "My Profile"
    })
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.taskBoard.el)
      .setTitle(this.project.name)
      .setTitleRightEl(this.dropdownMenu.btnEl)
      .showTitleBar(false)
  }

  private async deleteProject() {
    if (this.project.tasks && this.project.tasks.length !== 0) {
      await this.dash.create(InfoDialog).show("Sorry. The project can not be deleted. It contains tasks.")
      return
    }

    if (!confirm("Are you sure you want to delete this project"))
      return

    try {
      await this.model.exec("delete", "Project", { id: this.project.id })
    } catch (error) {
      await this.dash.create(ErrorDialog).show("Unable to delete project. Try again later.")
    }
  }

  private createDropdownMenu(): DropdownMenu {
    let menu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl(),
      align: "left"
    })
    menu.entries.createNavBtn(
      {
        label: "Edit project",
        onClick: () => {
          if (!this.ctrl)
            return
          this.ctrl.setContentEl(this.form.el)
            .setTitle(`Edit: ${this.project.name}`)
        }
      },
      {
        label: "Show taskboard",
        onClick: () => {
          if (!this.ctrl)
            return
          this.ctrl.setContentEl(this.taskBoard.el)
            .setTitle(this.project.name)
            .showTitleBar(false)
        }
      },
      {
        label: "Delete project",
        onClick: () => this.deleteProject()
      },
      {
        label: "Show on hold tasks",
        onClick: () => {
          if (!this.ctrl)
            return
          this.onHoldTaskBoard.refresh()
          this.ctrl.setContentEl(this.onHoldTaskBoard.el)
          this.ctrl.setTitle(`${this.project.name}: on hold tasks`)
        }
      },
      {
        label: "Show archived tasks",
        onClick: () => {
          if (!this.ctrl)
            return
          this.archivedTaskBoard.refresh()
          this.ctrl.setContentEl(this.archivedTaskBoard.el)
          this.ctrl.setTitle(`${this.project.name}: archived tasks`)
        }
      }
    )
    return menu
  }
}
