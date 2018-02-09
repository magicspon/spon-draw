import mitt from 'mitt'

const eventPromise = (event, element, callback) => {
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

const animationEnd = (type = 'transition') => {
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

/**
 * @class SponDraw
 */
class SponDraw {
	defaults = {
		openButton: '[data-menu-opener]',

		overlay: document.getElementById('site-menu'),

		contents: document.getElementById('menu-inner'),

		closeButton: '[data-menu-closer]',

		init: false,

		buttonActiveClass: 'is-active',

		overlayVisibleClass: 'is-visible',

		overlayAnimationClass: 'is-animating',

		transition: true,

		animationType: 'transition',

		name: 'menu',

		before: null
	}

	FOCUSABLE_ELEMENTS = [
		'a[href]',
		'button:not([disabled]):not([aria-hidden]):not([data-menu-closer])'
	]

	/**
	 * The constructor
	 *
	 * @function constructor
	 * @param {HTMLElement} button
	 * @param {Object} options
	 * @return SponNav
	 */
	constructor(options = {}) {
		this.options = { ...this.defaults, ...options }

		this.options.init && this.init()

		Object.assign(this, mitt())
	}

	isVisible = false

	isAnimating = false

	isInitialized = false

	setOptions = o => {
		this.options = { ...this.options, ...o }

		return this
	}

	_before = obj => {
		const { before } = this.options
		if (typeof before === 'function') {
			return new Promise(resolve => {
				before(obj, resolve)
			})
		} else {
			return Promise.resolve()
		}
	}

	/**
	 * Bind Events
	 *
	 * @function addEvents
	 * @return SponDraw
	 */
	addEvents = () => {
		const { openButton, closeButton, contents } = this.dom

		openButton.forEach(button => {
			button.addEventListener('click', this.onClick)
			button.addEventListener('touchstart', this.onClick)
		})

		closeButton.forEach(button => {
			button.addEventListener('click', this.onClick)
			button.addEventListener('touchstart', this.onClick)
		})

		if (contents) {
			contents.addEventListener('click', this.blockClicks)
			contents.addEventListener('touchstart', this.blockClicks)
		}

		document.addEventListener('keydown', this.onKeyDown)

		return this
	}

	/**
	 * Remove Events
	 *
	 * @function removeEvents
	 * @return SponNav
	 */
	removeEvents = () => {
		const { openButton, closeButton, contents } = this.dom

		openButton.forEach(button => {
			button.removeEventListener('click', this.onClick)
			button.removeEventListener('touchstart', this.onClick)
		})

		closeButton.forEach(button => {
			button.removeEventListener('click', this.onClick)
			button.removeEventListener('touchstart', this.onClick)
		})

		if (contents) {
			contents.removeEventListener('click', this.blockClicks)
			contents.removeEventListener('touchstart', this.blockClicks)
		}
		return this
	}

	/**
	 * Button click handle
	 *
	 * @function onClick
	 * @param {Object} e - click event object
	 * @return void
	 */
	onClick = e => {
		e.preventDefault()

		if (this.isAnimating) return

		this.isAnimating = true

		this.$focus = document.activeElement

		if (!this.isVisible) this.initialFocus = e.target

		this._before({ event: e, state: this.isVisible, dom: this.dom }).then(
			() => {
				this.isVisible ? this.close() : this.open()
			}
		)
	}

	$focus = null

	onKeyDown = e => {
		const { keyCode } = e

		if (this.isVisible && keyCode === 27) {
			this.close()
		}

		if (
			!this.isVisible &&
			keyCode === 32 &&
			document.activeElement.hasAttribute('data-menu-opener')
		) {
			this.$focus = document.activeElement
			this.open()
		}
	}

	/**
	 * Prevent clicks from propogating
	 *
	 * @function {Object} e - click event object
	 * @return void
	 */
	blockClicks = e => {
		e.stopPropagation()
	}

	/**
	 * Animate in the canvas
	 *
	 * @function open
	 * @return SponDraw
	 */
	open = () => {
		const {
			buttonActiveClass,
			overlayVisibleClass,
			overlayAnimationClass,
			transition
		} = this.options

		const { overlay, openButton, contents } = this.dom

		const getFocusAbleElement = contents.querySelectorAll(
			this.FOCUSABLE_ELEMENTS
		)

		if (getFocusAbleElement.length) {
			getFocusAbleElement[0].focus()
		}

		this.emit('open', { dom: this.dom })

		openButton.forEach(button => {
			button.setAttribute('aria-expanded', true)
			button.classList.add(buttonActiveClass)
		})

		overlay.classList.add(overlayVisibleClass)
		overlay.setAttribute('aria-hidden', false)

		if (transition) {
			overlay.classList.add(overlayAnimationClass)
			eventPromise(this.animationEndEvents, overlay).then(this.onTransitionEnd)
		} else {
			this.isVisible = true
			this.isAnimating = false
		}

		return this
	}

	/**
	 * Animate out the canvas
	 *
	 * @function open
	 * @return SponDraw
	 */
	close = () => {
		const { overlay } = this.dom
		const { transition } = this.options

		this.emit('close', { dom: this.dom })

		this.reset()

		this.$focus && this.$focus.focus()

		if (transition) {
			eventPromise(this.animationEndEvents, overlay).then(this.onTransitionEnd)
		} else {
			this.isVisible = false
			this.isAnimating = false
		}

		return this
	}

	reset = () => {
		const {
			buttonActiveClass,
			overlayAnimationClass,
			overlayVisibleClass
		} = this.options
		const { overlay, openButton } = this.dom

		openButton.forEach(button => {
			button.setAttribute('aria-expanded', false)
			button.classList.remove(buttonActiveClass)
		})

		overlay.classList.remove(overlayAnimationClass, overlayVisibleClass)

		overlay.setAttribute('aria-hidden', true)
	}

	/**
	 * Transition end event
	 *
	 * @function open
	 * @return void
	 */
	onTransitionEnd = () => {
		const { overlay } = this.dom
		const { overlayAnimationClass } = this.options

		this.isVisible = !this.isVisible
		this.isAnimating = false
		const event = this.isVisible ? 'after:open' : 'after:close'

		this.emit(event, { dom: this.dom, state: this.isVisible })

		overlay.classList.remove(overlayAnimationClass)
	}

	/**
	 * Unbind events, remove classes, disable
	 *
	 * @function destroy
	 * @return SponDraw
	 */
	destroy = () => {
		if (!this.isInitialized) return

		this.isInitialized = false

		this.isVisible = false
		this.isAnimating = false

		this.reset()

		this.removeEvents()

		return this
	}

	/**
	 * Boot things up
	 *
	 * @function initialize
	 * @return SponDraw
	 */
	init = () => {
		if (this.isInitialized) return

		this.isInitialized = true

		const {
			contents,
			overlay,
			openButton,
			closeButton,
			animationType,
			name
		} = this.options

		this.animationEndEvents = animationEnd(animationType)

		this.dom = {
			html: document.getElementsByTagName('html')[0],
			body: document.body,
			openButton: [...document.querySelectorAll(openButton)],
			closeButton: [...document.querySelectorAll(closeButton)],
			overlay,
			contents
		}

		const btnId = this.dom.openButton[0].getAttribute('id')
		const overylayId = overlay.getAttribute('id')

		this.dom.openButton.forEach(button => {
			button.setAttribute('aria-expanded', false)
			button.setAttribute('aria-label', name)
			button.setAttribute('aria-controls', overylayId)
		})

		overlay.setAttribute('aria-hidden', true)

		if (!btnId) {
			console.warn('sponDraw: menu button should have an id')
		} else {
			overlay.setAttribute('aria-labelledby', btnId)
		}

		this.addEvents()

		return this
	}
}
