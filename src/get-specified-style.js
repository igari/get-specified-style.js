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

	getSpecifiedStyle: function (element, pseudo) {

		this.element = element;

		let pseudoMatch = pseudo && typeof pseudo === 'string' && pseudo.match(/(before|after)$/);
		this.pseudo = pseudoMatch ? pseudoMatch[1] : false;

		this.element.xstyle = Object.create(XCSSStyleDeclaration.prototype, {});

		if(this.pseudo) {
			this.element.xstyle[this.pseudo] = Object.create(XCSSStyleDeclaration.prototype, {});
		}

		console.time('get specified style')

		this.searchByStyleSheet();

		console.timeEnd('get specified style')

		return this.pseudo ? this.element.xstyle[this.pseudo] : this.element.xstyle;
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

				let regex = new RegExp('(.*)::(before|after)');
				let pseudoSelectorMatch = specificityObj.selector.trim().match(regex);
				let selector = pseudoSelectorMatch ? pseudoSelectorMatch[1] : specificityObj.selector;

				if(
					this.element.matches(selector || '*') &&
					pseudoSelectorMatch ? this.pseudo === pseudoSelectorMatch[2] : true
				) {
					let specificity = +specificityObj.specificity.replace(/,/g, '');
					let styleFromStyleAttr = this.element.style;
					this.getStyle(styleFromCSSRule, specificity);
					if(!pseudoSelectorMatch) {
						this.getStyle(styleFromStyleAttr, false);
					}
				}
			}
		}
	},
	getStyle: function (style, specificity) {

		for(let property of style) {

			let value = style.getPropertyValue(property);
			let priority = style.getPropertyPriority(property);
			let isFromCSSRule = specificity !== false;
			specificity = isFromCSSRule ? (priority ? specificity + 1000 : specificity) : (priority ? 10000 : 1000);
			this.saveStyle2Element(property, value, priority, specificity);

		}

	},
	saveStyle2Element: function(property, value, priority, specificity) {

		this.element.xstyle[property] = this.element.xstyle[property] || {};

		let customStyle = this.element.xstyle[property];

		if(this.pseudo) {
			this.element.xstyle[this.pseudo][property] = this.element.xstyle[this.pseudo][property] || {};
			customStyle = this.element.xstyle[this.pseudo][property];
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

window.getSpecifiedStyle = GSS.getSpecifiedStyle.bind(GSS);
