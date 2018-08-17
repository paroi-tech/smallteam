import { startWebServer } from "./webServer"
import { initServerConfig } from "./backendConfig"
import { initDbTeamCn } from "./utils/dbUtils"

process.on("uncaughtException", err => {
  console.log("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.log("unhandledRejection", err)
  process.exit(1)
})

async function startup() {
  await initServerConfig()
  await initDbTeamCn()

  startWebServer()
}

startup().catch(err => console.log(err))
