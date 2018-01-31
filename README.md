# Mellow resize events

## Install

`npm install spon-resize` or `yarn add spon-resize`

Import

```
import resizer from 'spon-resize'
```

Call it...

```
const screen = resizer()
console.log(screen.width, screen.height)
```


## **Methods**


### **start** 

If you need to use resize events, you will have to call `.start()` first

```
screen.start()
```


### **update** 

Returns the current `{ width, height }`

```
screen.update()
```

### **at** 
`screen.at('(min-width: 400px)', { match, unmatch })`

On window resize the *at* method will call either the match function or unmatch function, based on the media query passed in

```
screen.at(
  '(min-width: 400px)',
  match: () => {
    console.log('query is true')
  },
  unmatch: () => {
    console.log('query is false')
  }
)
```

### **destroy** 

Remove event listener

```
screen.destroy()
```

## **Events**

`screen.on('event', { width, height, query })`


**'view:resize'** called on window resize

```
screen.on('view:resize',  (...args) => {
	console.log('resize', args)
})
```

**'view:change'** called when a css breakpoint changed. (read from `body:after { content: " "}`)


```
screen.on('view:change', (...args) => {
	console.log('change', args)
})
```

