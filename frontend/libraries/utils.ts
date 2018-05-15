/**
 * Check if two arrays have the same content.
 * @see {@link http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/19746771#19746771}
 */
export function equal<T>(a: Array<T>, b: Array<T>): boolean {
  return (a.length === b.length && a.every((v, i) => {
    return v === b[i]
  }))
}

/**
 * Remove all children of a HTMLElement.
 *
 * @see{@link https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript}
 * @param el
 */
export function removeAllChildren(el: HTMLElement) {
  while (el.firstChild)
    el.removeChild(el.firstChild)
}

export function catchAndLog<C extends (...args: any[]) => any>(cb: C): C {
  return ((...args: any[]) => {
    try {
      let res = cb(...args)
      if (res && typeof res.then === "function" && typeof res.catch === "function") {
        res = res.catch(err => {
          console.log("[catchAndLog async]", err)
        })
      }
      return res
    } catch (err) {
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
  let rgx = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return email.match(email) !== null
}
