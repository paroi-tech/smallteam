import { Request } from "express"
import * as path from "path"
import { conf, dataDir } from "../context"
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
  if (req.subdomains?.length === 1)
    return req.subdomains[0].toLowerCase()
}

export async function getConfirmedSubdomain(reqOrSubdomain: Request | string) {
  const subdomain = typeof reqOrSubdomain === "string" ? reqOrSubdomain : getRequestedSubdomain(reqOrSubdomain)
  if (subdomain && await fileExists(path.join(dataDir, subdomain))) // TODO: Check if it is a directory
    return subdomain
}

export function getSubdirUrl() {
  if (!conf.mode || conf.mode === "singleTeam") {
    const subdirUrl = conf.singleTeam ? conf.singleTeam.subdirUrl : undefined
    return subdirUrl || ""
  }
  return ""
}

export interface BackendContext {
  readonly subdomain?: string
}

export function getTeamSiteUrl(context: BackendContext) {
  const protocol = conf.ssl ? "https" : "http"
  const publicPort = conf.publicPort || conf.port
  const portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  const domain = context.subdomain ? `${context.subdomain}.${conf.domain}` : conf.domain
  return `${protocol}://${domain}${portSuffix}${getSubdirUrl()}`
}

export function getMainDomainUrl() {
  const protocol = conf.ssl ? "https" : "http"
  const publicPort = conf.publicPort || conf.port
  const portSuffix = publicPort === 80 ? "" : `:${publicPort}`
  return `${protocol}://${conf.domain}${portSuffix}${getSubdirUrl()}`
}

/**
 * This template tag does nothing. It is just here to enable IDE support of HTML.
 */
export function html(pieces: TemplateStringsArray, ...variables: unknown[]): string {
  const result: unknown[] = []
  pieces.forEach((piece, i) => {
    result.push(piece)
    if (variables[i])
      result.push(variables[i])
  })
  return result.join("")
}
