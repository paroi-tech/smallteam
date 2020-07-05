import { Dash } from "bkb"
import handledom from "handledom"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
