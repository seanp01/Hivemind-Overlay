const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    content: path.join(__dirname, 'extension', 'content.js'),
    background: path.join(__dirname, 'extension', 'background.js')
  },
  output: {
    path: path.join(__dirname, 'extension'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ["@babel/env", {
              "targets": {
                "browsers": "last 2 chrome versions"
              }
            }]
          ]
        }
      }
    }]
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx']
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.LMPORT': JSON.stringify(process.env.LMPORT || 5222)
    })
  ],
  
};