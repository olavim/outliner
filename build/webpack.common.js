import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import {paths} from './utils';

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
		publicPath: '/'
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
	{
		test: /\.mjs$/,
		include: /node_modules/,
		type: 'javascript/auto'
	},
	{test: /\.(svg|png|ttf|otf)$/, loader: 'url-loader'}
];

export default webpackConfig;
