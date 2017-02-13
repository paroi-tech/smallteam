export function makeJkMap<K, V>(): Map<K, V> {
  let map = new Map<string, V>()
  return {
    clear: () => map.clear(),
    delete: (key: K) => map.delete(orderedJsonStringify(key)),
    forEach: (callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => {
      map.forEach((value: V, key: string) => callbackfn(value, JSON.parse(key), this), thisArg)
    },
    get: (key: K) => map.get(orderedJsonStringify(key)),
    has: (key: K) => map.has(orderedJsonStringify(key)),
    set: (key: K, value?: V) => {
      map.set(orderedJsonStringify(key), value)
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
}

export function makeJkSet<T>(): Set<T> {
  let set = new Set<string>()
  return {
    clear: () => set.clear(),
    delete: (key: T) => set.delete(orderedJsonStringify(key)),
    forEach: (callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) => {
      set.forEach((key, key2) => callbackfn(JSON.parse(key), JSON.parse(key2), this), thisArg)
    },
    has: (key: T) => set.has(orderedJsonStringify(key)),
    add: (key: T) => {
      set.add(orderedJsonStringify(key))
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
}

function makeIterableIterator(makeIterator: () => Iterator<any>, mode: "keyVal" | "key" | "keyKey"): IterableIterator<any> {
  let iter = makeIterator()
  return {
    [Symbol.iterator]: () => makeIterableIterator(makeIterator, mode),
    next: (inputVal?) => {
      let {done, value} = iter.next(inputVal)
      if (value === undefined || value === null)
        return { done, value }
      let valueAsV: any
      if (mode === "key") {
        // console.log("==>v", value)
        valueAsV = JSON.parse(value)
      } else {
        let [key, val] = value
        // console.log("==>k", key)
        if (mode === "keyVal")
          valueAsV = [JSON.parse(key), val]
        else
          valueAsV = [JSON.parse(key), JSON.parse(val)]
      }
      return { done, value: valueAsV }
    }
  }
}

/**
 * Thanks to http://stackoverflow.com/a/35810961/3786294
 */
function orderedJsonStringify(o) {
  return JSON.stringify(Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}));
}