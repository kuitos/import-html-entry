export function allSettledButCanBreak(promises, shouldBreak) {
	return Promise.all(promises.map((promise, i) => {
			return promise
				.then(value => {
					return { status: 'fulfilled', value };
				})
				.catch(reason => {
					if (shouldBreak?.(i)) {
						throw reason;
					}

					return { status: 'rejected', reason };
				});
		}));
	;
}
