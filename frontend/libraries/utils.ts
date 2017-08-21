/**
 * Check if two arrays have the same content.
 * @see {@link http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/19746771#19746771}
 */
export function equal<T>(a: Array<T>, b: Array<T>): boolean {
  return (a.length === b.length && a.every( (v, i) => {
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
