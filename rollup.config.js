/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 11:51
 */

const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

export default {

	input: './src/index.js',
	plugins: [
		resolve(),
		commonjs({
			include: 'node_modules/**',
		})
	],
	output: {
		file: 'lib/import-html.js',
		format: 'umd',
		name: 'importHTML',
		sourcemap: true
	}

};
