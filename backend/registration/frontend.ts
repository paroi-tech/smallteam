import { platformVersion } from "../backendConfig"
import { getSubdirUrl } from "../utils/serverUtils";

export function getRegistrationHtml() {
  let v = platformVersion
  let subdirUrl = getSubdirUrl()
  return `<!DOCTYPE html>
<html data-ver="${v}"${subdirUrl ? ` data-base-url="${subdirUrl}"` : ""}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration</title>
  <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
  <link rel="stylesheet" media="all" href="font-awesome/css/fontawesome-all.min.css?v=${v}">
  <link rel="stylesheet" media="all" href="registration.css?v=${v}">
  <script src="bundle-registration.js?v=${v}" defer></script>
</head>
<body>
  <div class="js-app"></div>
</body>
</html>`
}