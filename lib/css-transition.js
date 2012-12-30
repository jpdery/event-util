"use stricts"

var object            = require('prime/shell/object')
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

object.each(keys, function(val, key) {
	if (key in elem.style) base = val;
})

var onDispatch = function(custom, e) {
	custom.propertyName = e.propertyName
	custom.elapsedTime = e.elapsedTime
	custom.pseudoElement = e.pseudoElement
}

// transition end event
defineCustomEvent('transitionend', {
	base: base,
	condition: function() { return true },
	onDispatch: onDispatch
})

// own transition end event
defineCustomEvent('owntransitionend', {
	base: 'transitionend',
	condition: function(e) { return e.target === this }
})

