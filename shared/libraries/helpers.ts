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
    // console.log("+++", entry[Symbol.toStringTag], entry.values())
    let list: any[] = ["SET"]
    for (let val of entry.values()) {
      if (val && (val[Symbol.toStringTag] === "Map" || val[Symbol.toStringTag] === "Set"))
        val = toDebugObj(val)
      list.push(val)
    }
    return list
  }
}

export function toTitleCase(str: string) {
  // See https://love2dev.com/blog/javascript-touppercase-tolowercase/
  return str.replace(/\w+/g, w => w.charAt(0).toLocaleUpperCase() + w.substr(1))
}

export function whyNewPasswordIsInvalid(password: string): string | undefined {
  if (password.length < 8)
    return "A password must have at least 8 characters"
}

export function whyTeamSubdomainIsInvalid(subdomain: string): string | undefined {
  if (subdomain.length < 2 || subdomain.length > 16)
    return "A team subdomain must have at least 2 characters and 16 characters at most"

  let regex = /^[0-9a-zA-Z]+(\-[0-9a-zA-Z]+)*$/

  if (!regex.test(subdomain))
    return "A subdomain should only contains alphanumeric characters and dash and should not begin or end with dash."
}

export function whyUsernameIsInvalid(username: string): string | undefined {
  if (username.length < 1)
    return "A username should have at least one character."

  if (/\W/.test(username))
    return "A username can contain only letters, digits and underscore."
}
