export function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function toDebugStr(entry?: Map<any, any> | Set<any>) {
  return JSON.stringify(toDebugObj(entry), null, 2)
}

export function toDebugObj(entry?: Map<any, any> | Set<any>) {
  if (!entry)
    return entry
  if (entry[Symbol.toStringTag] === "Map") {
    let list: any[] = ["MAP"]
    for (let [key, val] of entry) {
      if (val && (val[Symbol.toStringTag] === "Map" || val[Symbol.toStringTag] === "Set"))
        val = toDebugObj(val)
      list.push([key, val])
    }
    return list
  } else {
    //console.log("+++", entry[Symbol.toStringTag], entry.values())
    let list: any[] = ["SET"]
    for (let val of entry.values()) {
      if (val && (val[Symbol.toStringTag] === "Map" || val[Symbol.toStringTag] === "Set"))
        val = toDebugObj(val)
      list.push(val)
    }
    return list
  }
}

export function whyNewPasswordIsInvalid(password: string): string | undefined {
  if (password.length < 8)
    return "A password must have at least 8 characters"
}

export function whyTeamCodeIsInvalid(code: string): string | undefined {
  if (code.length > 16)
    return "A team code must have 16 characters maximum"
}