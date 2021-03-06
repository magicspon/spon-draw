# It's an off canvas menu, or sidebar... or something...

## Install

`npm install spon-draw` or `yarn add spon-draw`

Import

```
import SponDraw from 'spon-draw'
```

```
const mobileMenu = new SponDraw({

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
})
```

## **Methods**

### **init**

```
mobileMenu.init()
```

### **destroy**

Remove event listeners, and class names

```
mobileMenu.destroy()
```

## **Events**

`mobileMenu.on('event', { dom, event })`

```
mobileMenu.on('open',  ({ dom }) => {
	console.log('open', dom)
})

mobileMenu.on('after:open',  ({ dom }) => {
	console.log('after:open', dom)
})

mobileMenu.on('close',  ({ dom }) => {
	console.log('close', dom)
})

mobileMenu.on('after:close',  ({ dom }) => {
	console.log('after:close', dom)
})
```
