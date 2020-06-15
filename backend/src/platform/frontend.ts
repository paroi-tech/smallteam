import { appVersion } from "../backendConfig"
import { getSubdirUrl } from "../utils/serverUtils"

export function getPlatformHtml() {
  let v = appVersion
  let subdirUrl = getSubdirUrl()
  return `<!DOCTYPE html>
<html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Platform</title>
  <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
  <link rel="stylesheet" media="all" href="font-awesome/css/fontawesome-all.min.css?v=${v}">
  <link rel="stylesheet" media="all" href="css/platform.bundle.css?v=${v}">
  <script src="js/platform.bundle.js?v=${v}" defer></script>
</head>
<body>
  <div class="js-app"></div>
</body>
</html>`
}