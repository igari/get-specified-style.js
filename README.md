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
```sh
bower install get-specified-style.js
```
or
```sh
yarn add get-specified-style.js
```

### Load with script tag
```html
<script src="/path/to/get-specified-style.js">
```

## Usage

Almost the same as [getComputedStyle](https://developer.mozilla.org/en/docs/Web/API/Window/getComputedStyle)

```
let style = getSpecifiedStyle(element[, pseudoElt]);
```

## API

### getPropertyValue
```
style.getPropertyValue(propertyName);//any value
```
### getPropertyPriority
```
style.getPropertyPriority(propertyName);//'' or 'important'
```
### getSpecificity
```
style.getSpecificity(propertyName);// 0~10000
```

## Dependencies

- [specificity](https://www.npmjs.com/package/specificity) - Calculate the specificity of a CSS selector