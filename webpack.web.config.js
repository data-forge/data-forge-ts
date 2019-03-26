const path = require("path");
const    nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist", "web"),
        filename: "index.js",
        library: "dataForge",
    },

    target: "web",
    mode: "production",
    devtool: "source-map",

    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },

};