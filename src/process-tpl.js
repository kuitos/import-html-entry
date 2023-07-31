/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-09-03 15:04
 */
import { getInlineCode, isModuleScriptSupported, parseUrl } from './utils';

const ALL_SCRIPT_REGEX = /(<script[\s\S]*?>)[\s\S]*?<\/script>/gi;
const SCRIPT_TAG_REGEX = /<(script)\s+((?!type=('|")text\/ng-template\3).)*?>.*?<\/\1>/is;
const SCRIPT_SRC_REGEX = /.*\ssrc=('|")?([^>'"\s]+)/;
const SCRIPT_TYPE_REGEX = /.*\stype=('|")?([^>'"\s]+)/;
const SCRIPT_ENTRY_REGEX = /.*\sentry\s*.*/;
const SCRIPT_ASYNC_REGEX = /.*\sasync\s*.*/;
const SCRIPT_CROSSORIGIN_REGEX = /.*\scrossorigin=('|")?use-credentials\1/;
const SCRIPT_NO_MODULE_REGEX = /.*\snomodule\s*.*/;
const SCRIPT_MODULE_REGEX = /.*\stype=('|")?module('|")?\s*.*/;
const LINK_TAG_REGEX = /<(link)\s+.*?>/isg;
const LINK_PRELOAD_OR_PREFETCH_REGEX = /\srel=('|")?(preload|prefetch)\1/;
const LINK_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
const LINK_AS_FONT = /.*\sas=('|")?font\1.*/;
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;
const STYLE_TYPE_REGEX = /\s+rel=('|")?stylesheet\1.*/;
const STYLE_HREF_REGEX = /.*\shref=('|")?([^>'"\s]+)/;
const HTML_COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
const LINK_IGNORE_REGEX = /<link(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
const STYLE_IGNORE_REGEX = /<style(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;
const SCRIPT_IGNORE_REGEX = /<script(\s+|\s+.+\s+)ignore(\s*|\s+.*|=.*)>/is;

function hasProtocol(url) {
	return url.startsWith('http://') || url.startsWith('https://');
}

function getEntirePath(path, baseURI) {
	return new URL(path, baseURI).toString();
}

function isValidJavaScriptType(type) {
	const handleTypes = ['text/javascript', 'module', 'application/javascript', 'text/ecmascript', 'application/ecmascript'];
	return !type || handleTypes.indexOf(type) !== -1;
}

export const genLinkReplaceSymbol = (linkHref, preloadOrPrefetch = false) => `<!-- ${preloadOrPrefetch ? 'prefetch/preload' : ''} link ${linkHref} replaced by import-html-entry -->`;
export const genScriptReplaceSymbol = (scriptSrc, async = false, crossOrigin = false) => `<!-- ${ crossOrigin ? 'cors' : '' } ${async ? 'async' : ''} script ${scriptSrc} replaced by import-html-entry -->`;
export const inlineScriptReplaceSymbol = `<!-- inline scripts replaced by import-html-entry -->`;
export const genIgnoreAssetReplaceSymbol = url => `<!-- ignore asset ${url || 'file'} replaced by import-html-entry -->`;
export const genModuleScriptReplaceSymbol = (scriptSrc, moduleSupport) => `<!-- ${moduleSupport ? 'nomodule' : 'module'} script ${scriptSrc} ignored by import-html-entry -->`;

/**
 * parse the script link from the template
 * 1. collect stylesheets
 * 2. use global eval to evaluate the inline scripts
 *    see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#Difference_between_Function_constructor_and_function_declaration
 *    see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Do_not_ever_use_eval!
 * @param tpl
 * @param baseURI
 * @param postProcessTemplate
 * @stripStyles whether to strip the css links
 * @returns {{template: void | string | *, scripts: *[], entry: *}}
 */
export default function processTpl(tpl, baseURI, postProcessTemplate) {

	let scripts = [];
	const styles = [];
	let entry = null;
	const moduleSupport = isModuleScriptSupported();

	const template = tpl

		/*
		remove html comment first
		*/
		.replace(HTML_COMMENT_REGEX, '')

		.replace(LINK_TAG_REGEX, match => {
			/*
			change the css link
			*/
			const styleType = !!match.match(STYLE_TYPE_REGEX);
			if (styleType) {

				const styleHref = match.match(STYLE_HREF_REGEX);
				const styleIgnore = match.match(LINK_IGNORE_REGEX);

				if (styleHref) {

					const href = styleHref && styleHref[2];
					let newHref = href;

					if (href && !hasProtocol(href)) {
						newHref = getEntirePath(href, baseURI);
					}
					if (styleIgnore) {
						return genIgnoreAssetReplaceSymbol(newHref);
					}

					newHref = parseUrl(newHref);
					styles.push(newHref);
					return genLinkReplaceSymbol(newHref);
				}
			}

			const preloadOrPrefetchType = match.match(LINK_PRELOAD_OR_PREFETCH_REGEX) && match.match(LINK_HREF_REGEX) && !match.match(LINK_AS_FONT);
			if (preloadOrPrefetchType) {
				const [, , linkHref] = match.match(LINK_HREF_REGEX);
				return genLinkReplaceSymbol(linkHref, true);
			}

			return match;
		})
		.replace(STYLE_TAG_REGEX, match => {
			if (STYLE_IGNORE_REGEX.test(match)) {
				return genIgnoreAssetReplaceSymbol('style file');
			}
			return match;
		})
		.replace(ALL_SCRIPT_REGEX, (match, scriptTag) => {
			const scriptIgnore = scriptTag.match(SCRIPT_IGNORE_REGEX);
			const moduleScriptIgnore =
				(moduleSupport && !!scriptTag.match(SCRIPT_NO_MODULE_REGEX)) ||
				(!moduleSupport && !!scriptTag.match(SCRIPT_MODULE_REGEX));
			// in order to keep the exec order of all javascripts

			const matchedScriptTypeMatch = scriptTag.match(SCRIPT_TYPE_REGEX);
			const matchedScriptType = matchedScriptTypeMatch && matchedScriptTypeMatch[2];
			if (!isValidJavaScriptType(matchedScriptType)) {
				return match;
			}

			// if it is a external script
			if (SCRIPT_TAG_REGEX.test(match) && scriptTag.match(SCRIPT_SRC_REGEX)) {
				/*
				collect scripts and replace the ref
				*/

				const matchedScriptEntry = scriptTag.match(SCRIPT_ENTRY_REGEX);
				const matchedScriptSrcMatch = scriptTag.match(SCRIPT_SRC_REGEX);
				let matchedScriptSrc = matchedScriptSrcMatch && matchedScriptSrcMatch[2];

				if (entry && matchedScriptEntry) {
					throw new SyntaxError('You should not set multiply entry script!');
				}

				if (matchedScriptSrc) {
					// append the domain while the script not have a protocol prefix
					if (!hasProtocol(matchedScriptSrc)) {
						matchedScriptSrc = getEntirePath(matchedScriptSrc, baseURI);
					}

					matchedScriptSrc = parseUrl(matchedScriptSrc);
				}

				entry = entry || matchedScriptEntry && matchedScriptSrc;

				if (scriptIgnore) {
					return genIgnoreAssetReplaceSymbol(matchedScriptSrc || 'js file');
				}

				if (moduleScriptIgnore) {
					return genModuleScriptReplaceSymbol(matchedScriptSrc || 'js file', moduleSupport);
				}

				if (matchedScriptSrc) {
					const asyncScript = !!scriptTag.match(SCRIPT_ASYNC_REGEX);
					const crossOriginScript = !!scriptTag.match(SCRIPT_CROSSORIGIN_REGEX);
					scripts.push((asyncScript || crossOriginScript) ? { async: asyncScript, src: matchedScriptSrc, crossOrigin: crossOriginScript } : matchedScriptSrc);
					return genScriptReplaceSymbol(matchedScriptSrc, asyncScript, crossOriginScript);
				}

				return match;
			} else {
				if (scriptIgnore) {
					return genIgnoreAssetReplaceSymbol('js file');
				}

				if (moduleScriptIgnore) {
					return genModuleScriptReplaceSymbol('js file', moduleSupport);
				}

				// if it is an inline script
				const code = getInlineCode(match);

				// remove script blocks when all of these lines are comments.
				const isPureCommentBlock = code.split(/[\r\n]+/).every(line => !line.trim() || line.trim().startsWith('//'));

				if (!isPureCommentBlock) {
					scripts.push(match);
				}

				return inlineScriptReplaceSymbol;
			}
		});

	scripts = scripts.filter(function (script) {
		// filter empty script
		return !!script;
	});

	let tplResult = {
		template,
		scripts,
		styles,
		// set the last script as entry if have not set
		entry: entry || scripts[scripts.length - 1],
	};
	if (typeof postProcessTemplate === 'function') {
		tplResult = postProcessTemplate(tplResult);
	}

	return tplResult;
}
