import { Dash } from "bkb"
import handledom from "handledom"
import { addCssClass, catchAndLog } from "../../../shared-ui/libraries/utils"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
@import "../shared-ui/theme/definitions";

.DdMenuWrapper {
  position: relative;
}

.NavBtn {
  cursor: pointer;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;

  &.-icon22 {
    position: relative;
    &::before {
      content: "";
      height: 22px;
      margin-top: -11px;
      position: absolute;
      top: 50%;
      width: 22px;
    }
    &.-left {
      padding-left: 34px;
      &::before {
        left: 7px;
      }
    }
    &.-right {
      padding-right: 34px;
      &::before {
        right: 7px;
      }
    }
  }

  &.-leftInner {
    margin-left: 10px;
    padding-left: 47px;
    position: relative;
  }
  &.-rightInner {
    margin-right: 5px;
    padding-right: 47px;
    position: relative;
  }
  &-inner {
    background: no-repeat 50% 50%;
    background-size: contain;
    border-radius: 50%;
    height: 34px;
    margin-top: -17px;
    position: absolute;
    top: 50%;
    width: 34px;
    &.-left {
      left: 5px;
    }
    &.-right {
      right: 5px;
    }
  }

  &.-newProject {
    padding-left: 58px;
    position: relative;
    width: 100%;
    &::before {
      @include bgSprite(-120px, -20px);
      content: "";
      left: 37px;
      height: 16px;
      margin-top: -8px;
      position: absolute;
      top: 50%;
      width: 16px;
    }
  }
}
`

const template = handledom`
<button class="NavBtn" type="button"></button>
`

const innerTemplate = handledom`
<span class="NavBtn-inner"></span>
`

const labelTemplate = handledom`
<span class="NavBtn-lbl"></span>
`

const alertTemplate = handledom`
<b class="NavBtn-alert" hidden></b>
`

const templateWrapper = handledom`
<div class="DdMenuWrapper"></div>
`

export interface NavBtnIcon {
  position: "left" | "right"
  cssClass: string
}

export interface NavBtnInnerEl {
  position: "left" | "right"
  cssClass?: string
}

export interface NavBtnOptions {
  label?: string
  cssClass?: string | string[]
  onClick?: () => void
  canHaveAlert?: boolean
  icon22?: NavBtnIcon
  withWrapper?: boolean
  innerEl?: NavBtnInnerEl
}

export default class NavBtn {
  readonly el: HTMLElement
  readonly btnEl: HTMLButtonElement
  readonly innerEl?: HTMLElement

  private labelEl: HTMLElement
  private alertEl?: HTMLElement

  constructor(private dash: Dash, private options: NavBtnOptions) {
    const altMode = options.canHaveAlert ? "alert" : options.innerEl ? "inner" : undefined
    this.btnEl = template().root as HTMLButtonElement

    if (altMode) {
      if (options.innerEl) {
        this.innerEl = innerTemplate().root
        this.innerEl!.classList.add(`-${options.innerEl.position}`)
        if (options.innerEl.cssClass)
          this.innerEl!.classList.add(options.innerEl.cssClass)
        this.btnEl.classList.add(`-${options.innerEl.position}Inner`)
        this.btnEl.appendChild(this.innerEl)
      }
      this.labelEl = labelTemplate().root
      this.btnEl.appendChild(this.labelEl)
      if (options.canHaveAlert) {
        this.alertEl = alertTemplate().root
        this.btnEl.appendChild(this.alertEl)
      }
    } else {
      this.btnEl.classList.add("NavBtn-lbl")
      this.labelEl = this.btnEl
    }

    if (options.label)
      this.setLabel(options.label)

    if (options.icon22)
      this.btnEl.classList.add("-icon22", `-${options.icon22.position}`, options.icon22.cssClass)

    addCssClass(this.btnEl, options.cssClass)

    if (options.onClick)
      this.btnEl.addEventListener("click", catchAndLog(options.onClick))

    if (options.withWrapper) {
      this.el = templateWrapper().root
      this.el.appendChild(this.btnEl)
    } else
      this.el = this.btnEl
  }

  setAlertCount(count: number) {
    if (!this.alertEl)
      throw new Error(`The button '${this.options.label}' cannot have an alert`)
    this.alertEl.textContent = `${count}`
    this.alertEl.style.display = count === 0 ? "none" : "block"
  }

  setLabel(label: string) {
    this.labelEl.textContent = label
  }

  addCssClass(cssClass: string | string[]) {
    addCssClass(this.el, cssClass)
  }
}
