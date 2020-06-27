/* eslint-disable */
/* !
 * Public domain
 * © 2016 Paleo; Released under the CC0 License.
 * http://creativecommons.org/publicdomain/zero/1.0/
 * @license
 */

// --
// -- Public interfaces
// --

export interface ERQuery {
  parent?: any
  redirectedFrom?: string | null
  queryString: string | null
  queryHash: string | null
  queryParams: { [index: string]: string } | null
  route?: string | null
  routeParams?: { [index: string]: string | undefined }
  processedQueryString?: string | null
  remainingQueryString?: string | null
  title?: string | null
}

export interface ERRouteActivator {
  /**
   * Required if canActivate is not defined
   */
  route?: string | null
  useQueryString?: string
  redirectTo?: string
  title?: string | ((query: ERQuery) => string | Promise<string>)
  child?: ChildEasyRouter
  canActivate?(query: ERQuery): boolean | Promise<boolean>
  /**
   * This callback is required except if a child router is defined
   */
  activate?(query: ERQuery): void | Promise<void>
  canDeactivate?(): boolean | Promise<boolean>
  deactivate?(): void | Promise<void>
}

export interface ERConfig {
  baseUrl: string
  /**
   * Default is true
   */
  hashMode?: boolean
  /**
   * Default is false
   */
  noHistory?: boolean
  firstQueryString?: string
}

export interface EasyRouter extends Initializer, MinimalRouter, TopRouter {
}

export interface ChildEasyRouter extends Initializer, MinimalRouter {
}

export function createEasyRouter(): EasyRouter {
  return makeProxyObject<EasyRouter>(new Router(), [...ER_COMMON_METHODS, "start"])
}

export function createChildEasyRouter(): ChildEasyRouter {
  return makeProxyObject<ChildEasyRouter>(new Router(), ER_COMMON_METHODS)
}

// --
// -- Private
// --

function makeProxyObject<T>(source, methods: string[]): T {
  const target = {} as T
  for (const method of methods)
    target[method] = (...args) => source[method](...args)
  target["_getSource"] = () => source
  return target
}

function getSourceFromProxy<T>(proxyObject): T {
  return proxyObject["_getSource"]() as any
}

const ER_COMMON_METHODS = [
  "addAsyncErrorListener",
  "addRejectListener",
  "addUnknownRouteListener",
  "map",
  "mapUnknownRoutes",
  "addCanNavigateListener",
  "removeCanNavigateListener",
  "addNavigateListener",
  "removeNavigateListener",
  "navigate",
  "navigateToUnknown",
  "navigateBack",
  "addCanLeaveListener",
  "removeCanLeaveListener",
  "addLeaveListener",
  "removeLeaveListener"
]

// --
// -- Private interfaces
// --

interface Initializer {
  addAsyncErrorListener(cb: (err: any) => void): number
  addRejectListener(cb: (err: any, query?: ERQuery) => void): number
  addUnknownRouteListener(cb: (query: ERQuery) => void): number
  map(...activators: ERRouteActivator[]): this
  mapUnknownRoutes(activator: ERRouteActivator): this
  addCanNavigateListener(cb: (query: ERQuery) => any, onNavRm?: boolean): number
  removeCanNavigateListener(handle: number): void
  addNavigateListener(cb: (query: ERQuery) => void, onNavRm?: boolean): number
  removeNavigateListener(handle: number): void
}

interface MinimalRouter {
  navigate(queryString: string): Promise<boolean>
  navigateToUnknown(): Promise<boolean>
  navigateBack(level?: number): Promise<boolean>
  /**
   * @param cb returns a boolean or a Promise&lt;boolean&gt;
   * @param onNavRm default value is FALSE
   */
  addCanLeaveListener(cb: () => any, onNavRm?: boolean): number
  removeCanLeaveListener(handle: number): void
  /**
   * @param onNavRm default value is FALSE
   */
  addLeaveListener(cb: () => void, onNavRm?: boolean): number
  removeLeaveListener(handle: number): void
}

interface TopRouter {
  start(config: ERConfig): Promise<void>
}

interface ParentRouter {
  fireErrorListeners(type: string, ...args: any[]): void
  parentNavigateToUnknown(changeHist: boolean): Promise<boolean>
}

interface ChildRouter {
  startAsChild(parent: ParentRouter, withHistory: boolean): void
  childNavigate(queryString: string | null | undefined, changeHist: boolean, parentUrl: string, parentQuery: any): Promise<boolean>
  leaveChildRouter(): Promise<boolean>
}

interface CompiledRoute {
  regexp: RegExp
  pNames: string[]
  withStar: boolean
}

interface Route {
  activator: ERRouteActivator
  compiledRoute: CompiledRoute
}

interface MatchingRoute {
  completedQuery: ERQuery
  activator: ERRouteActivator
  compiledRoute?: CompiledRoute | null
}

// --
// -- Router
// --

class Router implements TopRouter, ParentRouter, ChildRouter, MinimalRouter, Initializer {

  private static makeCompletedQuery(query: ERQuery, compiledRoute: CompiledRoute, activator: ERRouteActivator): ERQuery | null {
    const m = compiledRoute.regexp.exec(query.queryString!)
    if (m === null)
      return null
    const params: { [index: string]: string | undefined } = {}
    const pNamesLen = compiledRoute.pNames.length
    let pName: string
    let pVal: string
    let index = 0
    while (index < pNamesLen) {
      pName = compiledRoute.pNames[index]
      pVal = m[++index]
      params[pName] = pVal === undefined ? undefined : decodeURIComponent(pVal)
    }
    const lastIndex = m.length - 1
    const remaining: string | null = lastIndex > pNamesLen ? m[lastIndex] : null
    const processed = remaining ? query.queryString!.slice(0, -remaining.length) : query.queryString
    const completed: ERQuery = {
      queryString: query.queryString,
      queryHash: query.queryHash,
      queryParams: query.queryParams,
      route: activator.route,
      routeParams: params,
      processedQueryString: processed,
      remainingQueryString: remaining,
      title: null
    }
    if (query.parent)
      completed.parent = query.parent
    if (activator.useQueryString) {
      completed.redirectedFrom = completed.queryString
      completed.queryString = activator.useQueryString
    }
    if (Object.freeze)
      Object.freeze(completed)
    return completed
  }

  private static makeFinalQuery(completedQuery: ERQuery, title: string | null): ERQuery {
    if (!title)
      return completedQuery
    const finalQuery: ERQuery = {
      queryString: completedQuery.queryString,
      queryHash: completedQuery.queryHash,
      queryParams: completedQuery.queryParams,
      route: completedQuery.route,
      routeParams: completedQuery.routeParams,
      processedQueryString: completedQuery.processedQueryString,
      remainingQueryString: completedQuery.remainingQueryString,
      title
    }
    if (completedQuery.parent)
      finalQuery.parent = completedQuery.parent
    if (Object.freeze)
      Object.freeze(finalQuery)
    return finalQuery
  }

  private static getDefaultFirstQueryString(config: ERConfig) {
    if (config.hashMode !== false) {
      let hash = window.location.hash
      if (!hash)
        return ""
      if (hash.length >= 1 && hash[0] === "#")
        hash = hash.slice(1)
      return hash
    }
    const path = window.location.pathname
    const baseLen = config.baseUrl.length
    if (path.length <= baseLen)
      return ""
    if (path.slice(0, baseLen) !== config.baseUrl)
      return ""
    return path.slice(baseLen)
  }

  private static compileRoute(route: string): CompiledRoute {
    const pNames: string[] = []
    const withStar = route.length > 0 && route[route.length - 1] === "*"
    if (withStar)
      route = route.slice(0, -1)
    route = route
      .replace(/\(/g, "==par_open==")
      .replace(/\)/g, "==par_close==")
      .replace(/([\/\?&=])?:(\w+)/g, function (_, sep, key) {
        pNames.push(key)
        if (!sep)
          sep = ""
        return sep + "([^\/\\?&=]+)"
      })
      .replace(/==par_open==/g, "(?:")
      .replace(/==par_close==/g, ")?")
      .replace(/\*/g, "\\*")
    if (withStar)
      route += "(.*)"
    return {
      regexp: new RegExp("^" + route + "$"),
      pNames,
      withStar
    }
  }

  // --
  // -- Initialisation
  // --

  // private onAsyncErrCb: (err: any) => void

  private isStarted = false
  private isRoot!: boolean
  private rootBaseUrl!: string
  private rootQSStack!: string[]

  private withHistory!: boolean
  private parent!: ParentRouter
  private children: ChildRouter[] = []

  private routes: Route[] = []
  private unknownActivator!: ERRouteActivator
  private listeners = {}
  private errListeners = {}
  private onNavRmListeners = {}

  private curQuery: ERQuery | null = null
  private curActivator: ERRouteActivator | null = null
  private curChild: ChildRouter | null = null
  private working = false

  start(config: ERConfig): Promise<void> {
    if (this.isRoot !== undefined)
      throw Error("Cannot call start(), the router is " + (this.isRoot ? "already root" : "a child"))
    this.isStarted = true
    this.isRoot = true
    this.rootQSStack = []
    // - Base URL
    this.rootBaseUrl = config.baseUrl
    if (config.hashMode !== false)
      this.rootBaseUrl += "#"
    // - History
    this.withHistory = !config.noHistory
    const firstQueryString = window.history.state || config.firstQueryString || Router.getDefaultFirstQueryString(config)
    if (this.withHistory) {
      window.onpopstate = this.makeOnPopState()
      window.onhashchange = this.makeOnHashChange()
    }
    // - Set children
    for (let i = 0, len = this.children.length; i < len; ++i)
      this.children[i].startAsChild(this, this.withHistory)
    // - Navigate
    return this.doNavigate(firstQueryString, false).then<void>((done: boolean) => {
      if (done) {
        if (this.withHistory && this.curQuery) {
          window.history.replaceState(
            this.curQuery.redirectedFrom || this.curQuery.queryString,
            this.curQuery.title || "",
            this.toUrl(this.curQuery.queryString, null)
          )
        }
      } else
        throw this.callOnRejectCb(Error(`Fail to navigate to the first URL: "${firstQueryString}"`))
    })
  }

  addAsyncErrorListener(cb: (err: any) => void): number {
    return this.doAddErrorListener("asyncError", cb)
  }

  addRejectListener(cb: (err: any, query?: ERQuery) => void): number {
    return this.doAddErrorListener("reject", cb)
  }

  addUnknownRouteListener(cb: (query: ERQuery) => void): number {
    return this.doAddErrorListener("unknownRoute", cb)
  }

  map(...activators: ERRouteActivator[]): this {
    let ra; let compiledRoute
    for (let i = 0, len = activators.length; i < len; ++i) {
      ra = activators[i]
      if (typeof ra.route === "string")
        compiledRoute = Router.compileRoute(ra.route)
      else {
        if (!ra.canActivate)
          throw Error("Missing route: " + JSON.stringify(ra))
        compiledRoute = null
      }
      if (Object.freeze)
        Object.freeze(ra)
      this.routes.push({
        activator: ra,
        compiledRoute
      })
      if (ra.child) {
        const child = getSourceFromProxy<ChildRouter>(ra.child)
        this.children.push(child)
        if (this.isStarted)
          child.startAsChild(this, this.withHistory)
      }
    }
    return this
  }

  mapUnknownRoutes(activator: ERRouteActivator): this {
    if (Object.freeze)
      Object.freeze(activator)
    this.unknownActivator = activator
    return this
  }

  // --
  // -- Public - ParentRouter
  // --

  parentNavigateToUnknown(changeHist: boolean): Promise<boolean> {
    return this.doNavigate(null, changeHist, null, null, true)
  }

  // --
  // -- Public - ChildRouter
  // --

  startAsChild(parent: ParentRouter, withHistory: boolean): void {
    if (this.isRoot)
      throw Error("Cannot call startAsChild() on the root router")
    if (this.parent) {
      if (this.parent !== parent)
        throw Error("Router cannot have several parents")
      return
    }
    this.isStarted = true
    this.parent = parent
    this.isRoot = false
    this.withHistory = withHistory
    // - Set children
    for (let i = 0, len = this.children.length; i < len; ++i)
      this.children[i].startAsChild(this, this.withHistory)
  }

  childNavigate(queryString: string, changeHist: boolean, parentUrl: string, parentQuery: any): Promise<boolean> {
    return this.doNavigate(queryString, changeHist, parentUrl, parentQuery)
  }

  leaveChildRouter(): Promise<boolean> {
    if (!this.curQuery)
      return Promise.resolve(true)
    return this.canLeaveCurrent().then((can: boolean): any => {
      if (!can)
        return false
      return this.setNewQuery(null, null).then(() => true)
    })
  }

  // --
  // -- Public - MinimalRouter
  // --

  navigate(queryString: string): Promise<boolean> {
    return this.doNavigate(queryString, true)
  }

  navigateToUnknown(): Promise<boolean> {
    return this.doNavigate(null, true)
  }

  navigateBack(level = 1): Promise<boolean> {
    if (!this.isRoot)
      throw Error("Method navigateBack() is available for root router only")
    if (level === 0)
      return Promise.resolve<boolean>(true)
    if (level < 0)
      return Promise.resolve<boolean>(false)
    const qs = this.rootQSStack[this.rootQSStack.length - level - 1]
    if (qs === undefined)
      return Promise.resolve(false)
    return this.doNavigate(qs, true)
  }

  addCanLeaveListener(cb: () => any, onNavRm = false): number {
    return this.addListener("canLeave", cb, onNavRm)
  }

  removeCanLeaveListener(handle: number): void {
    return this.removeListener("canLeave", handle)
  }

  addLeaveListener(cb: () => void, onNavRm = false): number {
    return this.addListener("leave", cb, onNavRm)
  }

  removeLeaveListener(handle: number): void {
    return this.removeListener("leave", handle)
  }

  // --
  // -- Public
  // --

  addCanNavigateListener(cb: (query: ERQuery) => any, onNavRm = false): number {
    return this.addListener("canNavigate", cb, onNavRm)
  }

  removeCanNavigateListener(handle: number): void {
    return this.removeListener("canNavigate", handle)
  }

  addNavigateListener(cb: (query: ERQuery) => void, onNavRm = false): number {
    return this.addListener("navigate", cb, onNavRm)
  }

  removeNavigateListener(handle: number): void {
    return this.removeListener("navigate", handle)
  }

  fireErrorListeners(type: string, ...args: any[]) {
    // console.log(`...........${type}`)
    const listeners = this.listeners[type]
    if (listeners === undefined) {
      if (this.parent)
        this.parent.fireErrorListeners(type, ...args)
      return
    }
    for (const k in listeners) {
      if (listeners.hasOwnProperty(k)) {
        try {
          listeners[k](...args)
        } catch (err) {
          if (type !== "asyncError")
            this.fireErrorListeners("asyncError", err)
          else if (typeof console !== "undefined") {
            console.log(err.message, err.stack)
          }
        }
      }
    }
  }

  // --
  // -- Private - Routes
  // --

  private doNavigate(queryString: string | null, changeHist: boolean, parentUrl: string | null = null,
    parentQuery: any = null, alreadyWorking = false): Promise<boolean> {
    if (!alreadyWorking) {
      if (this.working)
        return Promise.resolve<boolean>(false)
      this.working = true
    }
    if (this.isRoot)
      this.rootQSStack.push(queryString!)
    const query = this.makeQuery(queryString!, parentQuery)
    if (this.curQuery && this.curQuery.queryString === query.queryString) {
      this.working = false
      return Promise.resolve<boolean>(true)
    }
    let p = this.canLeaveCurrent()
    p = p.then<boolean>((can: boolean): any => {
      if (!can)
        return false
      return this.searchRoute(query).then<boolean>((matching: MatchingRoute | null): any => {
        if (matching === null)
          return this.parent ? this.parent.parentNavigateToUnknown(changeHist) : false
        return this.fireListeners("canNavigate", matching.completedQuery, true).then((can: boolean): any => {
          if (!can)
            return false
          if (matching.activator.redirectTo)
            return this.doNavigate(matching.activator.redirectTo, changeHist, parentUrl, parentQuery)
          return this.doNavigateToMatching(matching, changeHist, parentUrl)
        })
      })
    })
    if (!alreadyWorking) {
      p = p.then<boolean>((done: boolean) => {
        this.working = false
        return done
      }, (err: any) => {
        this.working = false
        throw err
      })
    }
    return p
  }

  private canLeaveCurrent(): Promise<boolean> {
    const promises: Promise<boolean>[] = []
    if (this.curActivator && this.curActivator.canDeactivate) {
      let can: any
      try {
        can = this.curActivator.canDeactivate()
      } catch (err) {
        this.callOnRejectCb(err, this.curQuery)
        can = false
      }
      if (!can)
        return Promise.resolve(false)
      if (can !== true)
        promises.push(can)
    }
    promises.push(this.fireListeners("canLeave", undefined, true))
    return Promise.all(promises).then<boolean>((arr) => {
      for (let i = 0, len = arr.length; i < len; ++i) {
        if (!arr[i])
          return false
      }
      return true
    })
  }

  private doNavigateToMatching(matching: MatchingRoute, changeHist: boolean, parentUrl: string | null): Promise<boolean> {
    const activator = matching.activator
    const completed = matching.completedQuery
    let p: Promise<boolean>
    // - Case of a child router
    if (activator.child) {
      const child: ChildRouter = getSourceFromProxy<ChildRouter>(activator.child)
      // - Call Unknown route CB
      if (activator === this.unknownActivator)
        this.callUnknownRouteCb(completed)
      // - Call the child router
      if (this.curChild && this.curChild !== child)
        p = this.curChild.leaveChildRouter()
      else
        p = Promise.resolve<boolean>(true)
      return p.then<boolean>((done: boolean): any => {
        if (!done)
          return false
        if (activator.activate) {
          const activated = this.wrapUserCbOnErrorReject(activator.activate, this.curQuery, this.curQuery)
          // return activated ? activated.then(() => true) : true
        }
        const parentUrl = this.toUrl(completed.processedQueryString, null)
        const childQS = completed.remainingQueryString
        return child.childNavigate(childQS, changeHist, parentUrl, completed).then((done: boolean): any => {
          this.curChild = child
          if (done)
            return this.setNewQuery(completed, activator).then(() => done)
          return done
        })
      })
    }
    // - Switch to the new route
    if (this.curChild) {
      p = this.curChild.leaveChildRouter()
      this.curChild = null
    } else
      p = Promise.resolve<boolean>(true)
    return p.then<boolean>((done: boolean): any => {
      if (!done)
        return false
      // - Get the title
      let title: string | null
      if (!activator.title)
        title = null
      else if (typeof activator.title === "string")
        title = activator.title as string
      else
        title = this.wrapUserCbOnErrorReject(activator.title, completed, completed)
      const finalRoute = Router.makeFinalQuery(completed, title)
      // - Call Unknown route CB
      if (activator === this.unknownActivator)
        this.callUnknownRouteCb(finalRoute)
      // - Change route
      return this.setNewQuery(finalRoute, activator).then(() => {
        if (changeHist)
          this.pushState(this.curQuery!, parentUrl)
        // Sometimes, the router set the page title to `null`. This fixes the bug.
        document.title = this.curQuery!.title || "SmallTeam"
        const activated = this.wrapUserCbOnErrorReject(activator.activate, this.curQuery, this.curQuery)
        return activated ? activated.then(() => true) : true
      })
    })
  }

  private pushState(query: ERQuery, parentUrl: string | null): void {
    if (!this.withHistory)
      return
    let rootQuery = query
    while (rootQuery.parent)
      rootQuery = rootQuery.parent
    window.history.pushState(
      rootQuery.redirectedFrom || rootQuery.queryString,
      query.title || "",
      this.toUrl(query.queryString, parentUrl)
    )
  }

  private toUrl(queryString: string | null | undefined, parentUrl: string | null): string {
    let url = queryString || ""
    url = parentUrl ? parentUrl + url : url
    return this.rootBaseUrl ? this.rootBaseUrl + url : url
  }

  private setNewQuery(query: ERQuery | null, activator: ERRouteActivator | null): Promise<void> {
    let p: Promise<void> | null = null
    if (this.curActivator && this.curActivator.deactivate) {
      const deactivated: any = this.wrapUserCbOnErrorReject(this.curActivator.deactivate, query)
      if (deactivated)
        p = deactivated
    }
    this.curActivator = activator
    this.curQuery = query
    this.fireListeners("leave", undefined, false)["catch"]((err) => {
      this.fireErrorListeners("asyncError", err)
    })
    if (query) {
      this.fireListeners("navigate", query, false)["catch"]((err) => {
        this.fireErrorListeners("asyncError", err)
      })
    }
    // - Remove listeners
    for (const k in this.onNavRmListeners) {
      if (this.onNavRmListeners.hasOwnProperty(k))
        this.removeListener(this.onNavRmListeners[k]["type"], this.onNavRmListeners[k]["handle"])
    }
    return p ? p : Promise.resolve()
  }

  /**
   * @return any[] NULL or the Route and completed Query
   */
  private searchRoute(query: ERQuery): Promise<MatchingRoute | null> {
    // - Make pending list
    const pendingList: any[] = []
    let r: Route
    let matchArr
    let can: any
    let matching: MatchingRoute
    if (query.queryString !== null) {
      for (const k in this.routes) {
        if (!this.routes.hasOwnProperty(k))
          continue
        r = this.routes[k]
        matchArr = this.matchActivator(query, r.activator, r.compiledRoute)
        can = matchArr[0]
        if (can === false)
          continue
        matching = matchArr[1] as any
        if (can === true) {
          if (pendingList.length === 0)
            return Promise.resolve<MatchingRoute>(matching)
          pendingList.push([Promise.resolve(true), matching])
          break
        } else
          pendingList.push([can, matching]) // can is a promise
      }
    }
    // - Add unknown routes
    if (this.unknownActivator) {
      matchArr = this.matchActivator(query, this.unknownActivator)
      can = matchArr[0]
      if (can !== false) {
        matching = matchArr[1] as any
        pendingList.push([can === true ? Promise.resolve(true) : can, matching])
      }
    }
    // - Wait promises
    const makeThenCb = function (matching: MatchingRoute, deeper: Promise<MatchingRoute | null>) {
      return function (activated: boolean): any {
        return activated ? matching : deeper
      }
    }
    let pending
    let deeper = Promise.resolve<MatchingRoute | null>(null)
    for (let i = pendingList.length - 1; i >= 0; --i) {
      pending = pendingList[i]
      deeper = pending[0].then(makeThenCb(pending[1], deeper))
    }
    return deeper
  }

  private matchActivator(query: ERQuery, activator: ERRouteActivator, cr: CompiledRoute | null = null) {
    let completed: ERQuery | null
    if (cr) {
      completed = Router.makeCompletedQuery(query, cr, activator)
      if (!completed)
        return [false]
    } else
      completed = query
    const matching: MatchingRoute = {
      completedQuery: completed,
      activator,
      compiledRoute: cr
    }
    if (!activator.canActivate)
      return [true, matching]
    const can = this.wrapUserCbOnErrorReject(activator.canActivate, completed, completed)
    return [can, matching]
  }

  // --
  // -- Private - Queries
  // --

  private makeQuery(queryString: string | null, parentQuery: any): ERQuery {
    let hash: string | null
    let params: { [index: string]: string } | null
    if (queryString === null || queryString === undefined) {
      queryString = null
      hash = null
      params = null
    } else {
      if (this.curQuery && this.curQuery.queryString === queryString)
        return this.curQuery
      const hashPos = queryString.indexOf("#")
      hash = hashPos === -1 ? null : queryString.slice(hashPos + 1)
      if (hash === "")
        hash = null
      const paramsPos = queryString.indexOf("?")
      if (paramsPos === -1)
        params = null
      else {
        const paramsStr = hashPos === -1 ? queryString.slice(paramsPos + 1) : queryString.slice(paramsPos + 1, hashPos)
        const pTokens = paramsStr.split("&")
        let nameVal
        params = {}
        for (let i = 0, len = pTokens.length; i < len; ++i) {
          nameVal = pTokens[i].split("=")
          params[nameVal[0]] = nameVal[1] || ""
        }
      }
    }
    const query: ERQuery = {
      queryString: queryString!,
      queryHash: hash,
      queryParams: params
    }
    if (parentQuery)
      query.parent = parentQuery
    if (Object.freeze)
      Object.freeze(query)
    return query
  }

  // --
  // -- Private - Listeners
  // --

  private doAddErrorListener(type, cb: (...args) => void): number {
    let listeners = this.errListeners[type]
    if (listeners === undefined)
      listeners = this.listeners[type] = []
    const handle = listeners.length
    listeners[handle] = cb
    return handle
  }

  private addListener(type: string, cb: Function, onNavRm = false): number {
    let listeners = this.listeners[type]
    if (listeners === undefined)
      listeners = this.listeners[type] = []
    const handle = listeners.length
    listeners[handle] = cb
    if (onNavRm) {
      this.onNavRmListeners[type + "~" + handle] = {
        "type": type,
        "handle": handle
      }
    }
    return handle
  }

  private removeListener(type: string, handle: number): void {
    const listeners = this.listeners[type]
    if (listeners === undefined || listeners[handle] === undefined)
      throw Error(`Unknown listener "${type}": "${handle}"`)
    delete listeners[handle]
    const k = type + "~" + handle
    if (this.onNavRmListeners[k])
      delete this.onNavRmListeners[k]
  }

  private fireListeners(type: string, arg: any, returnBoolean: boolean): Promise<any> {
    const listeners = this.listeners[type]
    if (listeners === undefined)
      return returnBoolean ? Promise.resolve(true) : Promise.resolve()
    const promArr: any[] = []
    for (const k in listeners) {
      if (listeners.hasOwnProperty(k)) {
        promArr.push(arg === undefined ? listeners[k]() : listeners[k](arg))
      }
    }
    let p = Promise.all<any>(promArr)
    if (returnBoolean) {
      p = p.then<any>(function (resArr: boolean[]) {
        for (let i = 0, len = resArr.length; i < len; ++i) {
          if (!resArr[i])
            return false
        }
        return true
      })
    }
    return p
  }

  // --
  // -- Root router
  // --

  private makeOnPopState() {
    return (e) => {
      if (e.state === null || e.state === undefined)
        return
      try {
        this.doNavigate(e.state, false)
      } catch (err) {
        this.fireErrorListeners("asyncError", err)
      }
    }
  }

  private makeOnHashChange() {
    return () => {
      try {
        let queryString: string = window.location.hash
        if (queryString.length >= 1 && queryString[0] === "#")
          queryString = queryString.slice(1)
        this.doNavigate(queryString, false)
      } catch (err) {
        this.fireErrorListeners("asyncError", err)
      }
    }
  }

  // --
  // -- Private - Tools
  // --

  private callUnknownRouteCb(query: ERQuery) {
    try {
      this.fireErrorListeners("unknownRoute", query)
    } catch (err) {
      this.fireErrorListeners("asyncError", err)
    }
  }

  private wrapUserCbOnErrorReject(cb: any, query: ERQuery | null | undefined = undefined, arg: any = undefined): any {
    let res: any
    try {
      if (arg === undefined)
        res = cb()
      else
        res = cb(arg)
    } catch (err) {
      throw this.callOnRejectCb(err, query)
    }
    if (typeof res === "object" && res["then"] && res["catch"]) {
      res = res["catch"]((err) => {
        throw this.callOnRejectCb(err)
      })
    }
    return res
  }

  private callOnRejectCb(err: any, query: ERQuery | null | undefined = undefined): any {
    try {
      this.fireErrorListeners("reject", err, query)
    } catch (e) {
      this.fireErrorListeners("asyncError", e)
    }
    return err
  }
}