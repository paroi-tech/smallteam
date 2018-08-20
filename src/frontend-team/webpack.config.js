var path = require("path");

module.exports = {
  mode: "development",
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js"],
  },
  entry: [/* 'whatwg-fetch', */ path.join(__dirname, "main.ts")],
  output: {
    path: path.join(__dirname, "..", "..", "dist", "www"),
    filename: "bundle-team.js"
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
          loader: "monkberry-loader"
        }
      }
    ]
  }
}
