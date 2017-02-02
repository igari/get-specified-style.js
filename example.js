'use strict';

document.addEventListener("DOMContentLoaded", function(event) {
	console.log(getSpecifiedStyle(document.querySelector('div'), '::before').getPropertyValue('width'));
	console.log(getComputedStyle(document.querySelector('div'), '::before').getPropertyValue('width'));
	console.log(getSpecifiedStyle(document.querySelector('.nav'), '::before').getPropertyValue('display'));
	console.log(getComputedStyle(document.querySelector('.nav'), '::before').getPropertyValue('display'));
});
