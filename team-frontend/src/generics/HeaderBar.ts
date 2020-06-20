import { Dash } from "bkb"
import handledom from "handledom"
import NavMenu from "./NavMenu"

// tslint:disable-next-line: no-unused-expression
scss`
.HeaderBar {
  background-color: #e9efff;
  box-shadow: 0 2px 5px #ddd;
  color: #999;
  height: 100%;
  padding: 0 12px;
}
`

const template = handledom`
<section class="HeaderBar FlexBar">
  <div class="Center" h="teamName">
    <img src="logo.png" srcset="logo.png 1x, logo-2x.png 2x" width="150" height="40" alt="SmallTeam"/>
  </div>
</section>
`

export default class HeaderBar {
  readonly el: HTMLElement
  readonly entries: NavMenu

  private teamNameEl: HTMLElement

  constructor(private dash: Dash) {
    const { root, ref } = template()
    this.el = root

    this.teamNameEl = ref("teamName")

    this.entries = dash.create(NavMenu)
    this.el.appendChild(this.entries.el)
  }
}
