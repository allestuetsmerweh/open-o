/* global __dirname, module, require */
/* exported module */

const path = require('path');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

module.exports = [
    {
        entry: './index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'openo.min.js',
            publicPath: '/assets/',
            libraryTarget: 'umd',
        },
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ['@babel/preset-env', {useBuiltIns: 'usage', corejs: '2'}],
                            ['@babel/preset-react', {}],
                        ],
                    },
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    loader: 'html-loader',
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    loader: 'css-loader',
                },
            ],
        },
        plugins: [
            new StaticSiteGeneratorPlugin({
                globals: {
                    window: {},
                },
            }),
        ],
        devServer: {
            contentBase: __dirname,
            publicPath: '/',
            compress: true,
            inline: false,
            port: 30270,
            watchContentBase: true,
        },
        stats: {
            colors: true,
        },
        devtool: 'source-map',
    },
];
