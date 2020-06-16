import { Request } from "express"
import * as path from "path"
import { config } from "../context"
import { fileExists } from "./fsUtils"

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

export function isMainDomain(req: Request) {
  return req.subdomains.length === 0
}

export function getRequestedSubdomain(req: Request) {
  if (req.subdomains.length === 1)
    return req.subdomains[0].toLowerCase()
}

export async function getConfirmedSubdomain(req: Request) {
  let subDomain = getRequestedSubdomain(req)
  if (subDomain && await fileExists(path.join(config.dataDir, subDomain))) // TODO: Check it is a directory
    return subDomain
}

export function getSubdirUrl() {
  if (!config.mode || config.mode === "singleTeam") {
    let subdirUrl = config.singleTeam ? config.singleTeam.subdirUrl : undefined
    return subdirUrl || ""
  }
  return ""
}

export interface BackendContext {
  readonly subdomain?: string
}

export function getTeamSiteUrl(context: BackendContext) {
  let protocol = config.ssl ? "https" : "http"
  let publicPort = config.publicPort || config.port
  let portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  let domain = context.subdomain ? `${context.subdomain}.${config.domain}` : config.domain
  return `${protocol}://${domain}${portSuffix}${getSubdirUrl()}`
}

export function getMainDomainUrl() {
  let protocol = config.ssl ? "https" : "http"
  let publicPort = config.publicPort || config.port
  let portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  return `${protocol}://${config.domain}${portSuffix}${getSubdirUrl()}`
}
