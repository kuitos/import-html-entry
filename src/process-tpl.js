/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 15:04
 */

const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|')text\/ng-template\3).)*?>.*?<\/\1>/gi;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")(\S+)\1.*/;
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;

/**
 * 从模版中解析出script外链脚本
 * tpl 处理后的模版字符串 scripts:提取出来的脚本链接
 * @param tpl
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl) {

	const scripts = [];
	let entry = null;

	const template = tpl.replace(SCRIPT_TAG_REGEX, match => {

		const matchedScriptEntry = match.match(SCRIPT_ENTRY_REGEX);
		const matchedScriptSrcMatch = match.match(SCRIPT_SRC_REGEX);
		const matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];

		if (entry && matchedScriptEntry) {
			throw new SyntaxError('You should not set multiply entry script!');
		} else {
			entry = entry || (matchedScriptEntry && matchedScriptSrc);
		}

		if (matchedScriptSrc) {
			scripts.push(matchedScriptSrc);
		}

		return `<!-- script ${matchedScriptSrc} replaced -->`;
	});

	return {
		template,
		scripts: scripts.filter(function (script) {
			// 过滤空的索引
			return !!script;
		}),
		entry
	};
}
