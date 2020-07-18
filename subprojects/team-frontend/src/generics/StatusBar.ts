import { Dash } from "bkb"
import handledom from "handledom"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.StatusBar {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0 10px;
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
