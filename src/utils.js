/**
 * @author 有知 <youzhi.lk@antfin.com>
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

function assertPath(path) {
	if (typeof path !== 'string') {
		throw new TypeError('Path must be a string. Received ' + inspect(path));
	}
}

/**
 * copy from node.js path module
 * @param path
 * @return {string|*}
 */
export function dirname(path) {
	assertPath(path);
	const len = path.length;
	if (len === 0)
		return '.';
	let rootEnd = -1;
	let end = -1;
	let matchedSlash = true;
	let offset = 0;
	let code = path.charCodeAt(0);

	// Try to match a root
	if (len > 1) {
		if (code === 47/*/*/ || code === 92/*\*/) {
			// Possible UNC root

			rootEnd = offset = 1;

			code = path.charCodeAt(1);
			if (code === 47/*/*/ || code === 92/*\*/) {
				// Matched double path separator at beginning
				let j = 2;
				let last = j;
				// Match 1 or more non-path separators
				for (; j < len; ++j) {
					code = path.charCodeAt(j);
					if (code === 47/*/*/ || code === 92/*\*/)
						break;
				}
				if (j < len && j !== last) {
					// Matched!
					last = j;
					// Match 1 or more path separators
					for (; j < len; ++j) {
						code = path.charCodeAt(j);
						if (code !== 47/*/*/ && code !== 92/*\*/)
							break;
					}
					if (j < len && j !== last) {
						// Matched!
						last = j;
						// Match 1 or more non-path separators
						for (; j < len; ++j) {
							code = path.charCodeAt(j);
							if (code === 47/*/*/ || code === 92/*\*/)
								break;
						}
						if (j === len) {
							// We matched a UNC root only
							return path;
						}
						if (j !== last) {
							// We matched a UNC root with leftovers

							// Offset by 1 to include the separator after the UNC root to
							// treat it as a "normal root" on top of a (UNC) root
							rootEnd = offset = j + 1;
						}
					}
				}
			}
		} else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
			(code >= 97/*a*/ && code <= 122/*z*/)) {
			// Possible device root

			if (path.charCodeAt(1) === 58/*:*/) {
				rootEnd = offset = 2;
				if (len > 2) {
					code = path.charCodeAt(2);
					if (code === 47/*/*/ || code === 92/*\*/)
						rootEnd = offset = 3;
				}
			}
		}
	} else if (code === 47/*/*/ || code === 92/*\*/) {
		// `path` contains just a path separator, exit early to avoid
		// unnecessary work
		return path;
	}

	for (let i = len - 1; i >= offset; --i) {
		code = path.charCodeAt(i);
		if (code === 47/*/*/ || code === 92/*\*/) {
			if (!matchedSlash) {
				end = i;
				break;
			}
		} else {
			// We saw the first non-path separator
			matchedSlash = false;
		}
	}

	if (end === -1) {
		if (rootEnd === -1)
			return '.';
		else
			end = rootEnd;
	}

	return path.slice(0, end);
}
