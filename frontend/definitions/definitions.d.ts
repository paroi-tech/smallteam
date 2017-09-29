// declare function require(resource: string): any

declare module "html-loader!*" {
  let html: any
  export default html
}

declare module "*.monk" {
  let template: () => void
  export = template
}

interface MonkberryView {
  update(state: any): void
  querySelector(query: string): HTMLElement | null
  nodes: Node[]
}

declare module "monkberry" {
  let obj: {
    render(tpl: any, el: HTMLElement, opt?: any): MonkberryView
  }
  export = obj
}

declare module "monkberry-directives" {
  let obj: any
  export default obj
}

declare module "monkberry-events" {
}

interface HTMLDialogElement extends HTMLElement { // FIXME: Remove this interface when it'll be implemented in the TS lib
  showModal(): void
  close(): void
}