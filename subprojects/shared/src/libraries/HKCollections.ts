/*
 * Hash Key Collections
 */

export type HKMap<K, V> = Map<K, V>

export type HKSet<T> = Set<T>

export function makeHKMap<K, V>(iterable?: Iterable<[K, V]>): HKMap<K, V> {
  const map = new Map<string, V>()
  const jkMap = {
    clear: () => map.clear(),
    delete: (key: K) => map.delete(stableJsonStringify(key)),
    forEach: (callbackfn: (value: V, key: K, map: HKMap<K, V>) => void, thisArg?: any) => {
      map.forEach((value: V, key: string) => callbackfn(value, JSON.parse(key), this), thisArg)
    },
    get: (key: K) => map.get(stableJsonStringify(key)),
    has: (key: K) => map.has(stableJsonStringify(key)),
    set: (key: K, value: V) => {
      map.set(stableJsonStringify(key), value)
      return this
    },
    get size() {
      return map.size
    },
    get [Symbol.toStringTag]() {
      return map[Symbol.toStringTag]
    },
    [Symbol.iterator]: () => makeIterableIterator(() => map[Symbol.iterator](), "keyVal"),
    entries: () => makeIterableIterator(() => map["entries"](), "keyVal"),
    keys: () => makeIterableIterator(() => map["keys"](), "key"),
    values: () => map.values()
  }
  if (iterable) {
    for (const [key, val] of iterable)
      jkMap.set(key, val)
  }
  return jkMap
}

export function makeHKSet<T>(iterable?: Iterable<T>): HKSet<T> {
  const set = new Set<string>()
  const jkSet = {
    clear: () => set.clear(),
    delete: (key: T) => set.delete(stableJsonStringify(key)),
    forEach: (callbackfn: (value: T, value2: T, set: HKSet<T>) => void, thisArg?: any) => {
      set.forEach((key, key2) => callbackfn(JSON.parse(key), JSON.parse(key2), this), thisArg)
    },
    has: (key: T) => set.has(stableJsonStringify(key)),
    add: (key: T) => {
      set.add(stableJsonStringify(key))
      return this
    },
    get size() {
      return set.size
    },
    get [Symbol.toStringTag]() {
      return set[Symbol.toStringTag]
    },
    [Symbol.iterator]: () => makeIterableIterator(() => set[Symbol.iterator](), "key"),
    entries: () => makeIterableIterator(() => set["entries"](), "keyKey"),
    keys: () => makeIterableIterator(() => set["keys"](), "key"),
    values: () => makeIterableIterator(() => set["keys"](), "key")
  }
  if (iterable) {
    for (const key of iterable)
      jkSet.add(key)
  }
  return jkSet
}

function makeIterableIterator(makeIterator: () => Iterator<any>, mode: "keyVal" | "key" | "keyKey"): IterableIterator<any> {
  const iter = makeIterator()
  return {
    [Symbol.iterator]: () => makeIterableIterator(makeIterator, mode),
    next: (inputVal?) => {
      const {done, value} = iter.next(inputVal)
      if (value === undefined || value === null)
        return { done, value }
      let valueAsV: any
      if (mode === "key") {
        // console.log("==>v", value)
        valueAsV = JSON.parse(value)
      } else {
        const [key, val] = value
        // console.log("==>k", key)
        if (mode === "keyVal")
          valueAsV = [JSON.parse(key), val]
        else {
          const parsed = JSON.parse(key)
          valueAsV = [parsed, parsed]
        }
      }
      return { done, value: valueAsV }
    }
  }
}

// /**
//  * Thanks to http://stackoverflow.com/a/35810961/3786294
//  */
// function stableJsonStringify(o) {
//   if (typeof o !== "object" || Array.isArray(o))
//     return JSON.stringify(o)
//   return JSON.stringify(Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}))
// }

/**
 * Thanks to https://github.com/substack/json-stable-stringify
 */
function stableJsonStringify(obj): string {
  const seen: any[] = []
  const res = (function stringify(parent: any, key: string | number, node: any) {
    const colonSeparator = ":"
    if (node && node.toJSON && typeof node.toJSON === "function")
      node = node.toJSON()
    if (node === undefined)
      return
    if (typeof node !== "object" || node === null)
      return JSON.stringify(node)
    if (Array.isArray(node)) {
      const out: any[] = []
      for (let i = 0; i < node.length; i++)
        out.push(stringify(node, i, node[i]) || JSON.stringify(null))
      return "[" + out.join(",") + "]"
    } else {
      if (seen.indexOf(node) !== -1)
        throw new TypeError("Converting circular structure to JSON")
      seen.push(node)
      const keys = Object.keys(node).sort()
      const out: any[] = []
      for (const key of keys) {
        const value = stringify(node, key, node[key])
        if (value === undefined)
          continue
        out.push(JSON.stringify(key) + colonSeparator + value)
      }
      seen.splice(seen.indexOf(node), 1)
      return "{" + out.join(",") + "}"
    }
  })({ "": obj }, "", obj)
  return res === undefined ? JSON.stringify(undefined) : res
}
