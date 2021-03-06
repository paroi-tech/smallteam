/**
 * Check if two arrays have the same content.
 * @see {@link http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/19746771#19746771}
 */
export function equal<T>(a: T[], b: T[]): boolean {
  return (a.length === b.length && a.every((v, i) => v === b[i]))
}

/**
 * Remove all children of a HTMLElement.
 *
 * @see{@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
 * @param el
 */
export function removeAllChildren(el: Element) {
  while (el.firstChild)
    el.removeChild(el.firstChild)
}

export function catchAndLog<C extends (...args: any[]) => any>(cb: C): C {
  return ((...args: any[]) => {
    try {
      let res = cb(...args)
      if (res && typeof res.then === "function" && typeof res.catch === "function") {
        res = res.catch(err => {
          // eslint-disable-next-line no-console
          console.log("[catchAndLog async]", err)
        })
      }
      return res
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("[catchAndLog]", err)
    }
  }) as any
}

export function addCssClass(el: HTMLElement, cssClass?: string | string[]) {
  if (!cssClass)
    return
  cssClass = typeof cssClass === "string" ? [cssClass] : cssClass
  el.classList.add(...cssClass)
}

export function validateEmail(email: string) {
  const rgx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return rgx.exec(email) !== null
}

// Design requirement: if the user clicks outside a modal dialog, the dialog should be closed.
// To detect click outside the dialog, we check if the coordinates of the mouse lie inside the dialog's rectangle.
// Note: when we click on the dialog backdrop, the event target property corresponds to the dialog element.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function makeOutsideClickHandlerFor(dialogEl: HTMLDialogElement, cb: () => void) {
  // let clickHandler = (ev: MouseEvent) => {
  //   if (dialogEl.open && ev.target === dialogEl) {
  //     let rect = dialogEl.getBoundingClientRect()
  //     if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom)
  //       cb()
  //   }
  // }

  // document.body.addEventListener("click", clickHandler)
  // dialogEl.addEventListener("close", () => document.body.removeEventListener("click", clickHandler))
}