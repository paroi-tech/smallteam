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

export function isMainDomain(req: Request) {
  return req.subdomains.length === 0
}

export function getRequestedSubdomain(req: Request) {
  if (req.subdomains.length === 1)
    return req.subdomains[0].toLowerCase()
}

export async function getConfirmedSubdomain(req: Request) {
  let subDomain = getRequestedSubdomain(req)
  if (subDomain && await fileExists(path.join(serverConfig.dataDir, subDomain))) // TODO: Check it is a directory
    return subDomain
}

export function getSubdirUrl() {
  if (!serverConfig.mode || serverConfig.mode === "singleTeam") {
    let subdirUrl = serverConfig.singleTeam ? serverConfig.singleTeam.subdirUrl : undefined
    return subdirUrl || ""
  }
  return ""
}

export interface BackendContext {
  readonly subdomain?: string
}

export function getTeamSiteUrl(context: BackendContext) {
  let protocol = serverConfig.ssl ? "https" : "http"
  let publicPort = serverConfig.publicPort || serverConfig.port
  let portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  let domain = context.subdomain ? `${context.subdomain}.${serverConfig.mainDomain}` : serverConfig.mainDomain
  return `${protocol}://${domain}${portSuffix}${getSubdirUrl()}`
}

export function getMainDomainUrl() {
  let protocol = serverConfig.ssl ? "https" : "http"
  let publicPort = serverConfig.publicPort || serverConfig.port
  let portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  return `${protocol}://${serverConfig.mainDomain}${portSuffix}${getSubdirUrl()}`
}