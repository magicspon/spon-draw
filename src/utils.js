export const eventPromise = (event, element, callback) => {
	let complete = false

	const done = (resolve, e) => {
		e.stopPropagation()
		element.removeEventListener(event, done)
		if (e.target === element && !complete) {
			complete = true
			resolve()
			return
		}
	}

	return new Promise(resolve => {
		callback && callback()
		element.addEventListener(event, done.bind(null, resolve), false)
	})
}

export const animationEnd = (type = 'transition') => {
	let types =
		type === 'transition'
			? {
					OTransition: 'oTransitionEnd',
					WebkitTransition: 'webkitTransitionEnd',
					MozTransition: 'transitionend',
					transition: 'transitionend'
				}
			: {
					OAnimation: 'oAnimationEnd',
					WebkitAnimation: 'webkitAnimationEnd',
					MozAnimation: 'animationend',
					animation: 'animationend'
				}
	const elem = document.createElement('fake')
	return Object.keys(types).reduce(function(prev, trans) {
		return undefined !== elem.style[trans] ? types[trans] : prev
	}, '')
}
