(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["event-util"] = require("0");
})({
    "0": function(require, module, exports, global) {
        "use scrict";
        global.defineCustomEvent = require("1");
        global.definePseudoEvent = require("3");
    },
    "1": function(require, module, exports, global) {
        "use strict";
        var storage = require("2").createStorage();
        var add = Element.prototype.addEventListener;
        var remove = Element.prototype.removeEventListener;
        var events = {};
        Element.prototype.addEventListener = function(type, listener, capture) {
            var descriptor = events[type];
            if (descriptor) {
                var store = storage(this);
                var listeners = store.listeners || (store.listeners = {});
                var callbacks = store.callbacks || (store.callbacks = {});
                if (listeners[type] === undefined) {
                    listeners[type] = [];
                    callbacks[type] = [];
                }
                if (listeners[type].indexOf(listener) > -1) return;
                var base = descriptor.base;
                if (base) {
                    while (base.base) base = base.base;
                }
                if (base) {
                    if (descriptor.onAdd) {
                        descriptor.onAdd.call(this);
                    }
                    var callback = function(e) {
                        if (!descriptor.condition || typeof descriptor.condition === "function" && !descriptor.condition.call(this, e)) {
                            return;
                        }
                        var event = descriptor.onCreate.call(this, e);
                        if (descriptor.onDispatch) {
                            descriptor.onDispatch.call(this, event, e);
                        }
                        this.dispatchEvent(event);
                    };
                    add.call(this, base, callback, capture);
                    callbacks[type].push(callback);
                    listeners[type].push(listener);
                }
            }
            return add.apply(this, arguments);
        };
        Element.prototype.removeEventListener = function(type, listener, capture) {
            var event = events[type];
            if (event) {
                var store = storage(this);
                var listeners = store.listeners || (store.listeners = {});
                var callbacks = store.callbacks || (store.callbacks = {});
                if (listeners[type] === undefined) {
                    listeners[type] = [];
                    callbacks[type] = [];
                }
                if (listeners[type].indexOf(listener) === -1) return;
                var base = descriptor.base;
                if (base) {
                    while (base.base) base = base.base;
                }
                if (base) {
                    for (var i = 0, l = listeners.length; i < l; i++) {
                        if (listener === listeners[i]) {
                            remove.call(this, base, callbacks[i], capture);
                            listeners.splice(i, 1);
                            callbacks.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            return remove.apply(this, arguments);
        };
        var defineCustomEvent = function(name, event) {
            event.bubbleable = "bubbleable" in event ? event.bubbleable : true;
            event.cancelable = "cancelable" in event ? event.cancelable : true;
            event.condition = "condition" in event ? event.condition : true;
            event.onCreate = event.onCreate || function() {
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent(name, event.bubbleable, event.cancelable);
                return event;
            };
            var base = events[event.base];
            if (base) {
                event.condition = function(e) {
                    return (!base.condition || base.condition.call(this, e, name)) && (!event.condition || event.condition.call(this, e, name));
                };
                event.onAdd = function() {
                    if (base.onAdd) base.onAdd.call(this);
                    if (event.onAdd) event.onAdd.call(this);
                };
                event.onRemove = function() {
                    if (base.onRemove) base.onRemove.call(this);
                    if (event.onRemove) event.onRemove.call(this);
                };
                event.onDispatch = function() {
                    if (base.onDispatch) base.onDispatch.call(this);
                    if (event.onDispatch) event.onDispatch.call(this);
                };
            }
            events[name] = event;
            return this;
        };
        module.exports = defineCustomEvent;
    },
    "2": function(require, module, exports, global) {
        void function(global, undefined_, undefined) {
            var getProps = Object.getOwnPropertyNames, defProp = Object.defineProperty, toSource = Function.prototype.toString, create = Object.create, hasOwn = Object.prototype.hasOwnProperty, funcName = /^\n?function\s?(\w*)?_?\(/;
            function define(object, key, value) {
                if (typeof key === "function") {
                    value = key;
                    key = nameOf(value).replace(/_$/, "");
                }
                return defProp(object, key, {
                    configurable: true,
                    writable: true,
                    value: value
                });
            }
            function nameOf(func) {
                return typeof func !== "function" ? "" : "name" in func ? func.name : toSource.call(func).match(funcName)[1];
            }
            var Data = function() {
                var dataDesc = {
                    value: {
                        writable: true,
                        value: undefined
                    }
                }, datalock = "return function(k){if(k===s)return l}", uids = create(null), createUID = function() {
                    var key = Math.random().toString(36).slice(2);
                    return key in uids ? createUID() : uids[key] = key;
                }, globalID = createUID(), storage = function(obj) {
                    if (hasOwn.call(obj, globalID)) return obj[globalID];
                    if (!Object.isExtensible(obj)) throw new TypeError("Object must be extensible");
                    var store = create(null);
                    defProp(obj, globalID, {
                        value: store
                    });
                    return store;
                };
                define(Object, function getOwnPropertyNames(obj) {
                    var props = getProps(obj);
                    if (hasOwn.call(obj, globalID)) props.splice(props.indexOf(globalID), 1);
                    return props;
                });
                function Data() {
                    var puid = createUID(), secret = {};
                    this.unlock = function(obj) {
                        var store = storage(obj);
                        if (hasOwn.call(store, puid)) return store[puid](secret);
                        var data = create(null, dataDesc);
                        defProp(store, puid, {
                            value: (new Function("s", "l", datalock))(secret, data)
                        });
                        return data;
                    };
                }
                define(Data.prototype, function get(o) {
                    return this.unlock(o).value;
                });
                define(Data.prototype, function set(o, v) {
                    this.unlock(o).value = v;
                });
                return Data;
            }();
            var WM = function(data) {
                var validate = function(key) {
                    if (key == null || typeof key !== "object" && typeof key !== "function") throw new TypeError("Invalid WeakMap key");
                };
                var wrap = function(collection, value) {
                    var store = data.unlock(collection);
                    if (store.value) throw new TypeError("Object is already a WeakMap");
                    store.value = value;
                };
                var unwrap = function(collection) {
                    var storage = data.unlock(collection).value;
                    if (!storage) throw new TypeError("WeakMap is not generic");
                    return storage;
                };
                var initialize = function(weakmap, iterable) {
                    if (iterable !== null && typeof iterable === "object" && typeof iterable.forEach === "function") {
                        iterable.forEach(function(item, i) {
                            if (item instanceof Array && item.length === 2) set.call(weakmap, iterable[i][0], iterable[i][1]);
                        });
                    }
                };
                function WeakMap(iterable) {
                    if (this === global || this == null || this === WeakMap.prototype) return new WeakMap(iterable);
                    wrap(this, new Data);
                    initialize(this, iterable);
                }
                function get(key) {
                    validate(key);
                    var value = unwrap(this).get(key);
                    return value === undefined_ ? undefined : value;
                }
                function set(key, value) {
                    validate(key);
                    unwrap(this).set(key, value === undefined ? undefined_ : value);
                }
                function has(key) {
                    validate(key);
                    return unwrap(this).get(key) !== undefined;
                }
                function delete_(key) {
                    validate(key);
                    var data = unwrap(this), had = data.get(key) !== undefined;
                    data.set(key, undefined);
                    return had;
                }
                function toString() {
                    unwrap(this);
                    return "[object WeakMap]";
                }
                try {
                    var src = ("return " + delete_).replace("e_", "\\u0065"), del = (new Function("unwrap", "validate", src))(unwrap, validate);
                } catch (e) {
                    var del = delete_;
                }
                var src = ("" + Object).split("Object");
                var stringifier = function toString() {
                    return src[0] + nameOf(this) + src[1];
                };
                define(stringifier, stringifier);
                var prep = {
                    __proto__: []
                } instanceof Array ? function(f) {
                    f.__proto__ = stringifier;
                } : function(f) {
                    define(f, stringifier);
                };
                prep(WeakMap);
                [ toString, get, set, has, del ].forEach(function(method) {
                    define(WeakMap.prototype, method);
                    prep(method);
                });
                return WeakMap;
            }(new Data);
            var defaultCreator = Object.create ? function() {
                return Object.create(null);
            } : function() {
                return {};
            };
            function createStorage(creator) {
                var weakmap = new WM;
                creator || (creator = defaultCreator);
                function storage(object, value) {
                    if (value || arguments.length === 2) {
                        weakmap.set(object, value);
                    } else {
                        value = weakmap.get(object);
                        if (value === undefined) {
                            value = creator(object);
                            weakmap.set(object, value);
                        }
                    }
                    return value;
                }
                return storage;
            }
            if (typeof module !== "undefined") {
                module.exports = WM;
            } else if (typeof exports !== "undefined") {
                exports.WeakMap = WM;
            } else if (!("WeakMap" in global)) {
                global.WeakMap = WM;
            }
            WM.createStorage = createStorage;
            if (global.WeakMap) global.WeakMap.createStorage = createStorage;
        }((0, eval)("this"));
    },
    "3": function(require, module, exports, global) {
        "use scrict";
        console.log("WAT");
        module.exports = function() {};
    }
});
