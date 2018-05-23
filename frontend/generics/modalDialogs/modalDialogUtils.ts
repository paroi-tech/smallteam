// Design requirement: if the user clicks outside a modal dialog, the dialog should be closed.
// To detect click outside the dialog, we check if the coordinates of the mouse lie inside the dialog's rectangle.
// Note: when handling click on the dialog backdrop, the event target property corresponds to the dialog elt.
export function makeOutsideClickHandlerFor(dialogEl: HTMLDialogElement, cb: () => void) {
  let clickHandler = (ev: MouseEvent) => {
    console.log("click detected...")
    if (dialogEl.open && ev.target === dialogEl) {
      let rect = dialogEl.getBoundingClientRect()
      if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
        cb()
    }
  }
  document.body.addEventListener("click", clickHandler)
  dialogEl.addEventListener("close", ev => {
    console.log('removing listener')
    document.body.removeEventListener("click", clickHandler)
  })
}
