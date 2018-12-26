/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import System from 'systemjs';
import processTpl from './process-tpl';

function getDomain(url) {
	try {
		const href = new URL(url);
		return href.origin;
	} catch (e) {
		return '';
	}
}

export default function importHTML(url) {

	const domain = getDomain(url);

	return fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts, entry } = processTpl(html, domain);

			return {
				template,
				// return the entry script exports
				loadScripts() {

					// TODO performance improvement
					return new Promise((resolve, reject) => {

							let promiseChain = Promise.resolve();

							scripts.reduce((chain, script) => {

								chain = chain.then(() => System.import(script).then(exports => {
									if (script === entry) {
										resolve(exports);
									}
								}), reject);

								return chain;
							}, promiseChain);
						},
					);
				},
			};
		});
};
