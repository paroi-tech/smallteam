import { Dash } from "bkb"
import App from "../App/App"
import { Model, TaskModel, CommentModel } from "../AppModel/AppModel"
import { UpdateModelEvent } from "../AppModel/ModelEngine"
import { render } from "monkberry"

export default class TaskCommentEditor {
  readonly el: HTMLElement

  private view: MonkberryView

  private model: Model
  private task: TaskModel | undefined = undefined

  constructor(private dash: Dash<App>) {
    this.model = this.dash.app.model
  }
}
