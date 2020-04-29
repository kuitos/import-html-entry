/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import processTpl, { genLinkReplaceSymbol } from './process-tpl';
import { defaultGetPublicPath, getGlobalProp, getInlineCode, noteGlobalProps, requestIdleCallback } from './utils';

const styleCache = {};
const scriptCache = {};
const embedHTMLCache = {};
if (!window.fetch) {
	throw new Error('[import-html-entry] Here is no "fetch" on the window env, you need to polyfill it');
}
const defaultFetch = window.fetch.bind(window);

function defaultGetTemplate(tpl) {
	return tpl;
}

/**
 * convert external css link to inline style for performance optimization
 * @param template
 * @param styles
 * @param opts
 * @return embedHTML
 */
function getEmbedHTML(template, styles, opts = {}) {
	const { fetch = defaultFetch } = opts;
	let embedHTML = template;

	return getExternalStyleSheets(styles, fetch)
		.then(styleSheets => {
			embedHTML = styles.reduce((html, styleSrc, i) => {
				html = html.replace(genLinkReplaceSymbol(styleSrc), `<style>/* ${styleSrc} */${styleSheets[i]}</style>`);
				return html;
			}, embedHTML);
			return embedHTML;
		});
}

function getExecutableScript(scriptSrc, scriptText, proxy, strictGlobal) {
	window.proxy = proxy;
	// TODO 通过 strictGlobal 方式切换切换 with 闭包，待 with 方式坑趟平后再合并
	return strictGlobal
		? `;(function(window, self){with(window){;${scriptText}\n//# sourceURL=${scriptSrc.replace(/\n|\r\n/g,'')}\n}}).bind(window.proxy)(window.proxy, window.proxy);`
		: `;(function(window, self){;${scriptText}\n//# sourceURL=${scriptSrc.replace(/\n|\r\n/g,'')}\n}).bind(window.proxy)(window.proxy, window.proxy);`;
}

// for prefetch
export function getExternalStyleSheets(styles, fetch = defaultFetch) {
	return Promise.all(styles.map(styleLink => {
		if (styleLink.startsWith('<')) {
			// if it is inline style
			return getInlineCode(styleLink);
		} else {
			// external styles
			return styleCache[styleLink] ||
					(styleCache[styleLink] = fetch(styleLink).then(response => response.text()));
			}

		},
	));
}

// for prefetch
export function getExternalScripts(scripts, fetch = defaultFetch) {

	const fetchScript = scriptUrl => scriptCache[scriptUrl] ||
		(scriptCache[scriptUrl] = fetch(scriptUrl).then(response => response.text()));

	return Promise.all(scripts.map(script => {

			if (typeof script === 'string') {
				if (script.startsWith('<')) {
					// if it is inline script
					return getInlineCode(script);
				} else {
					// external script
					return fetchScript(script);
				}
			} else {
				// use idle time to load async script
				const { src, async } = script;
				if (async) {
					return {
						src,
						async: true,
						content: new Promise((resolve, reject) => requestIdleCallback(() => fetchScript(src).then(resolve, reject))),
					};
				}

				return fetchScript(src);
			}
		},
	));
}

const supportsUserTiming =
	typeof performance !== 'undefined' &&
	typeof performance.mark === 'function' &&
	typeof performance.clearMarks === 'function' &&
	typeof performance.measure === 'function' &&
	typeof performance.clearMeasures === 'function';

export function execScripts(entry, scripts, proxy = window, opts = {}) {
	const { fetch = defaultFetch, strictGlobal = false } = opts;

	return getExternalScripts(scripts, fetch)
		.then(scriptsText => {

			const geval = eval;

			function exec(scriptSrc, inlineScript, resolve) {

				const markName = `Evaluating script ${scriptSrc}`;
				const measureName = `Evaluating Time Consuming: ${scriptSrc}`;

				if (process.env.NODE_ENV === 'development' && supportsUserTiming) {
					performance.mark(markName);
				}

				if (scriptSrc === entry) {
					noteGlobalProps(strictGlobal ? proxy : window);

					// bind window.proxy to change `this` reference in script
					geval(getExecutableScript(scriptSrc, inlineScript, proxy, strictGlobal));

					const exports = proxy[getGlobalProp(strictGlobal ? proxy : window)] || {};
					resolve(exports);

				} else {

					if (typeof inlineScript === 'string') {
						// bind window.proxy to change `this` reference in script
						geval(getExecutableScript(scriptSrc, inlineScript, proxy, strictGlobal));
					} else {
						// external script marked with async
						inlineScript.async && inlineScript?.content
							.then(downloadedScriptText => geval(getExecutableScript(inlineScript.src, downloadedScriptText, proxy, strictGlobal)))
							.catch(e => {
								console.error(`error occurs while executing async script ${inlineScript.src}`);
								throw e;
							});
					}
				}

				if (process.env.NODE_ENV === 'development' && supportsUserTiming) {
					performance.measure(measureName, markName);
					performance.clearMarks(markName);
					performance.clearMeasures(measureName);
				}
			}

			function schedule(i, resolvePromise) {

				if (i < scripts.length) {
					const scriptSrc = scripts[i];
					const inlineScript = scriptsText[i];

					exec(scriptSrc, inlineScript, resolvePromise);
					// resolve the promise while the last script executed and entry not provided
					if (!entry && i === scripts.length - 1) {
						resolvePromise();
					} else {
						schedule(i + 1, resolvePromise);
					}
				}
			}

			return new Promise(resolve => schedule(0, resolve));
		});
}

export default function importHTML(url, opts = {}) {
	let fetch = defaultFetch;
	let getPublicPath = defaultGetPublicPath;
	let getTemplate = defaultGetTemplate;

	// compatible with the legacy importHTML api
	if (typeof opts === 'function') {
		fetch = opts;
	} else {
		fetch = opts.fetch || defaultFetch;
		getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;
		getTemplate = opts.getTemplate || defaultGetTemplate;
	}

	return embedHTMLCache[url] || (embedHTMLCache[url] = fetch(url)
		.then(response => response.text())
		.then(html => {

			const assetPublicPath = getPublicPath(url);
			const { template, scripts, entry, styles } = processTpl(getTemplate(html), assetPublicPath);

			return getEmbedHTML(template, styles, { fetch }).then(embedHTML => ({
				template: embedHTML,
				assetPublicPath,
				getExternalScripts: () => getExternalScripts(scripts, fetch),
				getExternalStyleSheets: () => getExternalStyleSheets(styles, fetch),
				execScripts: (proxy, strictGlobal) => {
					if (!scripts.length) {
						return Promise.resolve();
					}
					return execScripts(entry, scripts, proxy, { fetch, strictGlobal });
				},
			}));
		}));
}

export function importEntry(entry, opts = {}) {
	const { fetch = defaultFetch, getTemplate = defaultGetTemplate } = opts;
	const getPublicPath = opts.getPublicPath || opts.getDomain || defaultGetPublicPath;

	if (!entry) {
		throw new SyntaxError('entry should not be empty!');
	}

	// html entry
	if (typeof entry === 'string') {
		return importHTML(entry, { fetch, getPublicPath, getTemplate });
	}

	// config entry
	if (Array.isArray(entry.scripts) || Array.isArray(entry.styles)) {

		const { scripts = [], styles = [], html = '' } = entry;

		return getEmbedHTML(getTemplate(html), styles, { fetch }).then(embedHTML => ({
			template: embedHTML,
			assetPublicPath: getPublicPath('/'),
			getExternalScripts: () => getExternalScripts(scripts, fetch),
			getExternalStyleSheets: () => getExternalStyleSheets(styles, fetch),
			execScripts: (proxy, strictGlobal) => {
				if (!scripts.length) {
					return Promise.resolve();
				}
				return execScripts(scripts[scripts.length - 1], scripts, proxy, { fetch, strictGlobal });
			},
		}));

	} else {
		throw new SyntaxError('entry scripts or styles should be array!');
	}
}
