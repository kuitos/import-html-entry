/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

const loadedScripts = [];
const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|')text\/ng-template\3).)*?>.*?<\/\1>/gi;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")(\S+)\1.*/;
const SCRIPT_SEQ_REGEX = /.*\sseq=('|")(\S+)\1.*/;

/**
 * 从模版中解析出script外链脚本
 * @param tpl
 * @returns {{tpl: *, scripts: *[]}}
 * tpl 处理后的模版字符串 scripts:提取出来的脚本链接,数组索引对应脚本优先级, 数据结构: [['a.js','b.js'], ['c.js']]
 */
function processTpl(tpl) {

	const scripts = [];

	const template = tpl.replace(SCRIPT_TAG_REGEX, function (match) {

		// 抽取src部分按设置的优先级存入数组,默认优先级为0(最高优先级)
		const matchedScriptSeq = match.match(SCRIPT_SEQ_REGEX);
		const matchedScriptSrc = match.match(SCRIPT_SRC_REGEX);

		const seq = (matchedScriptSeq && matchedScriptSeq[2]) || 0;
		scripts[seq] = scripts[seq] || [];

		if (matchedScriptSrc && matchedScriptSrc[2]) {
			scripts[seq].push(matchedScriptSrc[2]);
		}

		return `<!-- script ${matchedScriptSrc[2]} replaced -->`;
	});

	return {
		template,
		scripts: scripts.filter(function (script) {
			// 过滤空的索引
			return !!script;
		})
	};

}

function loadScripts(scriptUrlList) {

	const promises = scriptUrlList.map(scriptUrl => {

		let loaded = false;
		let script = document.createElement('script');
		script.async = false;
		script.src = scriptUrl;

		return new Promise((resolve, reject) => {

			if (loadedScripts.indexOf(scriptUrl) === -1) {

				script.onload = () => {
					resolve();
					loadedScripts.push(scriptUrl);
					// helpful for gc
					script = null;
				};

				// onreadystatechange only works in IE
				script.onreadystatechange = () => {

					if (('loaded' === script.readyState || 'complete' === script.readyState) && !loaded) {
						loaded = true;
						script.onload();
					}
				};

				script.onerror = ev => reject(ev);

				document.head.appendChild(script);

			} else {
				resolve();
			}
		});
	});

	return Promise.all(promises);
}

export default function importHTML(url) {

	return fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts } = processTpl(html);

			window.module = { exports: {} };
			window.exports = {};
			return loadScripts(scripts).then(() => {

				const result = {
					template,
					exports: module.exports
				};

				// noinspection JSAnnotator
				delete window.module;
				// noinspection JSAnnotator
				delete window.exports;

				return result;
			});
		});
}
