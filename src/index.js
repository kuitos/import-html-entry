/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import processTpl, { genLinkReplaceSymbol } from './process-tpl';
import { getGlobalProp, noteGlobalProps } from './utils';

export function getDomain(url) {
	try {
		// URL 构造函数不支持使用 // 前缀的 url
		const href = new URL(url.startsWith('//') ? `${location.protocol}${url}` : url);
		return href.origin;
	} catch (e) {
		return '';
	}
}

const styleCache = {};
const scriptCache = {};
const embedHTMLCache = {};

export default function importHTML(url) {

	const domain = getDomain(url);

	return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts, entry, styles } = processTpl(html, domain);

			function getEmbedHTML() {

				let emberHTML = template;

				return getExternalStyleSheets()
					.then(styleSheets => {
						emberHTML = styles.reduce((html, styleSrc, i) => {
							html = html.replace(genLinkReplaceSymbol(styleSrc), `<style>/* ${styleSrc} */${styleSheets[i]}</style>`);
							return html;
						}, emberHTML);

						return emberHTML;
					});
			}

			function getExternalStyleSheets() {
				return styleCache[url] ||
					(styleCache[url] = Promise.all(styles.map(styleLink => fetch(styleLink).then(response => response.text()))));

			}

			function getExternalScripts() {
				return scriptCache[url] ||
					(scriptCache[url] = Promise.all(scripts.map(script => fetch(script).then(response => response.text()))));
			}

			function execScript(proxy = window) {

				return getExternalScripts()
					.then(scriptsText => {
						const inlineScript = scriptsText.join(';');
						noteGlobalProps();
						window.proxy = proxy;
						const geval = eval;
						geval(`;(function(window){${inlineScript}})(window.proxy);`);
						const exports = proxy[getGlobalProp()];
						return exports;
					});
			}

			return getEmbedHTML().then(embedHTML => ({
				template: embedHTML,
				getExternalScripts,
				getExternalStyleSheets,
				execScript,
			}));
		}));
};
