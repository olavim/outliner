import merge from 'webpack-merge';
import common from './webpack.common';
import webpack from 'webpack';

export default merge(common, {
	output: {
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].[chunkhash].js'
	},
	devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"'
		})
	]
});
