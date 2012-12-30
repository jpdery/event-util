"use stricts"

var object            = require('prime/shell/object')
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

object.each(keys, function(val, key) {
	if (key in elem.style) base = val;
})

var onDispatch = function(custom, e) {
	custom.animationName = e.animationName
	custom.elapsedTime = e.elapsedTime
}

// animation end event
defineCustomEvent('transitionend', {
	base: base,
	condition: function() { return true },
	onDispatch: onDispatch
})

// own animation end event
defineCustomEvent('ownanimationend', {
	base: 'animation',
	condition: function(e) { return e.target === this }
})

