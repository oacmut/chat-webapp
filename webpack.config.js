const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config(); // Betöltjük az .env fájlt

module.exports = {
  entry: './src/App.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // Biztosítja, hogy az erőforrások helyesen töltődjenek
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
new CopyWebpackPlugin({
  patterns: [
    {
      from: 'public',
      to: '.',
      filter: (resourcePath) => !resourcePath.endsWith('index.html')
    }
  ]
}),


    new webpack.DefinePlugin({
      'process.env': {
        SUPABASE_URL: JSON.stringify(process.env.SUPABASE_URL),
        SUPABASE_ANON_KEY: JSON.stringify(process.env.SUPABASE_ANON_KEY),
      },
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // SPA útvonalak támogatása
  },
};