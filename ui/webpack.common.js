const path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        main: "./src/index.js"
        // vendor: "./src/vendor.js"
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[hash].[ext]",
                        outputPath: "imgs"
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 100000,
                            name: "./font/[hash].[ext]",
                            mimetype: "application/font-woff"
                        }
                    }
                ]
            },
            {
                test: /\.(ts|tsx)?$/,
                include: path.resolve(__dirname, "src"),
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {
            "@lodash": path.join(__dirname, "src/@lodash"),
            "@fuse": path.join(__dirname, "src/@fuse"),
            "@history": path.join(__dirname, "src/@history"),
            app: path.join(__dirname, "src/app")
        }
    }
};
