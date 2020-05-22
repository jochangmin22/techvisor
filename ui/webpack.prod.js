const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {
    OptimizeCssAssetsPlugin
} = require("optimize-css-assets-webpack-plugin");
const { TerserPlugin } = require("terser-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    output: {
        filename: "[name].[contentHash].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    // optimization: {
    //     minimizer: [
    //         new OptimizeCssAssetsPlugin(),
    //         new TerserPlugin()
    //         new HtmlWebpackPlugin({
    //             template: "./src/template.html",
    //             minify: {
    //                 removeAttributeQuotes: true,
    //                 collapseWhitespace: true,
    //                 removeComments: true
    //             }
    //         })
    //     ]
    // },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: "[name].[contentHash].css" }),
        new HtmlWebpackPlugin({
            template: "./src/index.html"
            // title: "Output Management"
        })
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    // MiniCssExtractPlugin.loader, //3. Extract css into files
                    "css-loader", //2. Turns css into commonjs
                    "sass-loader" //1. Turns sass into css
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader", //3. Inject styles into DOM
                    "css-loader" //2. Turns css into commonjs
                ]
            }
        ]
    }
});
