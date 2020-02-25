import { defaultGetPublicPath } from '../utils';

test('defaultGetPublicPath', () => {

	// "testURL": "http://test.com/path/"
	const publicPaths = [
		'/a/b/c/index.html',
		'./a/b/index.html',
		'../a/b/index.html',
		'../index.html',
		'./index.html',
		'/index.html',
		// '/index.html/?abc=asdf',
	].map(defaultGetPublicPath);
	expect(publicPaths).toEqual([
		'http://test.com/a/b/c/',
		'http://test.com/path/a/b/',
		'http://test.com/a/b/',
		'http://test.com/',
		'http://test.com/path/',
		'http://test.com/',
		// 'http://test.com/',
	]);

	const publicPaths2 = [
		'//kuitos.me/index.html',
		// '//kuitos.me/index.html/#/a/c/d',
		'//kuitos.me/a/b/c/index.html',
		'//kuitos.me/index.html?test=2',
		'//kuitos.me/test/vm/',
	].map(defaultGetPublicPath);
	expect(publicPaths2).toEqual([
		'http://kuitos.me/',
		// 'http://kuitos.me/',
		'http://kuitos.me/a/b/c/',
		'http://kuitos.me/',
		'http://kuitos.me/test/vm/',
	]);
});
