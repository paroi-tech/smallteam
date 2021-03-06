import * as fs from "fs"
import { promisify } from "util"
import { appLog } from "../context"

export function fileExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    })
  })
}

export async function createDir(path: string, mode?: number) {
  let b = false

  try {
    await mkdir(path, mode)
    b = true
  } catch (err) {
    appLog.warn(`Unable to create directory ${path} with mode ${mode === undefined ? "default" : mode}`, err.message)
  }

  return b
}

export const readFile = promisify(fs.readFile)
export const mkdir = promisify(fs.mkdir)
