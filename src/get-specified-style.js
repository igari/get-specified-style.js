'use strict';

const SPECIFICITY = require('specificity');

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
