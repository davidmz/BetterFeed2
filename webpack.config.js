var fs = require("fs");
var webpack = require("webpack");
var TerserPlugin = require("terser-webpack-plugin");
var packInfo = require("./package.json");

var srcJsDir = __dirname + "/src/js",
  buildDir = __dirname + "/build",
  head = fs
    .readFileSync(srcJsDir + "/user-js-headers.txt", "utf8")
    .replace("<VERSION>", packInfo.version);

module.exports = [
  {
    entry: {
      "site-loader.min": srcJsDir + "/site-loader.js",
      "better-feed.min": srcJsDir + "/better-feed.js",
      "settings.min": srcJsDir + "/settings.js",
    },
    output: {
      path: buildDir,
      filename: "[name].js",
    },
    mode: "production",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["babel-loader"],
          exclude: /node_modules|build/,
        },
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          BF2_VERSION: JSON.stringify("v" + packInfo.version),
        },
      }),
    ],
  },
  {
    entry: {
      "better-feed.user": srcJsDir + "/user-js-loader.js",
    },
    output: {
      path: buildDir,
      filename: "[name].js",
    },
    mode: "production",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["babel-loader"],
          exclude: /node_modules|build/,
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: { preamble: head },
          },
        }),
      ],
    },
  },
];
