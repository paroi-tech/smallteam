// Design requirement: if the user clicks outside a modal dialog, the dialog should be closed.
// To detect click outside the dialog, we check if the coordinates of the mouse lie inside the dialog's rectangle.
// Note: when we click on the dialog backdrop, the event target property corresponds to the dialog element.
export function makeOutsideClickHandlerFor(dialogEl: HTMLDialogElement, cb: () => void) {
  let clickHandler = (ev: MouseEvent) => {
    if (dialogEl.open && ev.target === dialogEl) {
      let rect = dialogEl.getBoundingClientRect()
      if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
        cb()
    }
  }
  document.body.addEventListener("click", clickHandler)
  dialogEl.addEventListener("close", ev => {
    document.body.removeEventListener("click", clickHandler)
  })
}

export { default as ErrorDialog } from "./ErrorDialog/ErrorDialog"
export { default as InfoDialog } from "./InfoDialog/InfoDialog"
export { default as PromptDialog } from "./PromptDialog/PromptDialog"
export { default as QuestionDialog } from "./QuestionDialog/QuestionDialog"
export { default as WarningDialog } from "./WarningDialog/WarningDialog"
