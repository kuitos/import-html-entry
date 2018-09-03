/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-08-15 11:37
 */

import 'systemjs';
import processTpl from './process-tpl';

export default function importHTML(url) {

	return fetch(url)
		.then(response => response.text())
		.then(html => {
			const { template, scripts, entry } = processTpl(html);

			return new Promise((resolve, reject) =>

				scripts.map(script =>
					System.import(script).then(exports => {
						if (script === entry) {
							resolve({
								template,
								exports
							});
						}
					}, reject))
			);
		});
}
