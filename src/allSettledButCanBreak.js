export function allSettledButCanBreak(promises, shouldBreakWhileError) {
	return Promise.all(promises.map((promise, i) => {
			return promise
				.then(value => {
					return { status: 'fulfilled', value };
				})
				.catch(reason => {
					if (shouldBreakWhileError?.(i)) {
						throw reason;
					}

					return { status: 'rejected', reason };
				});
		}));
	;
}
