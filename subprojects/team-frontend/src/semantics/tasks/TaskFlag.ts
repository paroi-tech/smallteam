import handledom from "handledom"
import { OwnDash } from "../../AppFrame/OwnDash"
import { FlagModel } from "../../AppModel/AppModel"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.TaskFlag {
  border-radius: 50%;
  display: inline-block;
  height: 16px;
  margin-right: 2px;
  vertical-align: middle;
  width: 16px;
}

.WithTooltip {
  &:before {
    border-radius: 2px;
    box-shadow: 2px 2px 1px silver;
    color: #fff;
    content: attr(data-tooltip);
    font-size: $f12;
    opacity: 0;
    padding: 4px;
    pointer-events: none;
    position: absolute;
    transition: all 0.15s ease;
  }

  &:hover:before {
    background-color: $themeColor;
    margin-top: -24px;
    margin-left: 16px;
    opacity: 1;
  }
}
`

const template = handledom`
<span class="TaskFlag WithTooltip" data-tooltip=""></span>
`

export default class TaskFlag {
  readonly el: HTMLElement

  constructor(private dash: OwnDash, readonly flag: FlagModel) {
    this.el = template().root
    this.el.dataset.tooltip = flag.label
    this.el.style.backgroundColor = flag.color

    this.dash.listenToModel("updateFlag", data => {
      if (data.model.id === this.flag.id) {
        this.el.style.color = this.flag.color
        this.el.dataset.tooltip = this.flag.label
      }
    })
  }
}
