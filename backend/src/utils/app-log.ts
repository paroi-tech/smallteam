/* eslint-disable no-console */
import pino, { DestinationObjectOptions, LoggerOptions } from "pino"
import { promiseToHandle } from "./async-utils"

export interface AppLog {
  error(...messages: any[]): void
  warn(...messages: any[]): void
  info(...messages: any[]): void
  debug(...messages: any[]): void
  trace(...messages: any[]): void
  flushSync(): void
  untilReady: Promise<void>
}

export type AppLogLevel = Exclude<keyof AppLog, "flushSync" | "untilReady">

export interface AppLogOptions {
  /**
   * Default: "info".
   */
  level?: "silent" | AppLogLevel
  /**
   * Omit for stdout.
   */
  file?: string
  prettyPrint?: boolean
}

/**
 * Warning: install pino-pretty in development mode only.
 */
export function createAppLog({ file, level, prettyPrint }: AppLogOptions = {}): AppLog {
  const loggerOpt: LoggerOptions = {
    level: level ?? "info"
  }
  if (prettyPrint) {
    loggerOpt.prettyPrint = {
      "translateTime": "yyyy-mm-dd HH:MM:ss.l",
      "ignore": "hostname,pid"
    }
  }
  const destinationOpt: DestinationObjectOptions = {
    dest: file,
    // minLength: 4096,
    sync: false
  }
  const destination = pino.destination(destinationOpt)

  let ready = false
  const { promise: untilReady, resolve, reject } = promiseToHandle()
  destination.on("error", reject)
  destination.on("ready", () => {
    ready = true
    destination.off("error", reject)
    destination.on("error", (error: unknown) => console.error("[Error in Pino]", error))
    resolve()
  })

  let waitingMessages: any[][] | undefined

  function makeLogFn(level: AppLogLevel) {
    return (...messages: any[]) => {
      if (ready)
        logger[level](messagesToString(messages))
      else {
        if (!waitingMessages) {
          waitingMessages = []
          console.warn("There is something to log before the logger is ready")
          void untilReady.then(() => {
            if (waitingMessages) {
              if (file)
                waitingMessages.forEach(messages => logger[level](messagesToString(messages)))
              waitingMessages = undefined
            }
          })
        }
        console[level](...messages)
        messages.unshift("[DELAYED]")
        waitingMessages.push(messages)
      }
    }
  }

  const logger = pino(loggerOpt, destination)
  console.log(`Application log with level '${loggerOpt.level}' is in: ${file ?? "stdout"}`)

  return {
    error: makeLogFn("error"),
    warn: makeLogFn("warn"),
    info: makeLogFn("info"),
    debug: makeLogFn("debug"),
    trace: makeLogFn("trace"),
    flushSync: () => {
      if (ready)
        destination.flushSync()
      else
        console.warn("Flush is called before the logger is ready.")
    },
    untilReady
  }
}

function messagesToString(messages: unknown[]): string {
  return messages.map(msg => messageToString(msg)).join(" ")
}

function messageToString(msg: unknown, parents: unknown[] = []): string {
  if (parents.includes(msg))
    return "[recursive-ref]"
  if (parents.length > 5)
    return "[too-deep]"
  switch (typeof msg) {
    case "string":
      return msg
    case "number":
    case "bigint":
    case "boolean":
    case "undefined":
    case "symbol":
      return String(msg)
    case "function":
      return `[function ${msg.name}]`
    case "object":
      if (msg === null)
        return "null"
      if (Array.isArray(msg))
        return "[" + msg.map(child => messageToString(child, [...parents, msg])).join(",") + "]"
      if (msg instanceof Error)
        return msg.stack ?? `Error: ${msg.message ?? "-no-message-"}`
      return "{" + Object.entries(msg)
        .map(([key, child]) => `${key}: ${messageToString(child, [...parents, msg])}`)
        .join(",") + "}"
    default:
      return `Unexpected message type: ${typeof msg}`
  }
}