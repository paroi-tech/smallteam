import { Dash, Bkb } from "bkb"
import App from "../App/App"
import BoxList, { Box, BoxListParams } from "../BoxList/BoxList"
import { Model, ContributorModel } from "../Model/Model"
import ContributorBox from "../ContributorBox/ContributorBox"
import ContributorForm from "../ContributorForm/ContributorForm"

export default class ContributorPanel {
  readonly el: HTMLElement

  private boxList: BoxList<ContributorBox>
  private form: ContributorForm

  private model: Model

  constructor(private dash: Dash<App>) {

  }

  /**
   * Hide the panel.
   */
  public hide() {
    this.el.style.display = "none"
  }

  /**
   * Make the panel visible.
   */
  public show() {
    this.el.style.display = "block"
  }
}
