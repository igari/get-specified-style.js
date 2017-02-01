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

	init: function () {

		let body = document.querySelector('body');
		let allElements = body.querySelectorAll('*:not(script)');
		console.time('initialize')
		for(let element of allElements) {
			//console.count('get element')
			this.initCustomStyle(element);
		}
		console.timeEnd('initialize')
	},

	initCustomStyle: function (element) {
		element.xstyle = element.xstyle || Object.create(XCSSStyleDeclaration.prototype, {});
		element.xstyle.before = element.xstyle.before || Object.create(XCSSStyleDeclaration.prototype, {});
		element.xstyle.after = element.xstyle.after || Object.create(XCSSStyleDeclaration.prototype, {});
	},

	getSpecifiedStyle: function (element, pseudo) {

		let pseudoMatch = pseudo && typeof pseudo === 'string' && pseudo.trim().match(/(before|after)$/);

		this.pseudo = pseudoMatch ? pseudoMatch[1] : false;

		this.searchByStyleSheet(element);

		return this.pseudo ? element.xstyle[this.pseudo] : element.xstyle;
	},

	searchByStyleSheet: function (element) {
		var styleSheets = document.styleSheets;
		for(let styleSheet of styleSheets) {
			let cssRules = styleSheet.cssRules;
			if(!cssRules) continue;
			this.searchByCSSRule(cssRules, element);
		}
	},

	searchByCSSRule: function (cssRules, element) {
		for(let cssRule of cssRules) {
			//console.count('get css rule')

			switch(cssRule.type) {
				case CSSRule.STYLE_RULE:
					break;
				case CSSRule.SUPPORTS_RULE:
					if(CSS.supports(cssRule.conditionText)) {
						this.searchByCSSRule(cssRule.cssRules, element);
					}
					continue;
				case CSSRule.MEDIA_RULE:
					var mediaText = cssRule.media.mediaText;
					var mediaQueryList = matchMedia(mediaText);
					if(mediaQueryList.matches) {
						this.searchByCSSRule(cssRule.cssRules, element);
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
				let pseudoSelector = pseudoSelectorMatch && pseudoSelectorMatch[2] === this.pseudo ? pseudoSelectorMatch[2] : null;

				if(element.matches(selector || '*')) {
					let specificity = +specificityObj.specificity.replace(/,/g, '');
					this.getStyle(element, styleFromCSSRule, specificity, pseudoSelector);
					if(!pseudoSelector) {
						let styleFromStyleAttr = element.style;
						this.getStyle(element, styleFromStyleAttr, false);
					}
				}
			}
		}
	},
	getStyle: function (element, style, specificity, pseudoSelector) {

		for(let property of style) {
			//console.count('get style')

			let value = style.getPropertyValue(property);
			let priority = style.getPropertyPriority(property);
			let isFromCSSRule = specificity !== false;
			specificity = isFromCSSRule ? (priority ? specificity + 1000 : specificity) : (priority ? 10000 : 1000);
			this.saveStyle2Element(element, property, value, priority, specificity, pseudoSelector);

		}

	},
	saveStyle2Element: function(element, property, value, priority, specificity, pseudoSelector) {

		this.initCustomStyle(element);

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

document.addEventListener("DOMContentLoaded", function(event) {
	GSS.init();
});

window.getSpecifiedStyle = GSS.getSpecifiedStyle.bind(GSS);
