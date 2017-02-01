'use strict';

const SPECIFICITY = require('specificity');

function XCSSStyleDeclaration() {}

XCSSStyleDeclaration.prototype.getPropertyValue = function (property) {
	return this[property].value;
};
XCSSStyleDeclaration.prototype.getSpecificity = function (property) {
	return this[property].specificity;
};
XCSSStyleDeclaration.prototype.getPropertyPriority = function (property) {
	return this[property].priority;
};

const GSS = {

	getSpecifiedStyle: function (element, pseudo) {

		let pseudoMatch = pseudo.match(/(before|after)$/);
		this.pseudo = pseudoMatch ? pseudoMatch[1] : false;

		element.xstyle = Object.create(XCSSStyleDeclaration.prototype, {});

		if(this.pseudo) {
			element.xstyle[this.pseudo] = Object.create(XCSSStyleDeclaration.prototype, {});
		}

		console.time('get specified style')

		this.searchByStyleSheet(element);

		console.timeEnd('get specified style')

		return this.pseudo ? element.xstyle[this.pseudo] : element.xstyle;
	},

	searchByStyleSheet: function () {
		var styleSheets = document.styleSheets;
		for(let styleSheet of styleSheets) {
			let cssRules = styleSheet.cssRules;
			if(!cssRules) continue;
			this.searchByCSSRule(cssRules);
		}
	},

	searchByCSSRule: function (cssRules) {
		for(let cssRule of cssRules) {

			switch(cssRule.type) {
				case CSSRule.STYLE_RULE:
					break;
				case CSSRule.SUPPORTS_RULE:
					if(CSS.supports(cssRule.conditionText)) {
						this.searchByCSSRule(cssRule.cssRules);
					}
					continue;
				case CSSRule.MEDIA_RULE:
					var mediaText = cssRule.media.mediaText;
					var mediaQueryList = matchMedia(mediaText);
					if(mediaQueryList.matches) {
						this.searchByCSSRule(cssRule.cssRules);
					}
					continue;
				default:
					continue;
			}

			let styleFromCSSRule = cssRule.style;
			let selectorText = cssRule.selectorText;
			let specificityObjArray = SPECIFICITY.calculate(selectorText);

			for(let specificityObj of specificityObjArray) {

				let regex = new RegExp('(.*)::(' + this.pseudo + ')');
				let hasPseudoSelector = specificityObj.selector.match(regex);
				let selector = hasPseudoSelector ? hasPseudoSelector[1] : specificityObj.selector;
				let pseudo = hasPseudoSelector ? hasPseudoSelector[2] : undefined;

				if(element.matches(selector)) {
					let specificity = +specificityObj.specificity.replace(/,/g, '');
					let styleFromStyleAttr = element.style;
					this.getStyle(styleFromCSSRule, specificity, pseudo);
					if(!hasPseudoSelector) {
						this.getStyle(styleFromStyleAttr, false);
					}
				}
			}
		}
	},
	getStyle: function (style, specificity, pseudo) {

		for(let property of style) {

			let value = style.getPropertyValue(property);
			let priority = style.getPropertyPriority(property);
			let isFromCSSRule = specificity !== false;
			specificity = isFromCSSRule ? (priority ? specificity + 1000 : specificity) : (priority ? 10000 : 1000);
			this.saveStyle2Element(element, property, value, priority, specificity, pseudo);

		}

	},
	saveStyle2Element: function(element, property, value, priority, specificity, pseudo) {

		element.xstyle[property] = element.xstyle[property] || {};

		let customStyle = element.xstyle[property];

		if(pseudo) {
			element.xstyle[pseudo][property] = element.xstyle[pseudo][property] || {};
			customStyle = element.xstyle[pseudo][property];
		}

		let hasProperty = Object.keys(customStyle).length > 0;

		if(hasProperty) {

			let isWinPrevSpecificity = specificity > customStyle.specificity;
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

window.getSpecifiedStyle = GSS.getSpecifiedStyle.bind(GSS);
