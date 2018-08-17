import { Request } from "express"
import { fileExists } from "./fsUtils"
import { serverConfig } from "../backendConfig"
import * as path from "path"

export class ValidationError extends Error {
  constructor(...params) {
    super(...params)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ValidationError)
  }
}

export class AuthorizationError extends Error {
  constructor(...params) {
    super(...params)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, AuthorizationError)
  }
}

export async function getSubdomain(req: Request) {
  if (req.subdomains.length !== 1)
    return undefined
  let p = path.join(serverConfig.dataDir, req.subdomains[0]);
  if (!await fileExists(p))
    return undefined
  return req.subdomains[0].toLowerCase()
}
