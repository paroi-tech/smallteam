import { startWebServer } from "./webServer"
import { loadServerConfig } from "./backendConfig"
import { initDbTeamCn } from "./utils/dbUtils"
import { initLog, log } from "./utils/log"

process.on("uncaughtException", err => {
  console.error("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.error("unhandledRejection", err)
  process.exit(1)
})

async function startup() {
  let conf = await loadServerConfig()
  initLog(conf)
  await initDbTeamCn()
  startWebServer()
}

startup().catch(err => log.error(err))
