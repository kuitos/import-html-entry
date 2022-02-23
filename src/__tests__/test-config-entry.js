import { importEntry } from '../index';

test('config entry should return the expect html template', async () => {

	const config = {
		styles: ['http://kuitos.me/umi.css', 'http://kuitos.me/test.css'],
		scripts: ['http://kuitos.me/umi.js', 'http://kuitos.me/test.js'],
		html: '<main>config entry test</main>',
	};

	const { template } = await importEntry(config, { fetch: async url => ({ text: async () => url }) });
	expect(template).toBe('<style>/* http://kuitos.me/umi.css */http://kuitos.me/umi.css</style><style>/* http://kuitos.me/test.css */http://kuitos.me/test.css</style><main>config entry test</main><!--  script http://kuitos.me/umi.js replaced by import-html-entry --><!--  script http://kuitos.me/test.js replaced by import-html-entry -->');
});

test('config entry should return the expect html template with fetch option', async () => {

	const config = {
		styles: ['http://kuitos.me/umi.css', 'http://kuitos.me/test.css'],
		scripts: ['http://kuitos.me/umi.js', 'http://kuitos.me/test.js'],
		html: '<main>config entry test</main>',
	};

	const { template } = await importEntry(config, {
		fetch: {
			fn: async url => ({ text: async () => url }),
		},
	});
	expect(template).toBe('<style>/* http://kuitos.me/umi.css */http://kuitos.me/umi.css</style><style>/* http://kuitos.me/test.css */http://kuitos.me/test.css</style><main>config entry test</main><!--  script http://kuitos.me/umi.js replaced by import-html-entry --><!--  script http://kuitos.me/test.js replaced by import-html-entry -->');
});

test('config entry should return the expect html template when using inline styles', async () => {
	const config = {
		styles: ['<style>body {color: #fff}</style>'],
		scripts: [],
		html: '<main>config entry test</main>',
	};

	const { template } = await importEntry(config, { fetch: async url => ({ text: async () => url }) });
	expect(template).toBe('<style>body {color: #fff}</style><main>config entry test</main>');
})


