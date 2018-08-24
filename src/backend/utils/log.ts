import { ServerConfiguration } from "../backendConfig"

let bristol = require("bristol")

export interface Log {
  error(...messages: any[])
  warn(...messages: any[])
  info(...messages: any[])
  debug(...messages: any[])
  trace(...messages: any[])
}

export const log: Log = bristol

export function initLog(conf: ServerConfiguration) {
  for (let targetConf of conf.log) {
    let target
    if (targetConf.target === "file") {
      if (!targetConf.file)
        throw new Error("Log Configuration: The option 'file' is required when target is set to 'file'")
      target = bristol.addTarget("file", {file: targetConf.file})
    } else
      target = bristol.addTarget(targetConf.target)
    target.withLowestSeverity(targetConf.minSeverity).withFormatter(targetConf.formatter || "commonInfoModel")
  }
}
