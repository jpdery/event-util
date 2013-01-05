"use strict"

var storage = require('WeakMap').createStorage()

var customs = {}

var dispatchEvent       = Element.prototype.dispatchEvent
var addEventListener    = Element.prototype.addEventListener
var removeEventListener = Element.prototype.removeEventListener

Element.prototype.dispatchEvent = function(event, data) {

	var custom = customs[event]
	if (custom) {
		var name = event
		event = document.createEvent('CustomEvent')
		event.initCustomEvent(name, custom.bubbleable, custom.cancelable)
		custom.onDispatch.call(this, event, data || {})
	}

	return dispatchEvent.call(this, event)
}

Element.prototype.addEventListener = function(type, listener, capture) {

	var custom = customs[type]
	if (custom) {
		custom.onAdd.call(this)
		listener = validate(this, type, listener)
		var name = root(custom)
		if (name) addEventListener.call(this, name, dispatch(this, type, listener), capture)
	 }

	return addEventListener.call(this, type, listener, capture)
}

Element.prototype.removeEventListener = function(type, listener, capture) {

	var custom = customs[type]
	if (custom) {
		custom.onRemove.call(this)
		listener = validate(this, type, listener)
		var name = root(custom)
		if (name) removeEventListener.call(this, name, dispatch(this, type, listener), capture)
		detach(this, type, listener)
	}

	return removeEventListener.call(this, type, listener, capture)
}

var defineCustomEvent = function(name, custom) {

	custom.base = 'base' in custom ? custom.base : null
	custom.condition = 'condition' in custom ? custom.condition : true
	custom.bubbleable = 'bubbleable' in custom ? custom.bubbleable : true
	custom.cancelable = 'cancelable' in custom ? custom.cancelable : true

	custom.onAdd = custom.onAdd || function(){}
	custom.onRemove = custom.onRemove || function(){}
	custom.onDispatch = custom.onDispatch || function(){}

	var base = customs[custom.base]

	customs[name] = base ? {
		base: base.base,
		condition: custom.condition,
		bubbleable: custom.bubbleable,
		cancelable: custom.cancelable,
		onAdd: inherit(custom, base, 'onAdd'),
		onRemove: inherit(custom, base, 'onRemove'),
		onDispatch: inherit(custom, base, 'onDispatch')
	} : custom
}

var inherit = function(custom, base, method) {
	return function() {
		base[method].apply(this, arguments)
		custom[method].apply(this, arguments)
	}
}

var root = function(custom) {
	var base = custom.base
	if (base === null) return null
	var parent = customs[base]
	if (parent) return root(parent)
	return base;
}

var passes = function(element, custom, e) {
	var condition = custom.condition
	var succeeded = condition
	if (typeof condition === 'function') succeeded = condition.call(element, e)
	var base = customs[custom.base]
	if (base) return succeeded && passes(element, base, e)
	return succeeded
}

var handler = function(element, type, listener) {
	var events = storage(element)
	if (events[type] === undefined) {
		events[type] = []
	}
	events = events[type]
	for (var i = 0, l = events.length; i < l; i++) {
		var event = events[i]
		if (event.listener === listener) return event
	}
	event = events[events.length] = {
		dispatch: null,
		validate: null,
		listener: listener
	}
	return event
}

var detach = function(element, type, listener) {
	var events = storage(element)
	if (events[type] === undefined) return
	events = events[type]
	for (var i = 0, l = events.length; i < l; i++) {
		var event = events[i]
		if (event.listener === listener) {
			events.splice(i, 1)
		}
	}
	return event
}

var dispatch = function(element, type, listener) {
	var event = handler(element, type, listener)
	if (event.dispatch === null) {
		event.dispatch = function(e) {
			if (passes(element, customs[type], e)) element.dispatchEvent(type, e)
		}
	}
	return event.dispatch
}

var validate = function(element, type, listener) {
	var event = handler(element, type, listener)
	if (event.validate === null) {
		event.validate = function(e) {
			if (e instanceof CustomEvent) listener.call(this, e)
		}
	}
	return event.validate
}

module.exports = global.defineCustomEvent = defineCustomEvent