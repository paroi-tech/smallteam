const { readFileSync, writeFileSync } = require("fs")
const { resolve } = require("path")

const packageJsonFile = resolve(__dirname, "..", "package.json")
let content = readFileSync(packageJsonFile, "utf8")

const report = []

const regex = /\"(@[a-zA-Z0-9-_]+-local\/[^"]+)\":\s*\"([0-9]+\.[0-9]+\.[0-9]+-bundled)\"/g
content = content.replace(regex, (_, packageName, version) => {
  let tarBallName = packageName.startsWith("@")
    ? packageName.substr(1).replace("/", "-")
    : packageName
  tarBallName = `${tarBallName}-${version}.tgz`
  report.push(`Package "${packageName}" is switched to: "${tarBallName}"`)
  return `"${packageName}": "${tarBallName}"`
})

writeFileSync(packageJsonFile, content)

if (report.length === 0)
  console.info("Nothing to replace.")
else
  console.info("Switch bundled packages to tarballs:\n  - " + report.join("\n  - "))
