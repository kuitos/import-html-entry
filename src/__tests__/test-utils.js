import iconv from 'iconv-lite';
import { defaultGetPublicPath, readResAsString } from '../utils';

describe('utils', () => {
	it('defaultGetPublicPath', () => {
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

	describe('readResAsString', () => {
		it ('should invoke text method when autoDetectCharset option is not enabled', () => {
			// arrange
			const fn = jest.fn();
			const response = {
				text: fn,
			};

			// act
			readResAsString(response);

			// assert
			expect(fn).toBeCalledTimes(1);
		});

		it ('should invoke text method when no headers found', () => {
			// arrange
			const fn = jest.fn();
			const response = {
				text: fn,
			};

			// act
			readResAsString(response, true);

			// assert
			expect(fn).toBeCalledTimes(1);
		});

		it ('should invoke text method when content-type is not in response headers', () => {
			// arrange
			const fn = jest.fn();
			const response = {
				headers: {
					get() {
						return null;
					},
				},
				text: fn,
			};

			// act
			readResAsString(response, true);

			// assert
			expect(fn).toBeCalledTimes(1);
		});

		it ('should invoke text method when content-type has utf-8 charset', () => {
			// arrange
			const fn = jest.fn();
			const response = {
				headers: {
					get() {
						return 'text/html;charset=UTf-8';
					},
				},
				text: fn,
			};

			// act
			readResAsString(response, true);

			// assert
			expect(fn).toBeCalledTimes(1);
		});

		it ('should parse stream correctly with non-utf-8 charset', async() => {
			async function runner(encoding, expected) {
				// arrage
				const type = `text/html;charset=${encoding}`;
				const decoded = iconv.encode(expected, encoding);
				const response = {
					headers: {
						get() {
							return type;
						},
					},
					blob: async() => new Blob([decoded], {
						type,
					})
				};

				// act
				const actual = await readResAsString(response, true);

				// assert
				expect(actual).toBe(expected);
			}

			await runner('gbk', '你好，李磊，中國');
			await runner('gb2312', '你好，李磊');
			await runner('BIG5', '中華人民共和國');
			await runner('GB18030', '대한민국|中華人民共和國|にっぽんこく、にほんこく');
		});
	});
});
