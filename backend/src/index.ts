import { loadServerConfig } from "./context"
import { initDbTeamCn } from "./utils/dbUtils"
import { initLog, log } from "./utils/log"
import { startWebServer } from "./webServer"

process.on("uncaughtException", err => {
  // tslint:disable-next-line:no-console
  console.error("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  // tslint:disable-next-line:no-console
  console.trace("unhandledRejection", err)
  process.exit(1)
})

async function loadConfiguration() {
  let conf = await loadServerConfig()
  initLog(conf)
}

async function startup() {
  try {
    await loadConfiguration()
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err)
    return
  }
  try {
    await initDbTeamCn()
    await startWebServer()
  } catch (err) {
    log.error(err)
  }
}

startup()
