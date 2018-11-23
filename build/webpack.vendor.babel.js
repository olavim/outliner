const webpack = require('webpack');
const {paths} = require('./utils');

module.exports = {
	entry: {
		vendor: [
			'@babel/polyfill',
			'react-dom',
			'@material-ui/core'
		]
	},
	devtool: 'source-map',
	resolve: {
		modules: ['node_modules']
	},
	output: {
		filename: '[name].dll.js',
		path: paths.dist('client'),
		library: '[name]_lib'
	},
	plugins: [
		new webpack.DllPlugin({
			path: paths.dist('client/[name]-manifest.json'),
			name: '[name]_lib'
		})
	]
};
