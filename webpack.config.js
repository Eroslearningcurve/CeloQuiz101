const path = require("path");
const webpack = require("webpack");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var AssetsPlugin = require("assets-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  entry: {
    main: path.resolve(process.cwd(), "src", "main.js"),
    quiz: path.resolve(process.cwd(), "src", "quiz.js"),
    result: path.resolve(process.cwd(), "src", "result.js"),
  },
  output: {
    path: path.resolve(process.cwd(), "docs"),
    filename: "[name]_[hash].js",
    publicPath: "",
  },
  node: {
    fs: "empty",
    net: "empty",
  },
  module: {
    rules: [{ test: /\.css$/, use: "css-loader" }],
  },
  watchOptions: {
    // ignored: /node_modules/,
    aggregateTimeout: 300, // After seeing an edit, wait .3 seconds to recompile
    poll: 500, // Check for edits every 5 seconds
  },
  plugins: [
    new AssetsPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(process.cwd(), "public", "index.html"),
      filename: "index.html",
      chunks: ["main"],
    }),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(process.cwd(), "public", "quiz.html"),
      filename: "quiz.html",
      chunks: ["quiz"],
    }),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(process.cwd(), "public", "result.html"),
      filename: "result.html",
      chunks: ["result"],
    }),
  ],
};
