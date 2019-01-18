/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import loadjs from 'loadjs';
import processTpl from './process-tpl';

function promisifySeriesLoadjs(scripts) {
	return new Promise((resolve, reject) => scripts.length
		? loadjs(scripts, { async: false, success: resolve, error: reject })
		: resolve());
}

let init = false;
let globalDefine = null;

function mountSystemJS() {
	if (!init) {
		// as systemjs will pollute the global variables, lazy mount systemjs
		require('systemjs/dist/s');
		require('systemjs/dist/extras/amd');
		require('systemjs/dist/extras/named-exports');
		init = true;
		globalDefine = window.define;
	} else {
		window.define = globalDefine;
	}
}

function unmountSystemJS() {
	delete window.define;
}

export function getDomain(url) {
	try {
		// URL 构造函数不支持使用 // 前缀的 url
		const href = new URL(url.startsWith('//') ? `${location.protocol}${url}` : url);
		return href.origin;
	} catch (e) {
		return '';
	}
}

export default function importHTML(url, stripStyles) {

	const domain = getDomain(url);

	return fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts, entry, styles } = processTpl(html, domain, stripStyles);

			return {
				template,
				getStyles() {
					return stripStyles ?
						Promise
							.all(styles.map(styleLink => fetch(styleLink).then(response => response.text())))
							.then(styleSheets => styleSheets.join(''))
						: Promise.resolve('');
				},
				// return the entry script exports
				loadScripts() {

					const entryIndex = scripts.indexOf(entry);
					const preScripts = scripts.slice(0, entryIndex);
					const postScripts = scripts.slice(entryIndex + 1);

					let exports = null;

					return promisifySeriesLoadjs(preScripts)
						.then(() => {
							mountSystemJS();
							exports = window.System.import(entry);
							return exports.then(unmountSystemJS);
						})
						.then(promisifySeriesLoadjs(postScripts))
						.then(() => exports);
				},
			};
		});
};
