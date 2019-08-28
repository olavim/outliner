const merge = require('webpack-merge');
const webpack = require('webpack');
const dotenv = require('dotenv');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const common = require('./webpack.common');
const {paths} = require('./utils');

const BROWSER_ENV_PREFIX = 'BROWSER_';

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
		},
		before(app) {
			app.get('/env.js', (_req, res) => {
				const env = dotenv.config({path: paths.base('.env')}).parsed || {};

				const envStr = Object.keys(env)
					.filter(key => key.startsWith(BROWSER_ENV_PREFIX))
					.map(key => `${key.substr(BROWSER_ENV_PREFIX.length)}:'${process.env[key]}'`)
					.join(',');

				res.end(`window.env = {${envStr}}`);
			});
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
