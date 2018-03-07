var path = require("path");

module.exports = {
  entry: [/* 'whatwg-fetch', */ path.join(__dirname, "main.ts")],
  output: {
    path: path.join(__dirname, "..", "www-server", "www"),
    filename: "bundle.js"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
    // alias: {
    //   bkb: path.join(__dirname, "..", "bkb-source.ts")
    // }
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
      {
        test: /\.monk$/,
        loader: "monkberry-loader"
      }
    ]
  }
}