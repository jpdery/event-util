"use strict"

// TODO: Add possibility to redefine native event properly

var storage = require('WeakMap').createStorage()

var add    = Element.prototype.addEventListener
var remove = Element.prototype.removeEventListener
var events = {}

Element.prototype.addEventListener = function(type, listener, capture) {

	var descriptor = events[type]
	if (descriptor) {

		var store = storage(this);
		var listeners = store.listeners || (store.listeners = {})
		var callbacks = store.callbacks || (store.callbacks = {})

		if (listeners[type] === undefined) {
			listeners[type] = []
			callbacks[type] = []
		}

		if (listeners[type].indexOf(listener) > -1) return

		var base = descriptor.base
		if (base) {
			while (base.base) base = base.base
		}

		if (base) {

			if (descriptor.onAdd) {
				descriptor.onAdd.call(this)
			}

			var callback = function(e) {

				if (!descriptor.condition || (typeof descriptor.condition === 'function' &&
					!descriptor.condition.call(this, e))) {
					return
				}

				var custom = descriptor.onCreate.call(this, e)

				if (descriptor.onDispatch) {
					descriptor.onDispatch.call(this, custom, e)
				}

				this.dispatchEvent(custom)
			};

			add.call(this, base, callback, capture)
			callbacks[type].push(callback)
			listeners[type].push(listener)
		}
	}

	return add.apply(this, arguments)
}

Element.prototype.removeEventListener = function(type, listener, capture) {

	var event = events[type]
	if (event) {

		var store = storage(this)
		var listeners = store.listeners || (store.listeners = {})
		var callbacks = store.callbacks || (store.callbacks = {})

		if (listeners[type] === undefined) {
			listeners[type] = []
			callbacks[type] = []
		}

		if (listeners[type].indexOf(listener) === -1) return

		var base = descriptor.base
		if (base) {
			while (base.base) base = base.base
		}

		if (base) for (var i = 0, l = listeners.length; i < l; i++) {
			if (listener === listeners[i]) {
				remove.call(this, base, callbacks[i], capture)
				listeners.splice(i, 1)
				callbacks.splice(i, 1)
				break
			}
		}
	}

	return remove.apply(this, arguments)
}

var defineCustomEvent = function(name, event) {

	event.bubbleable = 'bubbleable' in event ? event.bubbleable : true
	event.cancelable = 'cancelable' in event ? event.cancelable : true
	event.condition = 'condition' in event ? event.condition : true

	event.onCreate = event.onCreate || function() {
		var custom = document.createEvent('CustomEvent')
		custom.initCustomEvent(
			name,
			event.bubbleable,
			event.cancelable
		);
		return custom
	}

	var base = events[event.base]

	events[name] = base ? {

		base: base,
		bubbleable: event.bubbleable,
		cancelable: event.cancelable,
		onCreate: event.onCreate,

		condition: function(e) {
			return (!base.condition || base.condition.call(this, e)) && (!event.condition || event.condition.call(this, e))
		},

		onAdd: function() {
			if (base.onAdd) base.onAdd.call(this)
			if (event.onAdd) event.onAdd.call(this)
		},

		onRemove: function() {
			if (base.onRemove) base.onRemove.call(this)
			if (event.onRemove) event.onRemove.call(this)
		},

		onDispatch: function(custom, e) {
			if (base.onDispatch) base.onDispatch.call(this, custom, e)
			if (event.onDispatch) event.onDispatch.call(this, custom, e)
		}

	} : event

	return this
}

module.exports = defineCustomEvent