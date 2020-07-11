import { addCssClass, catchAndLog } from "@smallteam-local/shared-ui/libraries/utils"
import { Dash } from "bkb"
import handledom from "handledom"
import NavBtn, { NavBtnOptions } from "./NavBtn"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.NavMenu {
  font-size: $f15;

  & > li {
    display: flex;
    & > * {
      flex: 1;
    }
  }
}
`

const template = handledom`
<ul class="NavMenu FlexBar"></ul>
`

const liTemplate = handledom`
<li></li>
`

export type Direction = "row" | "column" | "rowReverse" | "columnReverse"

export interface NavMenuOptions {
  /**
   * Default value is: "row"
   */
  direction?: Direction
  cssClass?: string | string[]
  btnCssClass?: string | string[]
}

export interface NavMenuButton {
  el: HTMLElement
  addCssClass(cssClass: string | string[]): void
}

export default class NavMenu {
  readonly el: HTMLUListElement

  constructor(private dash: Dash, private options: NavMenuOptions = {}) {
    const { root } = template()
    this.el = root as HTMLUListElement
    if (this.options.direction)
      this.el.classList.add(`-${this.options.direction}`)
    addCssClass(this.el, this.options.cssClass)
    this.el.addEventListener("click", catchAndLog(() => this.dash.emit("click")))
  }

  createNavBtn(...btnOptions: NavBtnOptions[]) {
    this.addItem(...btnOptions.map(options => this.dash.create(NavBtn, options)))
  }

  addItem(...buttons: NavMenuButton[]) {
    for (const btn of buttons) {
      if (this.options.btnCssClass)
        btn.addCssClass(this.options.btnCssClass)
      const li = liTemplate().root
      li.appendChild(btn.el)
      this.el.appendChild(li)
    }
  }
}
