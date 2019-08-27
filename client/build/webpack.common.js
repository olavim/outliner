const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const {paths} = require('./utils');

const isDev = process.env.NODE_ENV === 'development';

const webpackConfig = {
	target: 'web',
	entry: ['@babel/polyfill', 'react-hot-loader/patch', paths.src('client/index.tsx')],
	resolve: {
		modules: ['node_modules'],
		extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
		alias: {
			'@': paths.src('client')
		}
	},
	module: {},
	output: {
		path: paths.dist('client'),
		publicPath: ''
	}
};

webpackConfig.plugins = [
	new webpack.NamedModulesPlugin(),
	new webpack.DefinePlugin({
		__DEV__: JSON.stringify(isDev)
	}),
	new ForkTsCheckerWebpackPlugin(),
	new HtmlPlugin({
		template: paths.src('client/index.html'),
		filename: paths.dist('client/index.html')
	}),
	new ServiceWorkerWebpackPlugin({
		entry: paths.src('client/sw.js'),
		publicPath: ''
	})
];

webpackConfig.module.rules = [
	{
		test: /\.tsx?$/,
		include: paths.src(),
		use: [
			{loader: 'babel-loader', options: {cacheDirectory: true}},
			{loader: 'awesome-typescript-loader', options: {transpileOnly: true, useCache: true}}
		]
	},
	{test: /\.js$/, include: paths.src(), loader: 'babel-loader', options: {cacheDirectory: true}},
	{test: /\.mjs$/, include: /node_modules/, type: 'javascript/auto'},
	{test: /\.(svg|png|ttf|otf)$/, loader: 'url-loader'}
];

module.exports = webpackConfig;
