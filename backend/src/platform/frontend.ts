import { appVersion } from "../context"
import { getSubdirUrl } from "../utils/serverUtils"

// let content: string | undefined

export async function getPlatformHtml() {
  // if (content === undefined)
  //   content = await readFile(join(packageDir, "static-bundles", "platform.html"), "utf8")
  // return content

  const v = appVersion
  const subdirUrl = getSubdirUrl()
  return `<!DOCTYPE html>
  <html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Platform</title>
    <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
    <link rel="stylesheet" media="all" href="font-awesome/css/fontawesome-all.min.css?v=${v}">
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