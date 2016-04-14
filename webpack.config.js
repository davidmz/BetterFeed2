var webpack = require("webpack");

var srcJsDir = __dirname + "/src/js",
    buildDir = __dirname + "/build";

module.exports = {
    entry: {
        "site-loader.min": srcJsDir + "/site-loader.js",
        "better-feed.min": srcJsDir + "/better-feed.js",
        "settings.min": srcJsDir + "/settings.js"
    },
    output: {
        path: buildDir,
        filename: "[name].js"
    },
    devtool: "source-map",
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel",
                exclude: /node_modules|build/,
                query: {
                    presets: ['es2015', 'stage-0'],
                    // plugins: ['transform-runtime'],
                    //plugins: ["transform-es2015-modules-systemjs"],
                    cacheDirectory: true
                }
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({})
    ]
};