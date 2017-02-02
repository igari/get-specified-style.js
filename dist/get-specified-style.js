/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const SPECIFICITY = __webpack_require__(1);

function XCSSStyleDeclaration() {}

XCSSStyleDeclaration.prototype.getPropertyValue = function (property) {
	return this[property] ? this[property].value : null;
};
XCSSStyleDeclaration.prototype.getSpecificity = function (property) {
	return this[property] ? this[property].specificity : null;
};
XCSSStyleDeclaration.prototype.getPropertyPriority = function (property) {
	return this[property] ? this[property].priority : null;
};

const GSS = {

	options: {
		interactive: false
	},

	//https://developer.mozilla.org/en/docs/Web/CSS/computed_value
	//https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
	specifiedTargetProperties: [
		'background-position',
		'bottom',
		'left',
		'right',
		'top',
		'height',
		'width',
		'margin-bottom',
		'margin-left',
		'margin-right',
		'margin-top',
		'min-height',
		'min-width',
		'padding-bottom',
		'padding-left',
		'padding-right',
		'padding-top',
		'text-indent',
		'line-height',
		'font-size',
		'display'
	],

	tags4Ignore: [
		"script",
		"style",
		"option",
		"template",
		"source",
		"svg",
		"canvas"
	],

	initCustomStyle: function (element) {
		element.xstyle = element.xstyle || Object.create(XCSSStyleDeclaration.prototype, {});
		element.xstyle.before = element.xstyle.before || Object.create(XCSSStyleDeclaration.prototype, {});
		element.xstyle.after = element.xstyle.after || Object.create(XCSSStyleDeclaration.prototype, {});
	},

	saveCustomStyle2AllElement: function (_document, element) {
		console.time('initialize');
		this.searchByStyleSheet(_document, element);
		console.timeEnd('initialize');
	},

	isIgnoringTag: function (element) {
		return this.tags4Ignore.indexOf(element.tagName.toLowerCase()) > 0;
	},

	getSpecifiedStyle: function (element, pseudo) {

		if(this.isIgnoringTag(element)) {
			return window.getComputedStyle(element);
		}

		if(this.options.interactive) {
			this.saveCustomStyle2AllElement(document, element);
		}

		let pseudoMatch = pseudo && typeof pseudo === 'string' && pseudo.trim().match(/(before|after)$/);
		this.pseudo = pseudoMatch ? pseudoMatch[1] : false;

		if(this.pseudo) {

			if(element.xstyle && element.xstyle[this.pseudo]) {
				return element.xstyle[this.pseudo];
			} else {
				return window.getComputedStyle(element, '::' + this.pseudo);
			}
		} else {

			if(element.xstyle) {
				return element.xstyle;
			} else {
				return window.getComputedStyle(element);
			}
		}

	},

	searchByStyleSheet: function (_document, element) {
		var styleSheets = _document.styleSheets;
		let body = document.querySelector('body');
		for(let styleSheet of styleSheets) {
			let cssRules = styleSheet.cssRules;
			if(!cssRules) continue;
			this.searchByCSSRule(cssRules, body, element);
		}
	},

	searchByCSSRule: function (cssRules, body, element) {
		for(let cssRule of cssRules) {
			//console.count('get css rule')

			switch(cssRule.type) {
				case CSSRule.STYLE_RULE:
					break;
				case CSSRule.SUPPORTS_RULE:
					if(CSS.supports(cssRule.conditionText)) {
						this.searchByCSSRule(cssRule.cssRules, body, element);
					}
					continue;
				case CSSRule.MEDIA_RULE:
					var mediaText = cssRule.media.mediaText;
					var mediaQueryList = window.matchMedia(mediaText);
					if(mediaQueryList.matches) {
						this.searchByCSSRule(cssRule.cssRules, body, element);
					}
					continue;
				default:
					continue;
			}

			let styleFromCSSRule = cssRule.style;
			let selectorText = cssRule.selectorText;
			let specificityObjArray = SPECIFICITY.calculate(selectorText);

			for(let specificityObj of specificityObjArray) {
				//console.count('get selector')

				let regex = new RegExp('(.*)::(before|after)');
				let pseudoSelectorMatch = specificityObj.selector.trim().match(regex);
				let selector = pseudoSelectorMatch ? pseudoSelectorMatch[1] : specificityObj.selector;
				let pseudoSelector = pseudoSelectorMatch ? pseudoSelectorMatch[2] : null;
				let specificity = +specificityObj.specificity.replace(/,/g, '');
				let elements = body.querySelectorAll(selector || '*');

				if(element) {
					if(element.matches(selectorText)) {
						this.getStyleFromAll(element, styleFromCSSRule, pseudoSelector, specificity);
					}
				} else {
					for(let element of elements) {
						if(this.isIgnoringTag(element)) {
							continue;
						}
						this.getStyleFromAll(element, styleFromCSSRule, pseudoSelector, specificity);
					}
				}
			}
		}
	},
	getStyleFromAll: function (element, styleFromCSSRule, pseudoSelector, specificity) {
		let styleFromAttr = element.style;
		this.initCustomStyle(element);
		this.getStyle(element, styleFromCSSRule, pseudoSelector, specificity, false);
		this.getStyle(element, styleFromAttr, null, null, true);
	},
	getStyle: function (element, style, pseudoSelector, specificity, isFromAttr) {
		for(let property of style) {
			// console.count('get style')
			let isTargetProperties = this.specifiedTargetProperties.indexOf(property) >= 0;
			if(!isTargetProperties) {
				continue;
			}
			var value = style.getPropertyValue(property);
			var priority = style.getPropertyPriority(property);
			specificity = isFromAttr ? (priority ? 10000 : 1000) : (priority ? specificity + 1000 : specificity);
			this.saveStyle2Element(element, property, value, priority, specificity, pseudoSelector);
		}
	},
	saveStyle2Element: function(element, property, value, priority, specificity, pseudoSelector) {

		// this.initCustomStyle(element);

		element.xstyle[property] = element.xstyle[property] || {};

		let customStyle = element.xstyle[property];

		if(pseudoSelector) {
			element.xstyle[pseudoSelector][property] = element.xstyle[pseudoSelector][property] || {};
			customStyle = element.xstyle[pseudoSelector][property];
		}

		let hasProperty = Object.keys(customStyle).length > 0;

		if(hasProperty) {

			let isWinPrevSpecificity = customStyle.specificity <= specificity;
			if(isWinPrevSpecificity) {
				this.saveCustomStyle2Element(customStyle, value, priority, specificity);
			}

		} else {

			this.saveCustomStyle2Element(customStyle, value, priority, specificity);

		}

	},
	saveCustomStyle2Element: function (customStyle, value, priority, specificity) {
		customStyle.value = value;
		customStyle.priority = priority;
		customStyle.specificity = specificity;
	}
};

if(!GSS.options.interactive) {
	GSS.saveCustomStyle2AllElement(document);
}

window.getSpecifiedStyle = GSS.getSpecifiedStyle.bind(GSS);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var SPECIFICITY = (function() {
	var calculate,
		calculateSingle,
		compare;

	// Calculate the specificity for a selector by dividing it into simple selectors and counting them
	calculate = function(input) {
		var selectors,
			selector,
			i,
			len,
			results = [];

		// Separate input by commas
		selectors = input.split(',');

		for (i = 0, len = selectors.length; i < len; i += 1) {
			selector = selectors[i];
			if (selector.length > 0) {
				results.push(calculateSingle(selector));
			}
		}

		return results;
	};

	/**
	 * Calculates the specificity of CSS selectors
	 * http://www.w3.org/TR/css3-selectors/#specificity
	 *
	 * Returns an object with the following properties:
	 *  - selector: the input
	 *  - specificity: e.g. 0,1,0,0
	 *  - parts: array with details about each part of the selector that counts towards the specificity
	 *  - specificityArray: e.g. [0, 1, 0, 0]
	 */
	calculateSingle = function(input) {
		var selector = input,
			findMatch,
			typeCount = {
				'a': 0,
				'b': 0,
				'c': 0
			},
			parts = [],
			// The following regular expressions assume that selectors matching the preceding regular expressions have been removed
			attributeRegex = /(\[[^\]]+\])/g,
			idRegex = /(#[^\s\+>~\.\[:]+)/g,
			classRegex = /(\.[^\s\+>~\.\[:]+)/g,
			pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
			// A regex for pseudo classes with brackets - :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-type(), :lang()
			pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi,
			// A regex for other pseudo classes, which don't have brackets
			pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g,
			elementRegex = /([^\s\+>~\.\[:]+)/g;

		// Find matches for a regular expression in a string and push their details to parts
		// Type is "a" for IDs, "b" for classes, attributes and pseudo-classes and "c" for elements and pseudo-elements
		findMatch = function(regex, type) {
			var matches, i, len, match, index, length;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					typeCount[type] += 1;
					match = matches[i];
					index = selector.indexOf(match);
					length = match.length;
					parts.push({
						selector: input.substr(index, length),
						type: type,
						index: index,
						length: length
					});
					// Replace this simple selector with whitespace so it won't be counted in further simple selectors
					selector = selector.replace(match, Array(length + 1).join(' '));
				}
			}
		};

		// Replace escaped characters with plain text, using the "A" character
		// https://www.w3.org/TR/CSS21/syndata.html#characters
		(function() {
			var replaceWithPlainText = function(regex) {
					var matches, i, len, match;
					if (regex.test(selector)) {
						matches = selector.match(regex);
						for (i = 0, len = matches.length; i < len; i += 1) {
							match = matches[i];
							selector = selector.replace(match, Array(match.length + 1).join('A'));
						}
					}
				},
				// Matches a backslash followed by six hexadecimal digits followed by an optional single whitespace character
				escapeHexadecimalRegex = /\\[0-9A-Fa-f]{6}\s?/g,
				// Matches a backslash followed by fewer than six hexadecimal digits followed by a mandatory single whitespace character
				escapeHexadecimalRegex2 = /\\[0-9A-Fa-f]{1,5}\s/g,
				// Matches a backslash followed by any character
				escapeSpecialCharacter = /\\./g;

			replaceWithPlainText(escapeHexadecimalRegex);
			replaceWithPlainText(escapeHexadecimalRegex2);
			replaceWithPlainText(escapeSpecialCharacter);
		}());

		// Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
		(function() {
			var regex = /:not\(([^\)]*)\)/g;
			if (regex.test(selector)) {
				selector = selector.replace(regex, '     $1 ');
			}
		}());

		// Remove anything after a left brace in case a user has pasted in a rule, not just a selector
		(function() {
			var regex = /{[^]*/gm,
				matches, i, len, match;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					match = matches[i];
					selector = selector.replace(match, Array(match.length + 1).join(' '));
				}
			}
		}());

		// Add attribute selectors to parts collection (type b)
		findMatch(attributeRegex, 'b');

		// Add ID selectors to parts collection (type a)
		findMatch(idRegex, 'a');

		// Add class selectors to parts collection (type b)
		findMatch(classRegex, 'b');

		// Add pseudo-element selectors to parts collection (type c)
		findMatch(pseudoElementRegex, 'c');

		// Add pseudo-class selectors to parts collection (type b)
		findMatch(pseudoClassWithBracketsRegex, 'b');
		findMatch(pseudoClassRegex, 'b');

		// Remove universal selector and separator characters
		selector = selector.replace(/[\*\s\+>~]/g, ' ');

		// Remove any stray dots or hashes which aren't attached to words
		// These may be present if the user is live-editing this selector
		selector = selector.replace(/[#\.]/g, ' ');

		// The only things left should be element selectors (type c)
		findMatch(elementRegex, 'c');

		// Order the parts in the order they appear in the original selector
		// This is neater for external apps to deal with
		parts.sort(function(a, b) {
			return a.index - b.index;
		});

		return {
			selector: input,
			specificity: '0,' + typeCount.a.toString() + ',' + typeCount.b.toString() + ',' + typeCount.c.toString(),
			specificityArray: [0, typeCount.a, typeCount.b, typeCount.c],
			parts: parts
		};
	};

	/**
	 * Compares two CSS selectors for specificity
	 * Alternatively you can replace one of the CSS selectors with a specificity array
	 *
	 *  - it returns -1 if a has a lower specificity than b
	 *  - it returns 1 if a has a higher specificity than b
	 *  - it returns 0 if a has the same specificity than b
	 */
	compare = function(a, b) {
		var aSpecificity,
			bSpecificity,
			i;

		if (typeof a ==='string') {
			if (a.indexOf(',') !== -1) {
				throw 'Invalid CSS selector';
			} else {
				aSpecificity = calculateSingle(a)['specificityArray'];
			}
		} else if (Array.isArray(a)) {
			if (a.filter(function(e) { return (typeof e === 'number'); }).length !== 4) {
				throw 'Invalid specificity array';
			} else {
				aSpecificity = a;
			}
		} else {
			throw 'Invalid CSS selector or specificity array';
		}

		if (typeof b ==='string') {
			if (b.indexOf(',') !== -1) {
				throw 'Invalid CSS selector';
			} else {
				bSpecificity = calculateSingle(b)['specificityArray'];
			}
		} else if (Array.isArray(b)) {
			if (b.filter(function(e) { return (typeof e === 'number'); }).length !== 4) {
				throw 'Invalid specificity array';
			} else {
				bSpecificity = b;
			}
		} else {
			throw 'Invalid CSS selector or specificity array';
		}

		for (i = 0; i < 4; i += 1) {
			if (aSpecificity[i] < bSpecificity[i]) {
				return -1;
			} else if (aSpecificity[i] > bSpecificity[i]) {
				return 1;
			}
		}

		return 0;
	};

	return {
		calculate: calculate,
		compare: compare
	};
}());

// Export for Node JS
if (true) {
	exports.calculate = SPECIFICITY.calculate;
	exports.compare = SPECIFICITY.compare;
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);

/***/ })
/******/ ]);