import {basename} from "path"

/**
 * @returns the file base name without the extension
 */
export function fileBaseName(path: string): string {
  let base = basename(path)
  let dotIndex = base.lastIndexOf(".")
  return dotIndex === -1 ? base : base.substring(0, dotIndex)
}


