var path = require("path")

module.exports = {
  entry: [ path.join(__dirname, "main.ts") ],
  output: {
    path: path.join(__dirname, "..", "www-server", "www"),
    filename: "bundle-pwd.js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        query: {
          "compilerOptions": {
            "noEmit": false
          }
        }
      },
      { test: /\.monk$/, loader: 'monkberry-loader' }
    ]
  }
}
