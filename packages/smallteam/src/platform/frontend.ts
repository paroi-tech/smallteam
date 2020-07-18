import { appVersion, conf } from "../context"
import { getSubdirUrl, html } from "../utils/serverUtils"

export function getPlatformHtml() {
  const v = appVersion
  const subdirUrl = getSubdirUrl()
  const local = conf.env === "local"
  return html`<!DOCTYPE html>
  <html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}${local ? " data-env=\"local\"" : ""}>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SmallTeam - Task Management Software</title>
    <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
    <link rel="stylesheet" media="all" href="platform.bundle.css?v=${v}">
    <script src="platform.bundle.js?v=${v}" defer></script>
  </head>
  <body>
    <div class="js-app">
      <section class="SpashScreen">
        <p>Loading…</p>
        <noscript>
          <div class="ShowError js-error">
            <p>Please enable JavaScript to continue.</p>
          </div>
        </noscript>
      </section>
    </div>
  </body>
</html>`
}

export function getPlatformSupportHtml() {
  const v = appVersion
  const subdirUrl = getSubdirUrl()
  const pngUri = "data:image/png;base64,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"
  return html`<!DOCTYPE html>
  <html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Support - SmallTeam</title>
    <link rel="Shortcut Icon" href="/favicon.ico?v=${v}">
    <link rel="stylesheet" media="all" href="/platform.bundle.css?v=${v}">
  </head>
  <body>
    <main class="SimplePage Text">
      <h1>SmallTeam Support</h1>
      <p>Contact-us on this address:</p>
      <p><b class="Addr"><img alt="" src="${pngUri}" class="Addr-img">paroi.tech</b>.</p>
    </main>
  </body>
</html>`
}


