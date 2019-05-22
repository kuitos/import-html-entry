/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2019-02-25
 */

let firstGlobalProp, secondGlobalProp, lastGlobalProp;

export function getGlobalProp() {
	let cnt = 0;
	let lastProp;
	let hasIframe = false;
	for (let p in global) {
		if (!global.hasOwnProperty(p))
			continue;

		// 遍历 iframe，检查 window 上的属性值是否是 iframe，是则跳过后面的 first 和 second 判断
		for (let i = 0; i < window.frames.length; i++) {
			const frame = window.frames[i];
			if (frame === global[p]) {
				hasIframe = true;
				break;
			}
		}
		if (!hasIframe && (cnt === 0 && p !== firstGlobalProp || cnt === 1 && p !== secondGlobalProp))
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

export function getInlineCode(match) {
	const start = match.indexOf('>') + 1;
	const end = match.lastIndexOf('<');
	return match.substring(start, end);
}

