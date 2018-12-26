/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 15:04
 */

const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|')text\/ng-template\3).)*?>.*?<\/\1>/gi;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")(\S+)\1.*/;
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;

/**
 * parse the script link from the template
 * @param tpl
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl, domain) {

	let scripts = [];
	let entry = null;

	const template = tpl.replace(SCRIPT_TAG_REGEX, match => {

		const matchedScriptEntry = match.match(SCRIPT_ENTRY_REGEX);
		const matchedScriptSrcMatch = match.match(SCRIPT_SRC_REGEX);
		let matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];

		if (entry && matchedScriptEntry) {
			throw new SyntaxError('You should not set multiply entry script!');
		} else {

			// append the domain while the script not have an protocol prefix
			if(matchedScriptSrc && (!matchedScriptSrc.startsWith('//') && !matchedScriptSrc.startsWith('http'))) {
				matchedScriptSrc = domain + matchedScriptSrc;
			}

			entry = entry || matchedScriptEntry && matchedScriptSrc;
		}

		if (matchedScriptSrc) {
			scripts.push(matchedScriptSrc);
		}

		return `<!-- script ${matchedScriptSrc} replaced -->`;
	});

	scripts = scripts.filter(function (script) {
		// filter empty script
		return !!script;
	});

	return {
		template,
		scripts,
		// set the last script as entry if have not set
		entry: entry || scripts[scripts.length - 1],
	};
}
