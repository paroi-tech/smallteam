import { appLog } from "./context"
import { closeAllConnections, initPlatformCn } from "./utils/dbUtils"
import { startWebServer, stopServer } from "./webServer"


process.on("uncaughtException", error => {
  appLog.error("uncaughtException", error)
  appLog.flushSync()
  process.exit(1)
})

process.on("unhandledRejection", error => {
  appLog.error("unhandledRejection", error)
  appLog.flushSync()
  process.exit(1)
})

process.on("SIGINT", () => stopAll("SIGINT"))
process.on("SIGTERM", () => stopAll("SIGTERM"))

async function stopAll(signal: string) {
  try {
    appLog.info(`Caught ${signal} signal...`)
    setTimeout(() => {
      appLog.info("Application doesn't answer. Exit anyway.")
      appLog.flushSync()
      process.exit(1)
    }, 30000).unref()
    await Promise.all([
      closeAllConnections(),
      stopServer()
    ])
    appLog.info("... ended.")
  } catch (error) {
    appLog.error(error)
  }
  appLog.flushSync()
  process.exit()
}

async function setup() {
  await initPlatformCn()
  await startWebServer()
}

setup().catch(error => {
  appLog.error(error)
  appLog.flushSync()
  process.exit(1)
})
