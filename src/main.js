import mitt from 'mitt'
import { animationEnd, eventPromise } from './utils'

/**
 * @class SponDraw
 * @param  {HTMLElement} el : menu button
 * @param  {Object} options : menu options
 */
export default class SponDraw {
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

		before: null
	}

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

		this.options.init && this.initialize()

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
		}

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

		if (!this.isVisible) this.initialFocus = e.target

		this._before({ event: e, state: this.isVisible, dom: this.dom }).then(
			() => {
				this.isVisible ? this.close() : this.open()
			}
		)
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

		const { overlay, openButton } = this.dom

		this.emit('open', { dom: this.dom })

		openButton.forEach(button => button.classList.add(buttonActiveClass))

		overlay.classList.add(overlayVisibleClass)

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

		openButton.forEach(button => button.classList.remove(buttonActiveClass))

		overlay.classList.remove(overlayAnimationClass)
		overlay.classList.remove(overlayVisibleClass)
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
	initialize = () => {
		if (this.isInitialized) return

		this.isInitialized = true

		const {
			contents,
			overlay,
			openButton,
			closeButton,
			animationType
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

		this.addEvents()

		return this
	}
}
