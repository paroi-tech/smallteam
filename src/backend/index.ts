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

async function loadConfiguration() {
  let conf = await loadServerConfig()
  initLog(conf)
}

async function startup() {
  try {
  } catch (err) {
    console.error(err)
    return
  }
  await initDbTeamCn()
  startWebServer()
}

loadConfiguration().then(startup, err => console.error(err)).catch(err => log.error(err))
