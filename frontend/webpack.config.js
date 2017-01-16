module.exports = {
  entry: './main.ts',
  output: {
    filename: '../www/bundle.js'
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        query: {
          "compilerOptions": {
            "noEmit": false
          }
        }
      }
    ]
  }
}