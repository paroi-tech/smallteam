import { startWebServer } from "./webServer"
import { initConnection, initMediaEngine } from "./utils/dbUtils"

process.on("uncaughtException", err => {
  console.log("uncaughtException", err)
  process.exit(1)
})

process.on("unhandledRejection", err => {
  console.log("unhandledRejection", err)
  process.exit(1)
})

async function startup() {
  await initConnection()
  await initMediaEngine()
  startWebServer()
}

startup().catch(console.log)
