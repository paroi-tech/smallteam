import { Dash, Log } from "bkb"
import ProjectForm from "../ProjectForm/ProjectForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { DropdownMenu, DropdownMenuOptions } from "../../../generics/DropdownMenu/DropdownMenu"
import TaskBoard from "../../tasks/TaskBoard/TaskBoard"
import { Model, ProjectModel } from "../../../AppModel/AppModel"
import App from "../../../App/App"
import { createCustomMenuBtnEl } from "../../../generics/WorkspaceViewer/workspaceUtils"
import InfoDialog from "../../../generics/modal-dialogs/InfoDialog/InfoDialog"
import ErrorDialog from "../../../generics/modal-dialogs/ErrorDialog/ErrorDialog"
import { OwnDash } from "../../../App/OwnDash";

export default class ProjectWorkspace implements Workspace {
  private dropdownMenu: DropdownMenu
  private taskBoard: TaskBoard
  private form: ProjectForm

  private model: Model
  private log: Log

  private ctrl: ViewerController | undefined

  constructor(private dash: OwnDash, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.log = this.dash.log

    this.dropdownMenu = this.dash.create(DropdownMenu, {
        btnEl: createCustomMenuBtnEl(),
        align: "right"
      } as DropdownMenuOptions
    )
    this.dropdownMenu.entries.createNavBtn(
      {
        label: "Edit project",
        onClick: () => {
          if (this.ctrl) {
            this.ctrl.setContentEl(this.form.el)
            this.ctrl.setTitle(`Edit: ${this.project.name}`)
          }
        }
      },
      {
        label: "Show taskboard",
        onClick: () => {
          if (this.ctrl) {
            this.ctrl.setContentEl(this.taskBoard.el)
            this.ctrl.setTitle(this.project.name)
          }
        }
      },
      {
        label: "Delete project",
        onClick: () => this.deleteProject()
      },
      {
        label: "Show on hold tasks",
        onClick: () => {
          console.log("Show on hold tasks not implemented…")
        }
      },
      {
        label: "Show archived tasks",
        onClick: () => {
          console.log("Show archived tasks not implemented…")
        }
      }
    )

    this.taskBoard = this.dash.create(TaskBoard, this.project.rootTask)
    this.form = this.dash.create(ProjectForm)
    this.form.project = this.project
  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.taskBoard.el)
      .setTitle(this.project.name)
      .setTitleRightEl(this.dropdownMenu.btnEl)
  }

  public deactivate() {
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

  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, {
      btnEl: createCustomMenuBtnEl(),
      align: "right"
    } as DropdownMenuOptions)
    this.dropdownMenu.entries.createNavBtn(
      {
        label: "Edit project",
        onClick: () => {
          if (this.ctrl) {
            this.ctrl.setContentEl(this.form.el)
            this.ctrl.setTitle(`Edit: ${this.project.name}`)
          }
        }
      },
      {
        label: "Show taskboard",
        onClick: () => {
          if (this.ctrl) {
            this.ctrl.setContentEl(this.taskBoard.el)
            this.ctrl.setTitle(this.project.name)
          }
        }
      },
      {
        label: "Delete project",
        onClick: () => this.deleteProject()
      },
      {
        label: "Show on hold tasks",
        onClick: () => {
          console.log("Show on hold tasks not implemented…")
        }
      },
      {
        label: "Show archived tasks",
        onClick: () => {
          console.log("Show archived tasks not implemented…")
        }
      }
    )

    this.taskBoard = this.dash.create(TaskBoard, this.project.rootTask)

    this.form = this.dash.create(ProjectForm)
    this.form.project = this.project
  }
}
