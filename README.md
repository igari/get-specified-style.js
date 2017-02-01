# getSpecifiedStyle

## getComputedStyle vs getSpecifiedStyle

Assume that viewport width is 1024px.

```html
<div>hoge</div>
```

```css
div {
	width: auto;
}
```

```js
var element = document.querySelector('div');
var spedifiedStyle = getSpecifiedStyle(element);
var computedStyle = getComputedStyle(element);

console.log(spedifiedStyle.getPropertyValue('width'));//auto
console.log(computedStyle.getPropertyValue('width'));//1024px
```

## Installation

```html
<script src="/path/to/get-specified-style.js">
```

## Usage

Exactly the same as [getComputedStyle](https://developer.mozilla.org/en/docs/Web/API/Window/getComputedStyle)

```
getSpecifiedStyle(element[, pseudoElt]);
```