import { ErrorDialog, InfoDialog } from "../../../../sharedFrontend/modalDialogs/modalDialogs"
import { OwnDash } from "../../../App/OwnDash"
import { Model, ProjectModel } from "../../../AppModel/AppModel"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import { ViewerController, Workspace } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import ArchivedTaskBoard from "../../tasks/ArchivedTaskBoard/ArchivedTaskBoard"
import OnHoldTaskBoard from "../../tasks/OnHoldTaskBoard/OnHoldTaskBoard"
import TaskBoard from "../../tasks/TaskBoard/TaskBoard"
import ProjectForm from "../ProjectForm/ProjectForm"

export default class ProjectWorkspace implements Workspace {
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
  }

  activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.taskBoard.el)
      .setTitle(this.project.name)
      .setTitleRightEl(this.dropdownMenu.btnEl)
      .showTitleBar(false)
  }

  deactivate() {
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
