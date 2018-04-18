var path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"],
  },
  entry: [/* 'whatwg-fetch', */ path.join(__dirname, "main.ts")],
  output: {
    path: path.join(__dirname, "..", "www-server", "www"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.monk$/,
        exclude: /node_modules/,
        use: {
          loader: path.resolve('./mkloader.js')
        }
      }
    ]
  }
}
