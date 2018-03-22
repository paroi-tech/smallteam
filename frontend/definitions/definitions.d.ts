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

/**
 * HTMLDialogELement
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement
 * Thanks to https://gist.github.com/jbmoelker/226594f195b97bf61436
 */
interface HTMLDialogElement extends HTMLElement {
  /**
   * Reflects the open HTML attribute,
   * indicating that the dialog is available for interaction.
   */
  open: boolean;
  /**
   * Gets/sets the return value for the dialog.
   */
  returnValue: string;
  /**
   * Closes the dialog. An optional DOMString may be passed as an argument,
   * updating the returnValue of the the dialog.
   */
  close(returnValue?: string): void
  /**
   * Displays the dialog modelessly, i.e. still allowing interaction with content outside of the dialog.
   * An optional Element or MouseEvent may be passed as an argument,
   * to specify an anchor point to which the dialog is fixed.
   */
  show(): void
  /**
   * Displays the dialog for exclusive interaction, over the top of any other dialogs that might be present.
   * An optional Element or MouseEvent may be passed as an argument,
   * to specify an anchor point to which the dialog is fixed.
   */
  showModal(): void
}
