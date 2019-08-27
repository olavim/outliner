const merge = require('webpack-merge');
const webpack = require('webpack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const common = require('./webpack.common');
const {paths} = require('./utils');

module.exports = merge(common, {
	output: {
		filename: 'bundle.js'
	},
	devServer: {
		hot: true,
		disableHostCheck: true,
		contentBase: paths.dist('client'),
		publicPath: '/',
		port: process.env.PORT || 3000,
		historyApiFallback: {
			rewrites: [
				{from: /^(\/.*)?$/, to: '/'}
			]
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DllReferencePlugin({
			context: paths.base(),
			manifest: require(paths.dist('client/vendor-manifest.json'))
		}),
		new AddAssetHtmlPlugin({filepath: paths.dist('client/*.dll.js')})
	]
});
