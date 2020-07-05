const HtmlWebPackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { join, resolve } = require("path")

const realPackageDir = resolve(__dirname, "..", "..", "packages", "smallteam")

module.exports = env => ({
  mode: env === "development" ? "development" : "production",
  devtool: env === "development" ? "inline-source-map" : undefined,
  resolve: {
    extensions: [".ts", ".js"],
  },
  entry: [join(__dirname, "src", "main.ts")],
  output: {
    filename: "registration.bundle.js",
    path: join(realPackageDir, env === "development" ? "static-bundles" : "static-bundles-prod"),
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
      filename: "registration.html"
    }),
    new MiniCssExtractPlugin({
      filename: "registration.bundle.css"
    })
  ]
})
