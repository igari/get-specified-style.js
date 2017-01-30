'use strict';

var element = document.querySelector('div');
var style = getAppliedStyle(element);
var style2 = getComputedStyle(element);

console.log(style.width);
console.log(style2.width);

console.log(document.styleSheets);
