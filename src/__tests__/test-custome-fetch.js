import {
	getExternalScripts as rawGetExternalScripts,
	getExternalStyleSheets as rawGetExternalStyleSheets,
} from './../index';

test('test custome fetch importHTML', async done => {
	const mockHeaders = { 'referer': 'http://kuitos.me' };

	const fetch = jest.fn().mockImplementation((url, opts) => {
		return Promise.resolve({
			text: () => {
			},
		});
	});

	const importHTML = jest.fn().mockImplementation((url, { fetch }) => {
		return {
			getExternalScripts: () => rawGetExternalScripts(['http://kuitos.me/index.js'], fetch),
			getExternalStyleSheets: () => rawGetExternalStyleSheets(['http://kuitos.me/index.css'], fetch),
		};
	});

	const { getExternalScripts, getExternalStyleSheets } = await importHTML('http://kuitos.me', { fetch: (url) => fetch(url, { headers: mockHeaders }) });
	await getExternalScripts();
	await getExternalStyleSheets();

	// 对所有 fetch calls 的 args opt 做校验, reduce 结果为 false 则 fetch 的透传符合预期
	expect(fetch.mock.calls.reduce((pre, cur) => {
		return pre || (cur[1].headers !== mockHeaders);
	}, false)).toBe(false);

	done();
});
