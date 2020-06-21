const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { join, resolve } = require("path")

module.exports = env => ({
  mode: env === "development" ? "development" : "production",
  devtool: env === "development" ? "inline-source-map" : undefined,
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
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          "@handledom/in-template-string-loader",
          "ts-loader",
          {
            loader: "@enhancedjs/css-in-template-string-loader",
            options: {
              cssLoaders: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
              ]
            }
          },
        ]
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
})
