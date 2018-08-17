import { platformVersion } from "../backendConfig"

export function getRegistrationHtml() {
  const v = platformVersion
  return `<!DOCTYPE html>
<html data-ver="${v}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration</title>
  <link rel="Shortcut Icon" href="favicon.ico?v=${v}">
  <link rel="stylesheet" media="all" href="font-awesome/css/fontawesome-all.min.css?v=${v}">
  <link rel="stylesheet" media="all" href="smallteam.css?v=${v}">
  <script src="bundle-registration.js?v=${v}" defer></script>
</head>
<body>
</body>
</html>`
}