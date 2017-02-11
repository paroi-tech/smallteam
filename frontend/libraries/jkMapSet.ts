
export function newJkMap<K, V>(): Map<K, V> {
  let map = new Map<string, V>()
  return {
    clear: () => map.clear(),
    delete: (key: K) => map.delete(JSON.stringify(key)),
    forEach: (callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) => {
      map.forEach((value: V, key: string) => callbackfn(value, JSON.parse(key), this), thisArg)
    },
    get: (key: K) => map.get(JSON.stringify(key)),
    has: (key: K) => map.has(JSON.stringify(key)),
    set: (key: K, value?: V) => {
      map.set(JSON.stringify(key), value)
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

export function newJkSet<T>(): Set<T> {
  let set = new Set<string>()
  return {
    clear: () => set.clear(),
    delete: (key: T) => set.delete(JSON.stringify(key)),
    forEach: (callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) => {
      set.forEach((key, key2) => callbackfn(JSON.parse(key), JSON.parse(key2), this), thisArg)
    },
    has: (key: T) => set.has(JSON.stringify(key)),
    add: (key: T) => {
      set.add(JSON.stringify(key))
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
    [Symbol.iterator]: this,
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
