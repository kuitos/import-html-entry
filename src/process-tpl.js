/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 15:04
 */

const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|')text\/ng-template\3).)*?>.*?<\/\1>/gi;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")(\S+)\1.*/;
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
const LINK_TAG_REGEX = /<(link)\s+.*?>/gi;
const STYLE_TYPE_REGEX = /\s+rel=("|')stylesheet\1.*/;
const STYLE_HREF_REGEX = /.*\shref=('|")(\S+)\1.*/;

function hasProtocol(url) {
	return url.startsWith('//') || url.startsWith('http');
}

/**
 * parse the script link from the template
 * @param tpl
 * @param domain
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl, domain) {

	let scripts = [];
	let entry = null;

	const template = tpl

		// change the css link
		.replace(LINK_TAG_REGEX, match => {

			const styleType = !!match.match(STYLE_TYPE_REGEX);
			if (styleType) {
				const styleHref = match.match(STYLE_HREF_REGEX);
				if (styleHref) {
					const href = styleHref && styleHref[2];
					if (href && !hasProtocol(href)) {
						const newHref = domain + href;
						return match.replace(href, newHref);
					}
				}
			}

			return match;
		})

		.replace(SCRIPT_TAG_REGEX, match => {

			const matchedScriptEntry = match.match(SCRIPT_ENTRY_REGEX);
			const matchedScriptSrcMatch = match.match(SCRIPT_SRC_REGEX);
			let matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];

			if (entry && matchedScriptEntry) {
				throw new SyntaxError('You should not set multiply entry script!');
			} else {

				// append the domain while the script not have an protocol prefix
				if (matchedScriptSrc && !hasProtocol(matchedScriptSrc)) {
					matchedScriptSrc = domain + matchedScriptSrc;
				}

				entry = entry || matchedScriptEntry && matchedScriptSrc;
			}

			if (matchedScriptSrc) {
				scripts.push(matchedScriptSrc);
				return `<!-- script ${matchedScriptSrc} replaced -->`;
			}

			return match;
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
