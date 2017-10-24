import { Dash } from "bkb"
import ProjectForm from "../ProjectForm/ProjectForm"
import { Workspace, ViewerController } from "../../../generics/WorkspaceViewer/WorkspaceViewer"
import { DropdownMenu } from "../../../generics/DropdownMenu/DropdownMenu";
import TaskBoard from "../../tasks/TaskBoard/TaskBoard";
import { Model, ProjectModel } from "../../../AppModel/AppModel";
import App from "../../../App/App";

const menuItems = [
  {
    id: "editProject",
    label: "Edit project"
  },
  {
    id: "showTaskBoard",
    label: "Show taskboard"
  },
  {
    id: "showOnHoldTasks",
    label: "Show on hold tasks"
  },
  {
    id: "showArchivedTasks",
    label: "Show archived tasks"
  },
  {
    id: "deleteProject",
    label: "Delete project"
  }
]

export default class ProjectWorkspace implements Workspace {
  private dropdownMenu: DropdownMenu
  private taskBoard: TaskBoard
  private form: ProjectForm

  private model: Model

  private ctrl: ViewerController | undefined

  /**
   * Create a new project board.
   *
   * @param dash - the current application dash.
   * @param project - the project for which the project board is created.
   */
  constructor(private dash: Dash<App>, readonly project: ProjectModel) {
    this.model = this.dash.app.model
    this.createChildComponents()
    this.listenToChildren()
    this.listenToModel()
  }

  private listenToChildren() {
    this.dash.listenTo(this.dropdownMenu, "select").onData(itemId => {
      switch (itemId) {
        case "editProject":
          if (this.ctrl) {
            this.ctrl.setContentEl(this.form.el)
            this.ctrl.setTitle(`Edit: ${this.project.name}`)
          }
          break;

        case "showTaskBoard":
          if (this.ctrl) {
            this.ctrl.setContentEl(this.taskBoard.el)
            this.ctrl.setTitle(this.project.name)
          }
          break;

        case "deleteProject":
          this.deleteProject()
          break;

        default:
          throw new Error(`Unknown menu event ${itemId}`)
      }
    })
  }

  private async deleteProject() {
    if (this.project.tasks && this.project.tasks.length !== 0) {
      alert("Sorry. The project can not be deleted. It contains tasks.")
      return
    }

    if (!confirm("Are you sure you want to delete this project"))
      return

    try {
      await this.model.exec("delete", "Project", { id: this.project.id })
    } catch (error) {
      alert("Unable to delete project. Try again later.")
    }
  }

  /**
   * Create ProjectWorkspace inner components, i.e. Menu, DropDownMenu, and TaskBoard.
   */
  private createChildComponents() {
    this.dropdownMenu = this.dash.create(DropdownMenu, "left")
    this.dropdownMenu.addItems(menuItems)

    this.taskBoard = this.dash.create(TaskBoard, this.project.rootTask)

    this.form = this.dash.create(ProjectForm)
    this.form.setProject(this.project)
  }

  /**
   * Listen to model events.
   *
   * Handled event are:
   */
  private listenToModel() {

  }

  public activate(ctrl: ViewerController) {
    this.ctrl = ctrl
    ctrl.setContentEl(this.taskBoard.el)
        .setTitle(this.project.name)
        .setSidebarEl(this.dropdownMenu.el)
  }

  public deactivate() {
  }
}
