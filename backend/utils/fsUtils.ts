import * as fs from "fs"
import { promisify } from "util"

export function fileExists(path: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err)
    });
  })
}

export const readFile = promisify(fs.readFile)
