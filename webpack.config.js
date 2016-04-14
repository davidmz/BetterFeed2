var fs = require('fs');
var webpack = require("webpack");

var srcJsDir = __dirname + "/src/js",
    buildDir = __dirname + "/build",
    head = fs.readFileSync(srcJsDir + "/user-js-headers.txt", "utf8");

module.exports = [
    {
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
            new webpack.optimize.UglifyJsPlugin({}),
        ]
    },
    {
        entry: {
            "better-feed.user": srcJsDir + "/user-js-loader.js",
        },
        output: {
            path: buildDir,
            filename: "[name].js"
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: "babel",
                    exclude: /node_modules|build/,
                    query: {
                        presets: ['es2015', 'stage-0'],
                        cacheDirectory: true
                    }
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({}),
            new webpack.BannerPlugin(head, {raw: true})
        ]
    }

];