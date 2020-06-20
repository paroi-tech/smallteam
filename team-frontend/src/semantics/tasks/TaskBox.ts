import handledom from "handledom"
import { removeAllChildren } from "../../../../shared-ui/libraries/utils"
import { OwnDash } from "../../AppFrame/OwnDash"
import { Model, TaskModel } from "../../AppModel/AppModel"
import { Box } from "../../generics/BoxList"
import AccountAvatar from "../accounts/AccountAvatar"
import TaskFlag from "./TaskFlag"

// tslint:disable-next-line: no-unused-expression
scss`
@import "../shared-ui/theme/definitions";

.TaskBox {
  background-color: #e9efff;
  height: 76px;
  padding-bottom: 24px;
  position: relative;

  &-top {
    padding: 5px;
  }

  &-openBtn {
    background-color: #f9f9f9;
    height: 40px;
    position: absolute;
    right: 4px;
    top: 5px;
    width: 21px;
  }

  &-bottom {
    bottom: 0;
    height: 24px;
    padding: 1px 8px 0 6px;
    position: absolute;
    width: 100%;
    &::before {
      border-top: 1px solid #FFF;
      content: "";
      left: 6px;
      position: absolute;
      right: 6px;
      top: 0;
    }
  }
}

.TaskBoxBottom {
  align-items: center;
  display: flex;
  justify-content: space-between;
  * {
    margin: 0px;
    vertical-align: middle;
  }
}

.TaskCommentCounter {
  background-color: #051d41;
  border-radius: 50%;
  color: #fff;
  display: inline-block;
  font-family: monospace;
  font-size: $f11;
  font-weight: bold;
  height: 16px;
  line-height: 16px;
  text-align: center;
  width: 16px;
}
`

const template = handledom`
<div class="TaskBox">
  <div class="TaskBox-top">
    <span h="lbl"></span>
    <button class="TaskBox-openBtn RightOpenBtn" type="button" h="openBtn">▶</button>
  </div>
  <div class="TaskBox-bottom TaskBoxBottom">
    <div class="TaskBoxBottom-col1" h="flags"></div>
    <div class="TaskBoxBottom-col2">
      <span class="TaskCommentCounter" title="Number of comments" h="comments"></span>
    </div>
    <div class="TaskBoxBottom-col3" h="avatars"></div>
  </div>
</div>
`

/**
 * Component used to show basic information about a task of a project.
 *
 * A TaskBox emits (through the dash) a `taskBoxSelected` event when a user click on it.
 * The event provides the `TaskModel` that the box represents.
 */
export default class TaskBox implements Box {
  readonly el: HTMLElement
  private flagsEl: HTMLElement
  private avatarsEl: HTMLElement

  private model: Model

  /**
   * Create a new TaskBox.
   * @param dash - the current application dash
   * @param task - the task for which the box is created for
   */
  constructor(private dash: OwnDash, readonly task: TaskModel) {
    this.model = this.dash.app.model

    const { root, ref } = template()
    let labelEl = ref("lbl")

    this.el = root
    labelEl.textContent = this.task.label

    this.avatarsEl = ref("avatars")
    this.addAccountAvatars()

    this.flagsEl = ref("flags")
    this.addTaskFlags()

    let commentsEl = ref("comments")
    commentsEl.textContent = (this.task.commentCount || 0).toString()

    this.dash.listenToModel("updateTask", data => {
      if (data.model === this.task) {
        labelEl.textContent = this.task.label
        removeAllChildren(this.flagsEl)
        this.addTaskFlags()
        removeAllChildren(this.avatarsEl)
        this.addAccountAvatars()
      }
    })

    this.dash.listenToModel("reorderFlag", data => {
      removeAllChildren(this.flagsEl)
      this.addTaskFlags()
    })

    ref("openBtn").addEventListener("click", () => this.dash.emit("taskBoxSelected", this.task))
  }

  get id() {
    return this.task.id
  }

  setWithFocus(focus: boolean) {
    if (focus)
      this.el.classList.add("focus")
    else
      this.el.classList.remove("focus")
  }

  private addAccountAvatars() {
    if (!this.task.affectedToIds)
      return
    for (let accountId of this.task.affectedToIds) {
      let account = this.model.global.accounts.get(accountId)
      if (account) {
        let comp = this.dash.create(AccountAvatar, { account, width: 16, height: 16 })
        this.avatarsEl.appendChild(comp.el)
      }
    }
  }

  private addTaskFlags() {
    if (!this.task.flagIds)
      return
    for (let flagId of this.task.flagIds) {
      let flag = this.model.global.flags.get(flagId)
      if (flag) {
        let flagComp = this.dash.create(TaskFlag, flag)
        this.flagsEl.appendChild(flagComp.el)
      }
    }
  }
}
