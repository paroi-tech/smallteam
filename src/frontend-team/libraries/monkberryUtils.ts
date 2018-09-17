export class CustomHide {
  private node?: HTMLElement

  constructor() {
    this.node = undefined
  }

  bind(node: HTMLElement) {
    this.node = node
  }

  unbind(node) {
    this.node = undefined
  }

  update(value) {
    if (!this.node)
      return
    this.node.hidden = value ? true : false
  }
}
