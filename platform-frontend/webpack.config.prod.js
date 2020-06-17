const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { join, resolve } = require("path")

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    hot: true,
    inline: true,
    host: "localhost",
    port: 8080,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  entry: [join(__dirname, "src", "main.ts")],
  output: {
    filename: "platform.bundle.js",
    path: resolve(__dirname, "..", "backend", "static-bundles"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["@handledom/in-template-string-loader"]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ["@handledom/in-template-string-loader", "ts-loader"]
      },
      {
        test: /\.monk$/,
        exclude: /node_modules/,
        use: {
          loader: "monkberry-loader"
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: join(__dirname, "public", "index.html"),
      filename: "platform.html"
    }),
    new MiniCssExtractPlugin({
      filename: "platform.bundle.css"
    })
  ]
}
