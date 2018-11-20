import merge from 'webpack-merge';
import webpack from 'webpack';
import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin';
import common from './webpack.common';
import {paths} from './utils';

export default merge(common, {
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
