/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import System from 'systemjs';
import processTpl from './process-tpl';

export default function importHTML(url) {

	return fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts, entry } = processTpl(html);

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
