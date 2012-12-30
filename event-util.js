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
        require("1");
        require("9");
        global.defineCustomEvent = require("7");
        global.definePseudoEvent = require("a");
    },
    "1": function(require, module, exports, global) {
        "use stricts";
        var object = require("2");
        var defineCustomEvent = require("7");
        var elem = document.createElement("div");
        var base = null;
        var keys = {
            WebkitAnimation: "webkitAnimationEnd",
            MozAnimation: "animationend",
            OAnimation: "oAnimationEnd",
            msAnimation: "MSAnimationEnd",
            animation: "animationend"
        };
        object.each(keys, function(val, key) {
            if (key in elem.style) base = val;
        });
        var onDispatch = function(custom, e) {
            custom.animationName = e.animationName;
            custom.elapsedTime = e.elapsedTime;
        };
        defineCustomEvent("transitionend", {
            base: base,
            condition: function() {
                return true;
            },
            onDispatch: onDispatch
        });
        defineCustomEvent("ownanimationend", {
            base: "animation",
            condition: function(e) {
                return e.target === this;
            }
        });
    },
    "2": function(require, module, exports, global) {
        "use strict";
        var prime = require("3"), object = require("4");
        object.implement({
            set: function(key, value) {
                this[key] = value;
                return this;
            },
            get: function(key) {
                var value = this[key];
                return value != null ? value : null;
            },
            count: function() {
                var length = 0;
                prime.each(this, function() {
                    length++;
                });
                return length;
            },
            each: function(method, context) {
                return prime.each(this, method, context);
            },
            map: function(method, context) {
                var results = {};
                prime.each(this, function(value, key, self) {
                    results[key] = method.call(context, value, key, self);
                });
                return results;
            },
            filter: function(method, context) {
                var results = {};
                prime.each(this, function(value, key, self) {
                    if (method.call(context, value, key, self)) results[key] = value;
                });
                return results;
            },
            every: function(method, context) {
                var every = true;
                prime.each(this, function(value, key, self) {
                    if (!method.call(context, value, key, self)) return every = false;
                });
                return every;
            },
            some: function(method, context) {
                var some = false;
                prime.each(this, function(value, key, self) {
                    if (!some && method.call(context, value, key, self)) return !(some = true);
                });
                return some;
            },
            index: function(value) {
                var key = null;
                prime.each(this, function(match, k) {
                    if (value === match) {
                        key = k;
                        return false;
                    }
                });
                return key;
            },
            remove: function(key) {
                var value = this[key];
                delete this[key];
                return value;
            },
            keys: function() {
                var keys = [];
                prime.each(this, function(value, key) {
                    keys.push(key);
                });
                return keys;
            },
            values: function() {
                var values = [];
                prime.each(this, function(value, key) {
                    values.push(value);
                });
                return values;
            }
        });
        object.each = prime.each;
        if (typeof JSON !== "undefined") object.implement({
            encode: function() {
                return JSON.stringify(this);
            }
        });
        module.exports = object;
    },
    "3": function(require, module, exports, global) {
        "use strict";
        var has = function(self, key) {
            return Object.hasOwnProperty.call(self, key);
        };
        var each = function(object, method, context) {
            for (var key in object) if (method.call(context, object[key], key, object) === false) break;
            return object;
        };
        if (!{
            valueOf: 0
        }.propertyIsEnumerable("valueOf")) {
            var buggy = "constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString".split(",");
            var proto = Object.prototype;
            each = function(object, method, context) {
                for (var key in object) if (method.call(context, object[key], key, object) === false) return object;
                for (var i = 0; key = buggy[i]; i++) {
                    var value = object[key];
                    if (value !== proto[key] && method.call(context, value, key, object) === false) break;
                }
                return object;
            };
        }
        var create = Object.create || function(self) {
            var constructor = function() {};
            constructor.prototype = self;
            return new constructor;
        };
        var define = Object.defineProperty || function(object, key, descriptor) {
            object[key] = descriptor.value;
            return object;
        };
        var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor || function(object, key) {
            return {
                value: object[key]
            };
        };
        var implement = function(proto) {
            each(proto, function(value, key) {
                if (key !== "constructor" && key !== "define" && key !== "inherits") this.define(key, getOwnPropertyDescriptor(proto, key) || {
                    writable: true,
                    enumerable: true,
                    configurable: true,
                    value: value
                });
            }, this);
            return this;
        };
        var prime = function(proto) {
            var superprime = proto.inherits;
            var constructor = has(proto, "constructor") ? proto.constructor : superprime ? function() {
                return superprime.apply(this, arguments);
            } : function() {};
            if (superprime) {
                var superproto = superprime.prototype;
                var cproto = constructor.prototype = create(superproto);
                constructor.parent = superproto;
                cproto.constructor = constructor;
            }
            constructor.define = proto.define || superprime && superprime.define || function(key, descriptor) {
                define(this.prototype, key, descriptor);
                return this;
            };
            constructor.implement = implement;
            return constructor.implement(proto);
        };
        prime.has = has;
        prime.each = each;
        prime.create = create;
        prime.define = define;
        module.exports = prime;
    },
    "4": function(require, module, exports, global) {
        "use strict";
        var object = require("5")["object"];
        var names = "hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
        for (var methods = {}, i = 0, name, method; name = names[i++]; ) if (method = Object.prototype[name]) methods[name] = method;
        module.exports = object.implement(methods);
    },
    "5": function(require, module, exports, global) {
        "use strict";
        var prime = require("3"), type = require("6");
        var slice = Array.prototype.slice;
        var ghost = prime({
            constructor: function ghost(self) {
                this.valueOf = function() {
                    return self;
                };
                this.toString = function() {
                    return self + "";
                };
                this.is = function(object) {
                    return self === object;
                };
            }
        });
        var shell = function(self) {
            if (self == null || self instanceof ghost) return self;
            var g = shell[type(self)];
            return g ? new g(self) : self;
        };
        var register = function() {
            var g = prime({
                inherits: ghost
            });
            return prime({
                constructor: function(self) {
                    return new g(self);
                },
                define: function(key, descriptor) {
                    var method = descriptor.value;
                    this[key] = function(self) {
                        return arguments.length > 1 ? method.apply(self, slice.call(arguments, 1)) : method.call(self);
                    };
                    g.prototype[key] = function() {
                        return shell(method.apply(this.valueOf(), arguments));
                    };
                    prime.define(this.prototype, key, descriptor);
                    return this;
                }
            });
        };
        for (var types = "string,number,array,object,date,function,regexp".split(","), i = types.length; i--; ) shell[types[i]] = register();
        module.exports = shell;
    },
    "6": function(require, module, exports, global) {
        "use strict";
        var toString = Object.prototype.toString, types = /number|object|array|string|function|date|regexp|boolean/;
        var type = function(object) {
            if (object == null) return "null";
            var string = toString.call(object).slice(8, -1).toLowerCase();
            if (string === "number" && isNaN(object)) return "null";
            if (types.test(string)) return string;
            return "object";
        };
        module.exports = type;
    },
    "7": function(require, module, exports, global) {
        "use strict";
        var storage = require("8").createStorage();
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
                    if (base === type) throw new Error("A custom event cannot redefine a native event");
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
                var custom = document.createEvent("CustomEvent");
                custom.initCustomEvent(name, event.bubbleable, event.cancelable);
                return custom;
            };
            var base = events[event.base];
            events[name] = base ? {
                base: base,
                bubbleable: event.bubbleable,
                cancelable: event.cancelable,
                onCreate: event.onCreate,
                condition: function(e) {
                    return (!base.condition || base.condition.call(this, e, name)) && (!event.condition || event.condition.call(this, e, name));
                },
                onAdd: function() {
                    if (base.onAdd) base.onAdd.call(this);
                    if (event.onAdd) event.onAdd.call(this);
                },
                onRemove: function() {
                    if (base.onRemove) base.onRemove.call(this);
                    if (event.onRemove) event.onRemove.call(this);
                },
                onDispatch: function(custom, e) {
                    if (base.onDispatch) base.onDispatch.call(this, custom, e);
                    if (event.onDispatch) event.onDispatch.call(this, custom, e);
                }
            } : event;
            return this;
        };
        module.exports = defineCustomEvent;
    },
    "8": function(require, module, exports, global) {
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
    "9": function(require, module, exports, global) {
        "use stricts";
        var object = require("2");
        var defineCustomEvent = require("7");
        var elem = document.createElement("div");
        var base = null;
        var keys = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            msTransition: "MSTransitionEnd",
            transition: "transitionend"
        };
        object.each(keys, function(val, key) {
            if (key in elem.style) base = val;
        });
        var onDispatch = function(custom, e) {
            custom.propertyName = e.propertyName;
            custom.elapsedTime = e.elapsedTime;
            custom.pseudoElement = e.pseudoElement;
        };
        defineCustomEvent("transitionend", {
            base: base,
            condition: function() {
                return true;
            },
            onDispatch: onDispatch
        });
        defineCustomEvent("owntransitionend", {
            base: "transitionend",
            condition: function(e) {
                return e.target === this;
            }
        });
    },
    a: function(require, module, exports, global) {
        "use scrict";
    }
});
