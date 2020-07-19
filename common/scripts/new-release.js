const { readFileSync, existsSync, writeFileSync } = require("fs")
const { basename, join, parse, dirname } = require("path")
const { exec } = require("child_process")

let logMessages = []
const appLog = {
  error(message) {
    if (typeof message !== "string" && message instanceof Error)
      message = message.message
    logMessages.push(`\n============\n== [ERROR] ${message}`)
    console.error(message)
  },
  warn(message) {
    logMessages.push(`\n============\n== [WARN] ${message}`)
    console.warn(message)
  },
  info(message) {
    logMessages.push(`\n============\n== [INFO] ${message}`)
    console.info(message)
  },
  message(message) {
    logMessages.push(message)
  }
}

main().catch(err => appLog.error(err))

async function main() {
  const versionBumpMode = process.argv.indexOf("--major") !== -1 ? "major"
    : process.argv.indexOf("--minor") !== -1 ? "minor"
    : "patch"

  appLog.info(`Version bump mode: ${versionBumpMode}`)

  const rootDir = dirname(dirname(__dirname))
  const releaseDir = join(rootDir, "release")
  const mainPackageDir = join(rootDir, "packages", "smallteam")
  const subprojectsDir = join(rootDir, "subprojects")
  const sharedDir = join(subprojectsDir, "shared")
  const frontendDirs = [
    { dir: join(subprojectsDir, "platform-frontend"), name: "platform-frontend" },
    { dir: join(subprojectsDir, "registration-frontend"), name: "registration-frontend" },
    { dir: join(subprojectsDir, "team-frontend"), name: "team-frontend" },
  ]

  const releaseVersion = getPackageVersion(releaseDir)
  let mainPackageVersion = getPackageVersion(mainPackageDir)
  let sharedVersion = getPackageVersion(sharedDir)

  appLog.info("[shared] rushx build")
  await execCommand("rushx build", { cwd: sharedDir })

  if (releaseVersion === mainPackageVersion) {
    appLog.info("[main-package] Bump version")
    mainPackageVersion = bumpPackageVersion(mainPackageDir, versionBumpMode)

    appLog.info("[shared] Bump version")
    sharedVersion = bumpPackageVersion(sharedDir, versionBumpMode)
    setDependencyVersion(mainPackageDir, "@smallteam-local/shared", sharedVersion)
    setDependencyVersion(join(subprojectsDir, "shared-ui"), "@smallteam-local/shared", sharedVersion)
    for (const { dir } of frontendDirs)
      setDependencyVersion(dir, "@smallteam-local/shared", sharedVersion)

    appLog.info("[global] rush update")
    await execCommand("rush update")
  } else {
    appLog.warn(`Release version (${releaseVersion}) is not aligned to the package (${mainPackageVersion}). The release will use the package version.`)
  }

  for (const { dir, name } of frontendDirs) {
    appLog.info(`[${name}] rushx build:prod`)
    await execCommand("rushx build:prod", { cwd: dir })
  }

  appLog.info("[release] pnpm pack shared")
  await execCommand(`pnpm pack ${sharedDir}`, { cwd: releaseDir })
  const sharedTarBallFileName = `smallteam-local-shared-${sharedVersion}.tgz`
  if (!existsSync(join(releaseDir, sharedTarBallFileName)))
    throw new Error(`Missing tarball file: ${sharedTarBallFileName}`)

  appLog.info("[release] pnpm pack main-package")
  await execCommand(`pnpm pack ${mainPackageDir}`, { cwd: releaseDir })
  const mainPackageTarBallFileName = `smallteam-${mainPackageVersion}.tgz`
  if (!existsSync(join(releaseDir, mainPackageTarBallFileName)))
    throw new Error(`Missing tarball file: ${mainPackageTarBallFileName}`)

  appLog.info("[release] Sync local package file names")
  setDependencyVersion(releaseDir, "@smallteam-local/shared", sharedTarBallFileName)
  setDependencyVersion(releaseDir, "smallteam", mainPackageTarBallFileName)
  setPackageVersion(releaseDir, mainPackageVersion)

  const releaseArchiveName = `smallteam-release-${mainPackageVersion}.tar.xz`
  const releaseLogName = `smallteam-release-${mainPackageVersion}.log`
  appLog.info(`[release] Make archive: ${releaseArchiveName}`)

  const files = [
    "config.sample.json",
    "INSTALL.md",
    "package.json",
    sharedTarBallFileName,
    mainPackageTarBallFileName
  ]
  await execCommand(`tar -cJf ${releaseArchiveName} ${files.join(" ")}`, { cwd: releaseDir })
  writeLogFileSync(join(releaseDir, releaseLogName))
}

function bumpPackageVersion(packageDir, versionBumpMode) {
  const jsonFile = join(packageDir, "package.json")
  let content = readFileSync(jsonFile, "utf8")

  let newVersion
  let oldVersion
  const regex = /(\"version\"\s*:\s*)\"([a-zA-Z0-9-_\.]+)\"/
  content = content.replace(regex, (_, firstPart, ver) => {
    oldVersion = ver
    newVersion = incrementSemanticVersion(ver, versionBumpMode)
    return `${firstPart}"${newVersion}"`
  })
  if (!newVersion)
    throw new Error(`Missing "version" in file: ${jsonFile}`)

  writeFileSync(jsonFile, content)
  appLog.info(`  ... package version bumped from "${oldVersion}" to "${newVersion}" in: ${fileNameForLog(jsonFile)}`)
  return newVersion
}

function setPackageVersion(packageDir, newVersion) {
  const jsonFile = join(packageDir, "package.json")
  let content = readFileSync(jsonFile, "utf8")

  let oldVersion
  const regex = /(\"version\"\s*:\s*)\"([a-zA-Z0-9-_\.]+)\"/
  content = content.replace(regex, (_, firstPart, ver) => {
    oldVersion = ver
    return `${firstPart}"${newVersion}"`
  })
  if (!newVersion)
    throw new Error(`Missing "version" in file: ${jsonFile}`)

  writeFileSync(jsonFile, content)
  appLog.info(`  ... package version set from "${oldVersion}" to "${newVersion}" in: ${fileNameForLog(jsonFile)}`)
  return newVersion
}

/**
 * @param version {string} "0.1.2-abc"
 */
function incrementSemanticVersion(version, versionBumpMode) {
  const regex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(-[a-zA-Z0-9-_]+)?$/
  const found = version.match(regex)
  if (!found)
    throw new Error(`Cannot parse semantic version: "${version}"`)
  const [, num1Str, num2Str, num3Str, suffix] = found
  let num1 = parseInt(num1Str)
  let num2 = parseInt(num2Str)
  let num3 = parseInt(num3Str)
  if (versionBumpMode === "patch")
    ++num3
  else if (versionBumpMode === "minor") {
    ++num2
    num3 = 0
  }
  else if (versionBumpMode === "major") {
    ++num1
    num2 = 0
    num3 = 0
  }
  return `${num1}.${num2}.${num3}${suffix || ""}`
}

function setDependencyVersion(packageDir, dependencyName, newVersion) {
  const jsonFile = join(packageDir, "package.json")
  const content = readFileSync(jsonFile, "utf8")

  const jsonKey = escapeRegex(`"${dependencyName}"`)
  const regex = new RegExp(`(${jsonKey}\\s*:\\s*)"([^"]+)"`)

  const newContent = content.replace(regex, (_, firstPart) => {
    return `${firstPart}"${newVersion}"`
  })
  if (!newContent === content)
    throw new Error(`Missing dependency "${dependencyName}" in file: ${jsonFile}`)

  writeFileSync(jsonFile, newContent)
  appLog.info(`  ... dependency "${dependencyName}" version set to "${newVersion}" in: ${fileNameForLog(jsonFile)}`)
}

function getPackageVersion(packageDir) {
  const jsonFile = join(packageDir, "package.json")
  const content = JSON.parse(readFileSync(jsonFile))
  if (!content.version)
    throw new Error(`Missing "version" in: ${jsonFile}`)
  return content.version
}

/**
 * @see https://stackoverflow.com/a/3561711/3786294
 */
function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
}

function fileNameForLog(file) {
  const { base, dir } = parse(file)
  const parent = basename(dir)
  return `${parent}/${base}`
}

function execCommand(command, options) {
  return new Promise((resolve, reject) => {
    const child = exec(command, options)

    child.stdout.setEncoding("utf8")
    child.stdout.on("data", data => {
      appLog.message(data.toString())
    })

    let errorMessages = []
    child.stderr.setEncoding("utf8")
    child.stderr.on("data", data => {
      errorMessages.push(data.toString())
    })

    child.on("close", code => {
      if (code !== 0) {
        errorMessages.unshift(`The command returned with code ${code}`)
        reject(new Error(errorMessages.join("")))
      } else {
        if (errorMessages.length > 0)
          appLog.message(errorMessages.join(""))
        resolve()
      }
    })
  })
}

function writeLogFileSync(file) {
  writeFileSync(file, logMessages.join("\n") + "\n")
}