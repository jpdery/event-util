"use strict"

var defineCustomEvent = require('./define-custom-event')

var elem = document.createElement('div')
var base = null
var keys = {
	'WebkitTransition' : 'webkitTransitionEnd',
	'MozTransition'    : 'transitionend',
	'OTransition'      : 'oTransitionEnd',
	'msTransition'     : 'MSTransitionEnd',
	'transition'       : 'transitionend'
}

for (var key in keys) {
	if (key in elem.style) base = keys[key];
}

var onDispatch = function(custom, data) {
	custom.propertyName = data.propertyName
	custom.elapsedTime = data.elapsedTime
	custom.pseudoElement = data.pseudoElement
}

defineCustomEvent('transitionend', {
	base: base,
	onDispatch: onDispatch
})

defineCustomEvent('owntransitionend', {
	base: 'transitionend',
	condition: function(e) { return e.target === this }
})