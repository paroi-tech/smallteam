const { readFileSync, writeFileSync } = require("fs")
const { resolve } = require("path")

const packageJsonFile = resolve(__dirname, "..", "package.json")
let content = readFileSync(packageJsonFile, "utf8")

const report = []

const regex = /\"(@[a-zA-Z0-9-_]+-local\/[^"]+)\":\s*\"[a-zA-Z0-9-_]+-(0\.0\.0-bundled)\.tgz\"/g
content = content.replace(regex, (_, packageName, version) => {
  report.push(`Package "${packageName}" is switched to: "${version}"`)
  return `"${packageName}": "${version}"`
})

writeFileSync(packageJsonFile, content)

if (report.length === 0)
  console.info("Nothing to replace.")
else
  console.info("Switch bundled packages to tarballs:\n  - " + report.join("\n  - "))
