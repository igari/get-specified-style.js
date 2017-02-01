'use strict';

var element = document.querySelector('div');
var spedifiedStyle = getSpecifiedStyle(element, '::before');
var computedStyle = getComputedStyle(element, '::before');

console.log(spedifiedStyle.getPropertyValue('width'));
console.log(computedStyle.getPropertyValue('width'));
