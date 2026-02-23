/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const root = path.resolve(__dirname, '..'); // electron-app/
module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'web',

  entry: path.resolve(root, 'src/web-contents-view/terminal.js'),

  output: {
    path: path.resolve(root, 'web-contents-view-dist'),
    filename: 'terminal.js',
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'], // no inline styles
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(root, 'src/web-contents-view/terminal.html'),
      filename: 'terminal.html',
    }),
    new MiniCssExtractPlugin({
      // This will contain the imported xterm.css (only)
      filename: 'terminal.css',
    }),
  ],
};
