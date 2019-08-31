const merge = require('webpack-merge');
const webpack = require('webpack');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
	output: {
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].[chunkhash].js'
	},
	devtool: 'none',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		}),
		new CompressionWebpackPlugin()
	]
});
