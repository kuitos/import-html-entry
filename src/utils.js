/**
 * @author 有知 <youzhi.lk@antfin.com>
 * @since 2019-02-25
 */

let firstGlobalProp, secondGlobalProp, lastGlobalProp;

export function getGlobalProp() {
	let cnt = 0;
	let lastProp;
	for (let p in global) {
		if (!global.hasOwnProperty(p))
			continue;
		if (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp)
			return p;
		cnt++;
		lastProp = p;
	}
	if (lastProp !== lastGlobalProp)
		return lastProp;
}

export function noteGlobalProps() {
	// alternatively Object.keys(global).pop()
	// but this may be faster (pending benchmarks)
	firstGlobalProp = secondGlobalProp = undefined;
	for (let p in global) {
		if (!global.hasOwnProperty(p))
			continue;
		if (!firstGlobalProp)
			firstGlobalProp = p;
		else if (!secondGlobalProp)
			secondGlobalProp = p;
		lastGlobalProp = p;
	}
	return lastGlobalProp;
}
