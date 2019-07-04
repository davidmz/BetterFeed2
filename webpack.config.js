var fs = require('fs');
var webpack = require("webpack");
var packInfo = require("./package.json");

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
                },
                {
                    test: /\.svg$/,
                    loader: "svg-url-loader?encoding=base64"
                }
            ]
        },
        plugins: [
            new webpack.optimize.UglifyJsPlugin({}),
            new webpack.ProvidePlugin({'window.fetch': 'exports?self.fetch!whatwg-fetch'}),
            new webpack.DefinePlugin({
                'process.env': {
                    'BF2_VERSION': JSON.stringify("v" + packInfo.version)
                }
            })
        ]
    },
    {
        entry: {
            "better-feed.user": srcJsDir + "/user-js-loader.js"
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