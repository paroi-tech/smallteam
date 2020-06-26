export interface SmallTeamConf {
  env: "prod" | "local"
  log: LogConf
  ssl: boolean
  /**
   * In the `platform` mode, this is the main domain.
   */
  domain: string
  port: number
  publicPort?: number
  dataDir: string
  /**
   * Default is: `"singleTeam"`.
   */
  mode?: "singleTeam" | "platform"
  singleTeam?: {
    /**
     * For example: `"/my/sub/directory"` (optional).
     */
    subdirUrl?: string
  }
  mail: {
    from: string
  }
}

export interface LogConf {
  /**
   * Default: "info".
   */
  level: "silent" | "error" | "warn" | "info" | "debug" | "trace"
  /**
   * Omit for stdout.
   */
  file?: string | null
  prettyPrint: boolean
}