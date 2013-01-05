"use strict"

var defineCustomEvent = require('./define-custom-event')

var elem = document.createElement('div')
var base = null
var keys = {
	'WebkitAnimation' : 'webkitAnimationEnd',
	'MozAnimation'    : 'animationend',
	'OAnimation'      : 'oAnimationEnd',
	'msAnimation'     : 'MSAnimationEnd',
	'animation'       : 'animationend'
}

for (var key in keys) {
	if (key in elem.style) base = keys[key];
}

var onDispatch = function(custom, data) {
	custom.animationName = data.animationName
	custom.elapsedTime = data.elapsedTime
}

defineCustomEvent('transitionend', {
	base: base,
	onDispatch: onDispatch
})

defineCustomEvent('ownanimationend', {
	base: 'animation',
	condition: function(e) { return e.target === this }
})

