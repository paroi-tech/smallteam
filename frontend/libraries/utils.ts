/**
 * Check if two arrays have the same content.
 * @see {@link http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/19746771#19746771}
 */
export function equal<T>(a: Array<T>, b: Array<T>): boolean {
  return (a.length === b.length && a.every( (v, i) => {
    return v === b[i]
  }))
}
