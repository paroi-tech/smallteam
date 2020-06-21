import { Dash } from "bkb"
import handledom from "handledom"

// tslint:disable-next-line: no-unused-expression
scss`
.StatusBar {
  height: 100%;
}
`

const template = handledom`
<section class="StatusBar"></section>
`

export default class StatusBar {
  readonly el: HTMLElement

  constructor(private dash: Dash) {
    this.el = template().root
  }

  addItem(el: HTMLElement) {
    this.el.appendChild(el)
  }
}
