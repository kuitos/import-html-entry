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

function getBaseUrl(url) {
	return url.endsWith('/') ? url.substr(0, url.length - 1) : url;
}

export const genLinkReplaceSymbol = linkHref => `<!-- link ${linkHref} replaced by import-html-entry -->`;
export const genScriptReplaceSymbol = scriptSrc => `<!-- script ${scriptSrc} replaced by import-html-entry -->`;

/**
 * parse the script link from the template
 * TODO
 *    1. collect stylesheets
 *    2. use global eval to evaluate the inline scripts
 *        see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#Difference_between_Function_constructor_and_function_declaration
 *        see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Do_not_ever_use_eval!
 * @param tpl
 * @param dirUrl
 * @stripStyles whether to strip the css links
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl, dirUrl) {

	let scripts = [];
	const styles = [];
	let entry = null;

	const template = tpl

		.replace(LINK_TAG_REGEX, match => {

			/*
			change the css link
			 */

			const styleType = !!match.match(STYLE_TYPE_REGEX);
			if (styleType) {

				const styleHref = match.match(STYLE_HREF_REGEX);
				if (styleHref) {

					const href = styleHref && styleHref[2];
					let newHref = href;

					if (href && !hasProtocol(href)) {
						// 处理一下使用相对路径的场景
						newHref = getBaseUrl(dirUrl) + (href.startsWith('/') ? href : `/${href}`);
					}

					styles.push(newHref);
					return genLinkReplaceSymbol(newHref);
				}
			}

			return match;
		})

		.replace(SCRIPT_TAG_REGEX, match => {

			/*
			collect scripts and replace the ref
			 */

			const matchedScriptEntry = match.match(SCRIPT_ENTRY_REGEX);
			const matchedScriptSrcMatch = match.match(SCRIPT_SRC_REGEX);
			let matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];

			if (entry && matchedScriptEntry) {
				throw new SyntaxError('You should not set multiply entry script!');
			} else {

				// append the domain while the script not have an protocol prefix
				if (matchedScriptSrc && !hasProtocol(matchedScriptSrc)) {
					matchedScriptSrc = getBaseUrl(dirUrl) + matchedScriptSrc;
				}

				entry = entry || matchedScriptEntry && matchedScriptSrc;
			}

			if (matchedScriptSrc) {
				scripts.push(matchedScriptSrc);
				return genScriptReplaceSymbol(matchedScriptSrc);
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
		styles,
		// set the last script as entry if have not set
		entry: entry || scripts[scripts.length - 1],
	};
}
