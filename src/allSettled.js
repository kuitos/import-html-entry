export function allSettled(promises) {
	return typeof Promise.allSettled === 'function'
		? Promise.allSettled(promises)
		: Promise.all(promises.map(promise => {
			return promise
				.then(value => {
					return { status: 'fulfilled', value };
				})
				.catch(reason => {
					return { status: 'rejected', reason };
				});
		}));
	;
}
