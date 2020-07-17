import { appVersion, conf } from "../context"
import { getSubdirUrl } from "../utils/serverUtils"

export function getRegistrationHtml() {
  const v = appVersion
  const subdirUrl = getSubdirUrl()
  const local = conf.env === "local"
  return `<!DOCTYPE html>
<html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}${local ? " data-env=\"local\"" : ""}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration - SmallTeam</title>
  <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
  <link rel="stylesheet" media="all" href="registration.bundle.css?v=${v}">
  <script src="registration.bundle.js?v=${v}" defer></script>
</head>
<body>
  <div class="js-app"></div>
</body>
</html>`
}
