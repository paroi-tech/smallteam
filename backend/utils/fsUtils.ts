import * as fs from "fs"
import { promisify } from "util"

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
    let m = (mode === undefined ? "default" : mode)
    console.log(`Unable to create directory ${path} with mode ${m}`, err.message)
  }

  return b
}

export const readFile = promisify(fs.readFile)
export const mkdir = promisify(fs.mkdir)
