const HtmlWebPackPlugin = require("html-webpack-plugin")
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
    path: resolve(__dirname, "dist"), // resolve(__dirname, "..", "backend", "public", "js"),
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
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./public/index.html"
    }),
    // new MiniCssExtractPlugin({})
  ]
}
