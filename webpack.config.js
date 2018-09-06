/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 11:51
 */

const path = require('path');

module.exports = {
	entry: {
		'import-html': './src/index.js'
	},
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, './lib'),
		filename: '[name].js',
		libraryTarget: 'umd',
		library: 'importHTML',
		libraryExport: 'default'
	},
	mode: 'production',
	resolve: {
		alias: {
			systemjs: path.resolve(__dirname, './node_modules/systemjs/dist/system-production.src.js')
		}
	},
	module: {
		rules: [
			{
				test: '/\.js$/',
				use: 'babel-loader',
				exclude: '/node_modules/'
			}
		]
	}
};
