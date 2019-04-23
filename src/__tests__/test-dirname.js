/**
 * @author 有知 <youzhi.lk@antfin.com>
 * @since 2019-04-23
 */

import { dirname } from '../utils';

test('test dirname', () => {
	expect(dirname('https://abc.com/ab/cd/index.html')).toBe('https://abc.com/ab/cd');
	expect(dirname('https://abc.com/ab/cd/')).toBe('https://abc.com/ab');
	expect(dirname('https://abc.com/ab/cd')).toBe('https://abc.com/ab');
	expect(dirname('https://abc.com/ab/cd.html')).toBe('https://abc.com/ab');
	expect(dirname('https://abc.com')).toBe('https:/');
});
