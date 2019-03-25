const path = require('path');
const    nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "index.js"
    },

    target: 'node',
    externals: [ nodeExternals() ], // Ignore all modules in node_modules folder.
    mode: 'development', // TODO: 'production', Want to minify the output.
    devtool: 'source-map',

    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },

};