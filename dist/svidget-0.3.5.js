/*** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Svidget.js v0.3.5
 * Release Date: 2018-08-13
 * 
 * A framework for creating complex widgets using SVG.
 * 
 * http://www.svidget.com/
 * 
 * Copyright 2018, Joe Agster
 * Licensed under the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 

;
!function(global, factory) {
    "function" == typeof define && define.amd ? define([ "svidget" ], factory) : "object" == typeof module && module.exports ? module.exports = factory : global.svidget = factory(global);
}(this, function(global, createOptions) {
    var Svidget = {}, window = global, document = window.document || {};
    Svidget.root = null;
    Svidget.global = global;
    Svidget.version = "0.3.5";
    Svidget.declaredHandlerName = "_declared";
    Svidget.emptyArray = [];
    Svidget.defaultType = "object";
    Svidget.array = function(anyCollection) {
        if (!anyCollection || !anyCollection.length) return null;
        try {
            return Svidget.emptyArray.slice.call(anyCollection, 0);
        } catch (e) {
            for (var res = [], i = 0; i < anyCollection.length; i++) res.push(anyCollection[i]);
            return res;
        }
    };
    Svidget.isArray = function(array) {
        return null != array && (Array.isArray(array) || Array.prototype.isPrototypeOf(array) || array.length && array.push);
    };
    Svidget.isFunction = function(func) {
        return "function" == typeof func;
    };
    Svidget.isString = function(str) {
        return "string" == typeof str || str.length && str.trim && str.charAt;
    };
    Svidget.isColor = function(color) {
        return false;
    };
    Svidget.convert = function(val, type, subtype, typedata) {
        return Svidget.Conversion.to(val, type, subtype, typedata);
    };
    Svidget.getType = function(val) {
        if (null == val) return Svidget.defaultType;
        if (Svidget.isArray(val)) return "array";
        var type = typeof val;
        return "string" === type || "number" === type || "boolean" === type ? type : "object";
    };
    Svidget.resolveType = function(type) {
        type = Svidget.Conversion.toString(type);
        return void 0 === Svidget.ParamTypes[type] ? Svidget.defaultType : "bool" === type ? "boolean" : type;
    };
    Svidget.resolveSubtype = function(type, subtype) {
        type = Svidget.resolveType(type);
        return void 0 === Svidget.ParamSubTypes[subtype] ? null : "string" != type || "color" != subtype && "regex" != subtype && "color" != subtype ? "number" == type && "integer" == subtype ? subtype : null : subtype;
    };
    Svidget.extend = function(objtype, prototype, overwrite) {
        for (var methodName in prototype) (overwrite || void 0 === objtype.prototype[methodName]) && (objtype.prototype[methodName] = prototype[methodName]);
    };
    Svidget.wrap = function(func, context) {
        if (null != func && "function" == typeof func) {
            return function() {
                return func.apply(context, arguments);
            };
        }
    };
    Svidget.findFunction = function(funcNameOrInstance, scope) {
        if ("function" == typeof funcNameOrInstance) return funcNameOrInstance;
        null == scope && (scope = window);
        if (null != funcNameOrInstance) {
            var bind = funcNameOrInstance + "", func = scope[bind];
            null == func && scope !== global && (func = global[bind]);
            return null == func ? null : "function" == typeof func ? func : "return " != bind.substr(0, 7) ? new Function("return " + bind) : new Function(bind);
        }
        return null;
    };
    Svidget.log = function(msg) {
        Svidget.Settings.enableLogging && console.log(msg);
    };
    Svidget.readOnlyProperty = function(value) {
        return {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value
        };
    };
    Svidget.fixedProperty = function(value) {
        return {
            enumerable: true,
            configurable: false,
            writable: true,
            value: value
        };
    };
    Svidget.getPrivateAccessor = function(privates) {
        return function(p) {
            return privates[p];
        };
    };
    Svidget.setPrivateAccessor = function(privates) {
        return function(p, val) {
            if (!privates.writable.contains(p)) return false;
            privates[p] = val;
            return true;
        };
    };
    Svidget.returnFalse = function() {
        return false;
    };
    Svidget.returnTrue = function() {
        return true;
    };
    Svidget.Settings = {};
    Svidget.Settings.showPrivates = true;
    Svidget.Settings.enableLogging = false;
    Array.prototype.contains || (Array.prototype.contains = function(obj) {
        for (var i = this.length; i--; ) if (this[i] === obj) return true;
        return false;
    });
    Array.isArray || (Array.isArray = function(arg) {
        return "[object Array]" === Object.prototype.toString.call(arg);
    });
    Svidget.ObjectPrototype = {
        setup: function(privates) {
            this.getPrivate = Svidget.getPrivateAccessor(privates);
            this.setPrivate = Svidget.setPrivateAccessor(privates);
            Svidget.Settings.showPrivates && (this.privates = privates);
        },
        getset: function(prop, val, type, validator) {
            var curProp = this.getPrivate(prop);
            if (void 0 === val) return curProp;
            null != type && (val = Svidget.convert(val, type));
            if (val === curProp) return false;
            if (validator && !validator.call(this, val)) return false;
            var success = this.setPrivate(prop, val);
            return success;
        },
        select: function(col, selector) {
            if ("number" == typeof selector) {
                selector = parseInt(selector);
                return col.wrap(col.getByIndex(selector));
            }
            return "function" == typeof selector ? col.where(selector) : void 0 !== selector ? col.wrap(col.getByName(selector + "")) : col;
        },
        selectFirst: function(col, selector) {
            if ("number" == typeof selector) {
                selector = parseInt(selector);
                return col.getByIndex(selector);
            }
            return "function" == typeof selector ? col.first(selector) : void 0 !== selector ? col.getByName(selector + "") : col.first();
        },
        wireCollectionAddRemoveHandlers: function(col, addFunc, removeFunc) {
            if (null != col) {
                col.onAdded(Svidget.wrap(addFunc, this));
                col.onRemoved(Svidget.wrap(removeFunc, this));
            }
        }
    };
    Svidget.EventPrototype = function(typelist) {
        this.eventTypes = new Svidget.Collection(typelist);
    };
    Svidget.EventPrototype.prototype = {
        on: function(type, data, name, handler) {
            var argsCount = Svidget.isFunction(handler) ? 4 : Svidget.isFunction(name) ? 3 : Svidget.isFunction(data) ? 2 : 1;
            handler = 4 == argsCount ? handler : 3 == argsCount ? name : 2 == argsCount ? data : null;
            data = 2 < argsCount ? data : null;
            name = 3 < argsCount ? name : null;
            return !!handler && this.addHandler(type, handler, name, data);
        },
        off: function(type, handlerOrName) {
            var handler = Svidget.isFunction(handlerOrName) ? handlerOrName : null, name = null != handler ? null : handlerOrName;
            return this.removeHandler(type, handler, name);
        },
        trigger: function(type, value, originalTarget) {
            if (null != type) {
                var e = this.triggerHandlers(type, value, originalTarget);
                Svidget.log("trigger: " + type);
                e.isPropagationStopped() || this.bubble(type, e);
            }
        },
        triggerHandlers: function(type, value, originalTarget) {
            var e = new Svidget.Event(null, type, null, this.getTarget(), originalTarget, value);
            if (null == type || null == this.handlers || null == this.handlers[type]) return e;
            var handlers = this.handlers[type];
            handlers.each(function(h) {
                if (e.isImmediatePropagationStopped()) return false;
                if (null != h && null != h.handler && "function" == typeof h.handler) {
                    e.name = h.name;
                    e.data = h.data;
                    h.handler.call(null, e);
                }
            });
            return e;
        },
        bubble: function(type, sourceEvent) {
            this.ensureBubbleParents();
            sourceEvent.name = null;
            sourceEvent.data = null;
            this.bubbleParents[type] && this.bubbleParents[type](type, sourceEvent, this.getTarget());
        },
        addHandler: function(type, handler, name, data) {
            this.ensureHandlersByType(type);
            if (this.handlerExists(type, handler, name)) return false;
            var obj = this.toHandlerObject(handler, name, data);
            this.handlers[type].push(obj);
            return true;
        },
        removeHandler: function(type, handler, name) {
            this.ensureHandlers();
            if (!this.handlers[type]) return false;
            var that = this;
            return this.handlers[type].removeWhere(function(item) {
                return that.handlerMatch(item, handler, name);
            });
        },
        handlerExists: function(type, handler, name) {
            var that = this, any = this.handlers[type].any(function(item) {
                return that.handlerMatch(item, handler, name);
            });
            return any;
        },
        handlerMatch: function(handlerObj, handler, name) {
            return null != name && handlerObj.name === name || handler === handlerObj.handler;
        },
        setBubbleParent: function(type, callback) {
            this.ensureBubbleParents();
            this.bubbleParents[type] = callback;
        },
        registerBubbleCallback: function(types, bubbleTarget, callback) {
            if (bubbleTarget && callback) for (var i = 0; i < types.length; i++) this.setBubbleParent(types[i], Svidget.wrap(callback, bubbleTarget));
        },
        toHandlerObject: function(handler, name, data) {
            var res = {
                handler: handler,
                name: name,
                data: data
            };
            return res;
        },
        bubbleFuncs: function(objectType) {},
        ensureHandlers: function() {
            this.handlers || (this.handlers = {});
        },
        ensureHandlersByType: function(type) {
            this.ensureHandlers();
            this.handlers[type] || (this.handlers[type] = new Svidget.Collection());
        },
        ensureBubbleParents: function() {
            this.bubbleParents || (this.bubbleParents = {});
        },
        getTarget: function() {
            return this;
        }
    };
    Svidget.ParamPrototype = {
        name: function(val) {
            if (void 0 !== val) return false;
            var res = this.getPrivate("name");
            return res;
        },
        description: function(val) {
            var res = this.getset("description", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("description");
            this.trigger && this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        type: function(val) {
            null === val && (val = Svidget.resolveType(null));
            "bool" == val && (val = "boolean");
            var res = this.getset("type", val, "string", this.validateType);
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("type");
            this.trigger && this.trigger("change", {
                property: "type",
                value: val
            });
            return true;
        },
        subtype: function(val) {
            var res = this.getset("subtype", val, "string", this.validateSubtype);
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("subtype");
            this.trigger && this.trigger("change", {
                property: "subtype",
                value: val
            });
            return true;
        },
        typedata: function(val) {
            var res = this.getset("typedata", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("typedata");
            this.trigger && this.trigger("change", {
                property: "typedata",
                value: val
            });
            return true;
        },
        defvalue: function(val) {
            var res = this.getset("defvalue", val);
            if (void 0 === val || !!!res) return res;
            this.trigger && this.trigger("change", {
                property: "defvalue",
                value: val
            });
            return true;
        },
        validateType: function(t) {
            return "string" !== !typeof t && void 0 !== Svidget.ParamTypes[t];
        },
        validateSubtype: function(t) {
            return true;
        },
        _resolveType: function(type, value, defvalue) {
            value = null != value ? value : defvalue;
            type = null == type ? Svidget.getType(value) : Svidget.resolveType(type);
            return type;
        }
    };
    Svidget.Collection = function(array) {
        this.__type = "Svidget.Collection";
        this.source = array;
        array && (Svidget.isArray(array) || Array.prototype.isPrototypeOf(array)) && this.push.apply(this, array);
    };
    Svidget.Collection.prototype = new Array();
    Svidget.extend(Svidget.Collection, {
        any: function(predicate) {
            if (null == predicate) return 0 < this.length;
            for (var i = 0; i < this.length; i++) if (predicate(this[i])) return true;
            return false;
        },
        all: function(predicate) {
            if (null == predicate) return false;
            for (var i = 0; i < this.length; i++) if (!predicate(this[i])) return false;
            return true;
        },
        contains: function(obj) {
            return 0 <= this.indexOf(obj);
        },
        each: function(operation) {
            for (var i = 0; i < this.length; i++) {
                var res = operation(this[i]);
                if (false === res) break;
            }
        },
        first: function(predicate) {
            if (0 == this.length) return null;
            if (null == predicate || "function" === !typeof predicate) return this[0];
            for (var i = 0; i < this.length; i++) if (predicate(this[i])) return this[i];
            return null;
        },
        last: function(predicate) {
            if (0 == this.length) return null;
            if (null == predicate || "function" === !typeof predicate) return this[0];
            for (var i = this.length - 1; 0 <= i; i--) if (predicate(this[i])) return this[i];
            return null;
        },
        select: function(selector) {
            for (var result = [], i = 0; i < this.length; i++) result.push(selector(this[i]));
            return new Svidget.Collection(result);
        },
        where: function(predicate) {
            for (var result = [], i = 0; i < this.length; i++) predicate(this[i]) && result.push(this[i]);
            return new Svidget.Collection(result);
        },
        add: function(obj) {
            var pos = this.indexOf(obj);
            if (0 <= pos) return false;
            this.push(obj);
            return true;
        },
        addRange: function(array) {
            if (!Svidget.isArray(array)) return false;
            this.push.apply(this, array);
            return true;
        },
        insert: function(obj, index) {
            index = parseInt(index);
            if (!isNaN(index) && (index < 0 || index > this.length)) return false;
            this.splice(index, 0, obj);
            return true;
        },
        remove: function(obj) {
            var pos = this.indexOf(obj);
            if (pos < 0) return false;
            this.splice(pos, 1);
            return true;
        },
        removeAll: function(obj) {
            for (var removed = false; this.remove(obj); ) removed = true;
            return removed;
        },
        clear: function() {
            this.splice(0, this.length);
            return true;
        },
        removeWhere: function(predicate) {
            for (var result = [], removed = false, i = 0; i < this.length; i++) predicate(this[i]) && result.push(this[i]);
            for (i = 0; i < result.length; i++) removed = this.remove(result[i]) || removed;
            return removed;
        },
        toArray: function() {
            for (var arr = [], i = 0; i < this.length; i++) arr.push(this[i]);
            return arr;
        }
    });
    Svidget.ObjectCollection = function(array, type) {
        Svidget.Collection.apply(this, [ array ]);
        this.__type = "Svidget.ObjectCollection";
        this._ctor = Svidget.ObjectCollection;
        var privates = new function() {
            this.writable = [ "addedFunc", "removedFunc" ];
            this.type = type;
            this.addedFunc = null;
            this.removedFunc = null;
        }();
        this.setup(privates);
    };
    var base = new Svidget.Collection();
    Svidget.ObjectCollection.prototype = base;
    Svidget.ObjectCollection.prototype.base_add = base.add;
    Svidget.ObjectCollection.prototype.base_remove = base.remove;
    Svidget.extend(Svidget.ObjectCollection, {
        get: function(selector) {
            return "number" == typeof selector ? col.getByIndex(selector) : col.getByName(selector);
        },
        getByIndex: function(index) {
            if (null == index || isNaN(index)) return null;
            index = parseInt(index);
            var res = this[index];
            return null == res ? null : res;
        },
        getByName: function(name) {
            return this.first(function(p) {
                return p.name() == name;
            });
        },
        type: function() {
            return this.getset("type");
        },
        add: function() {
            if (0 == arguments.length) return null;
            var item, arg0, success;
            1 <= arguments.length && (arg0 = arguments[0]);
            item = "string" == typeof arg0 ? this.create.apply(this, arguments) : arg0;
            if (null == item) return null;
            success = this.addObject(item);
            if (!success) return null;
            this.triggerAdded(item);
            return item;
        },
        addObject: function(obj) {
            if (null == obj || !obj instanceof this.type()) return false;
            if (void 0 !== obj.name && null != this.getByName(obj.name())) return false;
            this.push(obj);
            return obj;
        },
        create: function() {
            return null;
        },
        remove: function(name) {
            var item = this.getByName(name);
            if (null == item) return false;
            var success = this.base_remove(item);
            if (!success) return false;
            this.triggerRemoved(item);
            return true;
        },
        wrap: function(item) {
            var items = [ item ];
            (null == item || !item instanceof this.type()) && (items = []);
            var col = new Svidget.Collection(items);
            return col;
        },
        onAdded: function(func) {
            this.getset("addedFunc", func);
        },
        onRemoved: function(func) {
            this.getset("removedFunc", func);
        },
        triggerAdded: function(item) {
            var func = this.getset("addedFunc");
            func && func(item);
        },
        triggerRemoved: function(item) {
            var func = this.getset("removedFunc");
            func && func(item);
        }
    }, true);
    Svidget.extend(Svidget.Collection, Svidget.ObjectPrototype);
    Svidget.Communicator = function() {
        this.__type = "Svidget.Communicator";
        this.sameDomain = null;
        this._init();
    };
    Svidget.Communicator.prototype = {
        _init: function() {
            this.addMessageEvent();
        },
        addMessageEvent: function() {
            window.addEventListener && window.addEventListener("message", Svidget.wrap(this.receiveXSM, this), false);
        },
        receiveFromParent: function(name, payload) {
            svidget.receiveFromParent(name, payload);
        },
        receiveFromWidget: function(name, payload, widgetID) {
            svidget.receiveFromWidget(name, payload, widgetID);
        },
        receiveXSM: function(message) {
            if (null != message) {
                var msgData = message.data;
                null != msgData && (void 0 !== msgData.widget ? this.receiveFromWidget(msgData.name, msgData.payload, msgData.widget) : this.receiveFromParent(msgData.name, msgData.payload));
            }
        },
        signalParent: function(name, payload, widgetID) {
            this.isParentSameDomain() ? this.signalParentDirect(name, payload, widgetID) : this.signalParentXSM(name, payload, widgetID);
        },
        signalParentDirect: function(name, payload, widgetID) {
            if (null != window.parent && window !== window.parent && null != window.parent.svidget && window.parent.svidget) {
                var root = window.parent.svidget;
                setTimeout(function() {
                    root.routeFromWidget(name, payload, widgetID);
                }, 0);
            }
        },
        signalParentXSM: function(name, payload, widgetID) {
            if (null != window.parent && null != window.parent.postMessage) {
                var msg = this.buildSignalParentMessage(name, payload, widgetID);
                window.parent.postMessage(msg, "*");
            }
        },
        buildSignalParentMessage: function(name, payload, widgetID) {
            return {
                name: name,
                payload: payload,
                widget: widgetID
            };
        },
        isParentSameDomain: function() {
            null == this.sameParentDomain && (this.sameParentDomain = this.checkParentSameDomain());
            return this.sameParentDomain;
        },
        checkParentSameDomain: function() {
            if (null == window.parent) return false;
            try {
                window.parent.document;
                return true;
            } catch (ex) {
                return false;
            }
        },
        signalWidget: function(widgetRef, name, payload) {
            Svidget.log("communicator: signalWidget {name: " + name + "}");
            widgetRef.isCrossDomain() ? this.signalWidgetXSM(widgetRef, name, payload) : this.signalWidgetDirect(widgetRef, name, payload);
        },
        signalWidgetDirect: function(widgetRef, name, payload) {
            if (null != widgetRef) {
                var root = widgetRef.root();
                null != root && setTimeout(function() {
                    root.receiveFromParent(name, payload);
                }, 0);
            }
        },
        signalWidgetXSM: function(widgetRef, name, payload) {
            if (null != widgetRef && null != widgetRef.window()) {
                var msg = this.buildSignalWidgetMessage(name, payload);
                setTimeout(function() {
                    Svidget.log("communicator: postMessage");
                    widgetRef.window().postMessage(msg, "*");
                }, 0);
            }
        },
        buildSignalWidgetMessage: function(name, payload) {
            return {
                name: name,
                payload: payload
            };
        }
    };
    Svidget.Conversion = {};
    Svidget.Conversion.to = function(val, type, subtype, typedata) {
        var t = Svidget.ParamTypes[type] || Svidget.ParamTypes.object, st = Svidget.ParamSubTypes[subtype] || Svidget.ParamSubTypes.none;
        switch (t) {
          case Svidget.ParamTypes.string:
            return Svidget.Conversion.toString(val, st, typedata);

          case Svidget.ParamTypes.number:
            return Svidget.Conversion.toNumber(val, st == Svidget.ParamSubTypes.integer);

          case Svidget.ParamTypes.bool:
            return Svidget.Conversion.toBool(val);

          case Svidget.ParamTypes.array:
            return Svidget.Conversion.toArray(val);

          default:
            return Svidget.Conversion.toObject(val);
        }
    };
    Svidget.Conversion.toString = function(val, subtype, typedata) {
        return null == val ? null : subtype == Svidget.ParamSubTypes.choice ? Svidget.Conversion.toChoiceString(val, typedata) : Svidget.isArray(val) || "object" == typeof val ? JSON.stringify(val) : val + "";
    };
    Svidget.Conversion.toChoiceString = function(val, typedata) {
        val += "";
        if (null == typedata) return val;
        var choices = typedata.split("|");
        return null == choices || 0 == choices.length ? null : 0 <= choices.indexOf(val) ? val : choices[0];
    };
    Svidget.Conversion.toNumber = function(val, isInt) {
        if (!val) return 0;
        if (true === val) return 1;
        if (isInt) return parseInt(val + "");
        val = parseFloat(val);
        isNaN(val) && (val = 0);
        return val;
    };
    Svidget.Conversion.toBool = function(val) {
        var strval = val + "";
        return "false" != strval.toLowerCase() && (0 != +val && !!val);
    };
    Svidget.Conversion.toArray = function(val) {
        if (null == val) return val;
        if (Svidget.isArray(val)) return val;
        if (Svidget.Conversion.isArrayString(val)) {
            var a = Svidget.Conversion.parseArray(val);
            if (null != a) return a;
        }
        return [ val ];
    };
    Svidget.Conversion.toObject = function(val) {
        if (null == val) return val;
        if (Svidget.Conversion.isJSONString(val)) {
            var newval = Svidget.Conversion.jsonifyString(val);
            try {
                return JSON.parse(newval);
            } catch (ex) {}
        }
        return val;
    };
    Svidget.Conversion.isJSONString = function(val) {
        if (!val) return false;
        val = (val + "").trim();
        return 0 < val.length && Svidget.isString(val) && "{" == val.charAt(0) && "}" == val.charAt(val.length - 1);
    };
    Svidget.Conversion.isArrayString = function(val) {
        if (null == val) return false;
        val = (val + "").trim();
        return 0 < val.length && "[" == val.charAt(0) && "]" == val.charAt(val.length - 1);
    };
    Svidget.Conversion.isQuotedString = function(val) {
        if (!val) return false;
        val = (val + "").trim();
        return 0 < val.length && Svidget.isString(val) && ("'" == val.charAt(0) && "'" == val.charAt(val.length - 1) || '"' == val.charAt(0) && '"' == val.charAt(val.length - 1));
    };
    Svidget.Conversion.parseArray = function(val) {
        val = Svidget.Conversion.jsonifyString(val);
        var wrap = '{"d":' + val + "}";
        try {
            var result = JSON.parse(wrap);
            return result && result.d ? result.d : null;
        } catch (ex) {
            return null;
        }
    };
    Svidget.Conversion.jsonifyString = function(val) {
        if (null == val || val.indexOf("'") < 0) return val;
        val = (val + "").trim();
        for (var result = "", inQuotes = false, quoteChar = null, escaped = false, i = 0; i < val.length; i++) {
            var char = val[i], newchar = char;
            if ("'" == char || '"' == char) {
                if (escaped) {
                    "'" == quoteChar && "'" == char ? result = result.substr(0, result.length - 1) : "'" == quoteChar && '"' == char && (newchar = '\\\\"');
                    escaped = false;
                } else if (inQuotes && char == quoteChar) {
                    inQuotes = false;
                    quoteChar = null;
                    newchar = '"';
                } else if (inQuotes && '"' == char) newchar = '\\"'; else if (!inQuotes) {
                    quoteChar = char;
                    inQuotes = true;
                    newchar = '"';
                }
            } else "\\" == char && (escaped = true);
            result += newchar;
        }
        return result;
    };
    Svidget.DOM = {
        get: function(sel) {
            return document.getElementById ? document.getElementById(sel) : null;
        },
        getByName: function(tagName, asCollection) {
            return this.getChildrenByName(document, tagName, asCollection);
        },
        getByNameNS: function(namespace, tagName, asCollection) {
            if (!document.getElementsByTagNameNS) return null;
            var tags = document.getElementsByTagNameNS(namespace, tagName);
            return asCollection ? new Svidget.Collection(Svidget.array(tags)) : tags;
        },
        getByNameSvidget: function(tagName, asCollection) {
            return this.getByNameNS(Svidget.Namespaces.svidget, tagName, asCollection);
        },
        getChildrenByName: function(source, tagName, asCollection) {
            var tags = source.getElementsByTagName(tagName);
            return asCollection ? new Svidget.Collection(Svidget.array(tags)) : tags;
        },
        getElement: function(sel) {
            return "string" == typeof sel ? this.get(sel) : sel;
        },
        getItem: function(sel) {
            return this.wrap(this.get(sel));
        },
        select: function(sel) {
            if (!document.querySelectorAll) return null;
            if (null == sel) return null;
            var res, hasAttr = /@[^=#\s]+/g.test(sel), col = new Svidget.Collection();
            if (hasAttr) for (var parts = sel.split(","), i = 0; i < parts.length; i++) {
                res = selectSingle(parts[i]);
                res && col.addRange(res);
            } else {
                res = selectSingle(sel);
                res && col.addRange(res);
            }
            var query = new Svidget.DOMQuery(col, sel);
            return query;
            function selectSingle(s) {
                if (null == s) return null;
                var attrName, eles, sel = s, match = /@([^=#\s]+)$/g.exec(s);
                if (match) {
                    attrName = match[1];
                    sel = sel.replace(match[0], "");
                }
                try {
                    eles = document.querySelectorAll(sel);
                } catch (ex) {
                    return null;
                }
                for (var col = [], i = 0; i < eles.length; i++) {
                    var item, ele = eles[i];
                    if (attrName) {
                        var attr = Svidget.DOM.attr(ele, attrName);
                        null != attr && (item = new Svidget.DOMItem(attr));
                    } else item = new Svidget.DOMItem(ele);
                    item && col.push(item);
                }
                return new Svidget.Collection(col);
            }
        },
        selectElement: function(sel) {
            if ("string" == typeof sel) {
                var q = this.select(sel);
                return null == q || 0 == q.length ? null : q.item(0).source();
            }
            return this.isElement(sel) ? sel : null;
        },
        wrap: function(ele) {
            return new Svidget.DOMItem(ele);
        },
        transportize: function(ele) {
            return null == ele ? null : {
                name: ele.localName,
                namespace: ele.namespaceURI,
                value: ele.value,
                type: 1 == ele.nodeType ? Svidget.NodeType.element : 2 == ele.nodeType ? Svidget.NodeType.attribute : null
            };
        },
        root: function() {
            return document.documentElement;
        },
        rootItem: function() {
            return this.wrap(this.root());
        },
        attr: function(ele, attrName) {
            return ele.attributes[attrName];
        },
        attrValue: function(ele, attrName) {
            var a = this.attr(ele, attrName);
            return a ? a.value : null;
        },
        isAttrEmpty: function(ele, attrName) {
            var av = this.attrValue(ele, attrName);
            return null != av && 0 == av.length;
        },
        clone: function(item) {},
        cloneDetached: function(item) {},
        isDOMNode: function(node) {
            return null == node ? null : !(null == node.namespaceURI || null == node.localName || null == node.nodeType || null == node.value && null == node.textContent || 1 != node.nodeType && 2 != node.nodeType);
        },
        fromNodeType: function(type) {
            return 1 == type ? "element" : 2 == type ? "attribute" : 3 == type ? "text" : null;
        },
        text: function(sel, text) {
            var obj = this.select(sel);
            if (void 0 === text) return this.getText(obj);
            this.setText(obj, text);
        },
        getText: function(obj) {
            return obj.textContent ? obj.textContent : obj.innerHTML ? obj.innerHTML : null;
        },
        setText: function(obj, text) {
            obj.textContent ? obj.textContent = text + "" : obj.innerHTML && (obj.innerHTML = text + "");
        },
        getDocument: function(objOrWinEle) {
            try {
                var doc = objOrWinEle.contentDocument;
                null != objOrWinEle.contentWindow && objOrWinEle.contentWindow.document;
                return null != doc && "about:blank" == doc.URL ? null : doc;
            } catch (ex) {
                return;
            }
        },
        isElementDocumentReady: function(objOrWinEle) {
            return null !== this.getDocument(objOrWinEle);
        },
        isElement: function(ele) {
            if (HTMLElement) return ele instanceof HTMLElement;
        },
        attach: function(containerEle, eles) {},
        detach: function(sel) {},
        disable: function(ele) {
            ele.disabled = true;
        },
        enable: function(ele) {
            ele.disabled = false;
        },
        show: function(ele, val) {
            ele.style.display = "initial";
            ele.style.visibility = "visible";
        },
        hide: function(ele, val) {
            ele.style.display = "none";
            ele.style.visibility = "hidden";
        },
        on: function(obj, type, callback, capture) {
            capture = !!capture;
            var attached = false;
            if (obj.addEventListener) {
                obj.addEventListener(type, callback, capture);
                attached = true;
            } else if (obj.attachEvent) {
                obj.attachEvent("on" + type, callback);
                attached = true;
            }
            return attached;
        },
        off: function(obj, type, callback, capture) {
            capture = !!capture;
            var detached = false;
            if (obj.removeEventListener) {
                obj.removeEventListener(type, callback, false);
                detached = true;
            } else if (document.detachEvent) {
                document.detachEvent("on" + type, callback);
                detached = true;
            }
            return detached;
        }
    };
    Svidget.DOMItem = function(source) {
        this.__type = "Svidget.DOMItem";
        source = source || {};
        var typeCode, privates = new function() {
            this.writable = [ "value" ];
            this.type = null;
            this.typeCode = null;
            this.name = null;
            this.value = null;
            this.namespace = null;
            this.source = source;
            this.sourceDOM = Svidget.DOM.isDOMNode(source);
        }();
        this.setup(privates);
        if (privates.sourceDOM) {
            privates.typeCode = 1 == source.nodeType ? Svidget.NodeType.element : 2 == source.nodeType ? Svidget.NodeType.attribute : null;
            privates.name = source.localName;
            privates.namespace = source.namespaceURI;
        } else {
            privates.typeCode = source.type;
            privates.name = source.name;
            privates.namespace = source.namespace;
        }
        privates.value = source.value || source.textContent;
        privates.type = (typeCode = privates.typeCode, typeCode == Svidget.NodeType.element ? "element" : typeCode == Svidget.NodeType.attribute ? "attribute" : null);
        privates.namespaceType = function(namespace) {
            for (var n in Svidget.Namespaces) if (namespace === Svidget.Namespaces[n]) return n;
        }(privates.namespace);
        this.cachedAttributes = null;
        this.cachedElements = null;
    };
    Svidget.DOMItem.prototype = {
        typeCode: function() {
            return this.getset("type");
        },
        name: function() {
            return this.getset("name");
        },
        value: function(val) {
            var source = this.source();
            if (void 0 === val) return source.value || source.textContent;
            var strval = val + "";
            source.value ? source.value = strval : source.textContent = strval;
        },
        namespace: function() {
            return this.getset("namespace");
        },
        namespaceType: function() {
            return this.getset("namespaceType");
        },
        hasElements: function() {
            if (this.isAttribute()) return false;
            var source = this.source();
            return !!(this.isAttached() || source.children && source.children.length) && 0 < source.children.length;
        },
        hasAttributes: function() {
            if (this.isAttribute()) return false;
            var source = this.source();
            return !!(this.isAttached() || source.attributes && source.attributes.length) && 0 < source.attributes.length;
        },
        isAttribute: function() {
            return this.type() == Svidget.NodeType.attribute;
        },
        elements: function() {
            if (null != this.cachedElements && Svidget.isArray(this.cachedElements)) return this.cachedElements;
            var isDOM = this.isAttached(), source = this.source();
            if (!(isDOM || source.elements && source.elements.length)) return null;
            var origcol = isDOM ? source.children : source.elements, eles = new Svidget.Collection(Svidget.array(origcol));
            eles = eles.select(function(e) {
                return new Svidget.DOMItem(e);
            });
            this.cachedElements = eles;
            return this.cachedElements;
        },
        attributes: function() {
            if (null != this.cachedAttributes && Svidget.isArray(this.cachedAttributes)) return this.cachedAttributes;
            var isDOM = this.isAttached(), source = this.source();
            if (!(isDOM || source.attributes && source.attributes.length)) return null;
            var origcol = source.attributes, attrs = new Svidget.Collection(Svidget.array(origcol));
            attrs = attrs.select(function(a) {
                return new Svidget.DOMItem(a);
            });
            this.cachedAttributes = attrs;
            return this.cachedAttributes;
        },
        source: function() {
            return this.getset("source");
        },
        isAttached: function() {
            return this.getset("sourceDOM");
        }
    };
    Svidget.extend(Svidget.DOMItem, Svidget.ObjectPrototype);
    Svidget.DOMQuery = function(domItemCollection, selector) {
        this.__type = "Svidget.DOMQuery";
        var items = new Svidget.Collection(domItemCollection), privates = new function() {
            this.writable = [];
            this.items = items;
            this.selector = selector;
        }();
        this.getPrivate = Svidget.getPrivateAccessor(privates);
        this.setPrivate = Svidget.setPrivateAccessor(privates);
        Object.defineProperty(this, "length", {
            enumerable: true,
            configurable: false,
            writable: false,
            value: items.length || 0
        });
    };
    Svidget.DOMQuery.prototype = {
        items: function() {
            return this.getset("items");
        },
        item: function(index) {
            var items = this.items();
            return null == items ? null : items[index];
        },
        hasItems: function() {
            return 0 < this.length;
        },
        selector: function() {
            return this.getset("selector");
        },
        setValue: function(val) {
            this.items().each(function(i) {
                i.value(val);
            });
        },
        toString: function() {
            return '[Svidget.DOMQuery { selector: "' + this.selector() + '", items: ' + this.items().length + "}]";
        }
    };
    Svidget.extend(Svidget.DOMQuery, Svidget.ObjectPrototype);
    Svidget.DocType = {
        html: 0,
        svg: 1
    };
    Svidget.DocReadyState = {
        loading: 0,
        interactive: 1,
        complete: 2
    };
    Svidget.ElementReadyState = {
        uninitialized: 0,
        loading: 1,
        loaded: 2,
        interactive: 3,
        complete: 4
    };
    Svidget.ParamTypes = {
        object: 0,
        string: 1,
        number: 2,
        boolean: 3,
        bool: 3,
        array: 4,
        function: 5
    };
    Svidget.ParamSubTypes = {
        none: 0,
        color: 1,
        integer: 2,
        regex: 3,
        choice: 4
    };
    Svidget.NodeType = {
        element: 0,
        attribute: 1
    };
    Svidget.Namespaces = {
        html: "http://www.w3.org/1999/xhtml",
        svidget: "http://www.svidget.org/svidget",
        svg: "http://www.w3.org/2000/svg",
        xlink: "http://www.w3.org/1999/xlink"
    };
    Svidget.Event = function(name, type, data, target, origTarget, value) {
        Object.defineProperty(this, "currentTarget", Svidget.readOnlyProperty(target));
        Object.defineProperty(this, "data", Svidget.fixedProperty(data));
        Object.defineProperty(this, "name", Svidget.fixedProperty(name));
        Object.defineProperty(this, "timeStamp", Svidget.readOnlyProperty(+new Date()));
        Object.defineProperty(this, "target", Svidget.readOnlyProperty(null == origTarget ? target : origTarget));
        Object.defineProperty(this, "type", Svidget.readOnlyProperty(type));
        Object.defineProperty(this, "value", Svidget.readOnlyProperty(value));
    };
    Svidget.Event.prototype = {
        isPropagationStopped: Svidget.returnFalse,
        isImmediatePropagationStopped: Svidget.returnFalse,
        stopPropagation: function() {
            this.isPropagationStopped = Svidget.returnTrue;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    };
    Svidget.EventContainer = function(typelist, target) {
        this.__type = "Svidget.EventContainer";
        Svidget.EventPrototype.apply(this, [ typelist ]);
        this.target = target;
    };
    Svidget.EventContainer.prototype = new Svidget.EventPrototype();
    Svidget.extend(Svidget.EventContainer, {
        getTarget: function() {
            return this.target;
        }
    }, true);
    Svidget.Root = function(w, options) {
        this.__type = "Svidget.Root";
        var that = this;
        if (null != w) {
            window = w;
            document = w.document || {};
        }
        var privates = new function() {
            this.writable = [ "current", "widgets", "connected", "loaded" ];
            this.comm = new Svidget.Communicator();
            this.eventContainer = new Svidget.EventContainer([ "loaded" ], that);
            this.loaded = false;
            this.current = null;
            this.connected = false;
            this.widgets = null;
            this.options = options || {};
        }();
        this.setup(privates);
        this.isBrowser = true;
        this.docType = null;
        this.setCurrent = function(widget) {
            privates.current = widget;
        };
        this._init();
        Object.defineProperty(this, "conversion", Svidget.readOnlyProperty(Svidget.Conversion));
        Object.defineProperty(this, "Collection", Svidget.readOnlyProperty(Svidget.Collection));
        Object.defineProperty(this, "dom", Svidget.readOnlyProperty(Svidget.DOM));
        Object.defineProperty(this, "util", Svidget.readOnlyProperty(Svidget.Util));
        Svidget.root = this;
    };
    Svidget.Root.prototype = {
        _init: function() {
            this._initEvents();
            this._initPrototypes();
            this.initInternal();
            this._initReady();
        },
        _initEvents: function() {},
        _initPrototypes: function() {
            this.isWidget() ? Svidget.extend(Svidget.Root, Svidget.Root.WidgetPrototype, true) : Svidget.extend(Svidget.Root, Svidget.Root.PagePrototype, true);
        },
        _initReady: function() {
            this.isDomReady() ? this._ready() : this.addReadyEvents();
        },
        initInternal: function() {},
        _ready: function() {
            this.isReady = true;
            this.isWidget() ? this.readyWidget() : this.readyPage();
        },
        getDocType: function() {
            if (!document.documentElement) return Svidget.DocType.html;
            var localName = document.documentElement.localName, namespaceUri = document.documentElement.namespaceURI;
            return "svg" == localName && namespaceUri == Svidget.Namespaces.svg ? Svidget.DocType.svg : Svidget.DocType.html;
        },
        getOption: function(name) {
            return this.options()[name];
        },
        isWidget: function() {
            if (this.getOption("mode") == Svidget.DocType.svg) return true;
            this.docType = this.getDocType();
            return this.docType == Svidget.DocType.svg;
        },
        isDomReady: function() {
            var rs = document.readyState;
            return !(null == rs || !Svidget.DocReadyState[rs]) && Svidget.DocReadyState[rs] >= Svidget.DocReadyState.interactive;
        },
        addReadyEvents: function() {
            var handler = Svidget.wrap(this.readyHandler, this);
            Svidget.DOM.on(document, "DOMContentLoaded", handler);
            Svidget.DOM.on(document, "readystatechange", handler);
            Svidget.DOM.on(window, "load", handler);
        },
        readyHandler: function() {
            this.ensureReady();
        },
        ensureReady: function() {
            this.isReady || this._ready();
            this.isReady = true;
        },
        markLoaded: function() {
            if (true !== this.getset("loaded")) {
                this.getset("loaded", true);
                this.triggerLoad();
            }
        },
        eventContainer: function() {
            return this.getset("eventContainer");
        },
        on: function(type, data, name, handler) {
            this.eventContainer().on(type, data, name, handler);
        },
        off: function(type, handlerOrName) {
            this.eventContainer().off(type, handlerOrName);
        },
        trigger: function(name, value) {
            this.eventContainer().trigger(name, value);
        },
        loaded: function(data, name, handler) {
            this.onload(data, name, handler);
        },
        onload: function(data, name, handler) {
            this.on("load", data, name, handler);
        },
        offload: function(handlerOrName) {
            this.off("load", handlerOrName);
        },
        offdeclaredload: function() {
            this.off("load", Svidget.declaredHandlerName);
        },
        widgetloaded: function(data, name, handler) {
            this.widgetloaded(data, name, handler);
        },
        onwidgetload: function(data, name, handler) {
            this.on("widgetload", data, name, handler);
        },
        offwidgetload: function(handlerOrName) {
            this.off("widgetload", handlerOrName);
        },
        offdeclaredwidgetload: function() {
            this.off("widgetload", Svidget.declaredHandlerName);
        },
        triggerLoad: function() {
            this.trigger("load");
        },
        triggerWidgetLoad: function(widgetID) {
            this.trigger("widgetload", widgetID);
        },
        comm: function() {
            return this.getset("comm");
        },
        routeFromParent: function(name, payload) {
            Svidget.log("root: routeFromParent {name: " + name + "}");
            this.comm().receiveFromParent(name, payload);
        },
        routeFromWidget: function(name, payload, widgetID) {
            Svidget.log("root: routeFromWidget {name: " + name + "}");
            this.comm().receiveFromWidget(name, payload, widgetID);
        },
        receiveFromParent: function(name, payload) {},
        receiveFromWidget: function(name, payload, widgetID) {},
        current: function() {
            return null;
        },
        connected: function(val) {
            var res = this.getset("connected", val);
            return !(void 0 === val || !res) || res;
        },
        options: function() {
            return this.getset("options");
        }
    };
    Svidget.extend(Svidget.Root, Svidget.ObjectPrototype);
    Svidget.Util = {};
    Svidget.Util.queryString = function(duplicates, lastOneWins) {
        var urlParams = {};
        if (!window.location) return urlParams;
        for (var match, queryString = null == window.location.search || 0 < window.location.search.length ? window.location.search : "", pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function(s) {
            return decodeURIComponent(s.replace(pl, " "));
        }, query = queryString.substring(1); match = search.exec(query); ) {
            var name = decode(match[1]), value = decode(match[2]);
            duplicates ? void 0 !== urlParams[name] ? Svidget.isArray(urlParams[name]) ? urlParams[name].push(value) : urlParams[name] = [ urlParams[name], value ] : urlParams[name] = value : (lastOneWins || void 0 === urlParams[name]) && (urlParams[name] = value);
        }
        return urlParams;
    };
    Svidget.Action = function(name, options, parent) {
        this.__type = "Svidget.Action";
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        var that = this, c = Svidget.Conversion, privates = new function() {
            this.writable = [ "binding", "bindingFunc", "enabled", "external", "description" ];
            this.params = new Svidget.ActionParamCollection([], that);
            this.name = c.toString(name);
            this.description = c.toString(options.description);
            this.enabled = null == options.enabled || c.toBool(options.enabled);
            this.binding = function(binding) {
                if (null == binding) return null;
                "function" != typeof binding && (binding = c.toString(binding));
                return binding;
            }(options.binding);
            this.external = null == options.external || c.toBool(options.external);
            this.parent = parent;
            this.bindingFunc = null;
        }();
        this.setup(privates);
        privates.bindingFunc = Svidget.findFunction(privates.binding);
        this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionBubble);
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);
        !function(params) {
            if (null == params || !Svidget.isArray(params)) return;
            for (var i = 0; i < params.length; i++) {
                var p = params[i];
                null != p.name && that.addParam(p.name, p);
            }
        }(options.params);
    };
    Svidget.Action.prototype = {
        name: function(val) {
            if (void 0 !== val) return false;
            var res = this.getPrivate("name");
            return res;
        },
        parent: function() {
            var res = this.getPrivate("parent");
            return res;
        },
        attached: function() {
            var widget = this.parent();
            return null != widget && widget instanceof Svidget.Widget;
        },
        enabled: function(val) {
            null === val && (val = true);
            var res = this.getset("enabled", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getset("enabled");
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        description: function(val) {
            var res = this.getset("description", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("description");
            this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        external: function(val) {
            null === val && (val = true);
            var res = this.getset("external", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("external");
            this.trigger("change", {
                property: "external",
                value: val
            });
            return true;
        },
        binding: function(bind) {
            if (void 0 !== bind) {
                "function" != typeof bind && null !== bind && (bind += "");
                var func = Svidget.findFunction(bind);
                this.getset("bindingFunc", func);
            }
            var res = this.getset("binding", bind);
            if (void 0 === bind || !!!res) return res;
            this.trigger("change", {
                property: "binding",
                value: bind
            });
            return true;
        },
        bindingFunc: function() {
            var func = this.getset("bindingFunc");
            return func;
        },
        invoke: function() {
            if (!this.enabled()) return false;
            var func = this.invocableBindingFunc();
            if (!func) return false;
            var argArray = this.buildArgumentArray(Svidget.array(arguments)), returnVal = func.apply(null, argArray);
            this.trigger("invoke", {
                returnValue: returnVal
            });
            return true;
        },
        invokeApply: function(args) {
            this.invoke.apply(this, args);
        },
        invocableBindingFunc: function() {
            var func = this.bindingFunc();
            return null == func || "function" != typeof func ? null : func;
        },
        buildArgumentArray: function(args) {
            var argsArray = [];
            args = null == args ? [] : args;
            for (var col = this.params(), i = 0; i < col.length; i++) {
                var p = col[i], arg = void 0;
                i < args.length && (arg = args[i]);
                void 0 === arg && (arg = p.defvalue());
                argsArray.push(arg);
            }
            return argsArray;
        },
        toArgumentObject: function(args) {
            for (var argsObj = {}, col = this.params(), i = 0; i < col.length; i++) {
                var p = col[i], arg = void 0;
                i < args.length && (arg = args[i]);
                void 0 === arg && (arg = p.defvalue());
                argsObj[p.name()] = arg;
            }
            return argsObj;
        },
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params"), item = this.selectFirst(col, selector);
            return item;
        },
        newParam: function(name, options) {
            return new Svidget.ActionParam(name, options, this);
        },
        addParam: function(name, options) {
            return this.params().add(name, options, this);
        },
        removeParam: function(name) {
            return this.params().remove(name);
        },
        removeAllParams: function() {
            return this.params().clear();
        },
        paramBubble: function(type, event, param) {
            "change" == type && this.paramChanged(param, event.value);
        },
        paramChanged: function(param, eventValue) {
            Svidget.log("action: param changed: " + param.name());
            this.trigger("paramchange", eventValue, param);
        },
        paramAdded: function(param) {
            Svidget.log("action: param added: " + param.name());
            this.trigger("paramadd", param);
        },
        paramRemoved: function(param) {
            Svidget.log("action: param removed: " + param.name());
            this.trigger("paramremove", param.name());
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        ondeclaredchange: function(handler) {
            return this.onchange(null, Svidget.declaredHandlerName, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        offdeclaredchange: function() {
            return this.offchange(Svidget.declaredHandlerName);
        },
        oninvoke: function(data, name, handler) {
            return this.on("invoke", data, name, handler);
        },
        ondeclaredinvoke: function(handler) {
            return this.oninvoke(null, Svidget.declaredHandlerName, handler);
        },
        offinvoke: function(handlerOrName) {
            return this.off("invoke", handlerOrName);
        },
        offdeclaredinvoke: function() {
            return this.offinvoke(Svidget.declaredHandlerName);
        },
        onparamadd: function(data, name, handler) {
            return this.on("paramadd", data, name, handler);
        },
        ondeclaredparamadd: function(handler) {
            return this.onparamadd(null, Svidget.declaredHandlerName, handler);
        },
        offparamadd: function(handlerOrName) {
            return this.off("paramadd", handlerOrName);
        },
        offdeclaredparamadd: function() {
            return this.offparamadd(Svidget.declaredHandlerName);
        },
        onparamremove: function(data, name, handler) {
            return this.on("paramremove", data, name, handler);
        },
        ondeclaredparamremove: function(handler) {
            return this.onparamremove(null, Svidget.declaredHandlerName, handler);
        },
        offparamremove: function(handlerOrName) {
            return this.off("paramremove", handlerOrName);
        },
        offdeclaredparamremove: function() {
            return this.offparamremove(Svidget.declaredHandlerName);
        },
        onparamchange: function(data, name, handler) {
            return this.on("paramchange", data, name, handler);
        },
        ondeclaredparamchange: function(handler) {
            return this.onparamchange(null, Svidget.declaredHandlerName, handler);
        },
        offparamchange: function(handlerOrName) {
            return this.off("paramchange", handlerOrName);
        },
        offdeclaredparamchange: function() {
            return this.offparamchange(Svidget.declaredHandlerName);
        },
        toTransport: function() {
            var transport = {
                name: this.name(),
                description: this.description(),
                external: this.external(),
                enabled: this.enabled(),
                params: this.toParamsTransport()
            };
            return transport;
        },
        toParamsTransport: function() {
            var col = this.params(), ps = col.select(function(p) {
                return p.toTransport();
            }).toArray();
            return ps;
        },
        toString: function() {
            return '[Svidget.Action { name: "' + this.name() + '" }]';
        }
    };
    Svidget.Action.eventTypes = [ "invoke", "change", "paramchange", "paramadd", "paramremove" ];
    Svidget.Action.optionProperties = [ "external", "binding", "enabled", "description" ];
    Svidget.Action.allProxyProperties = [ "name", "external", "enabled", "description" ];
    Svidget.Action.writableProxyProperties = [];
    Svidget.extend(Svidget.Action, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.Action, new Svidget.EventPrototype(Svidget.Action.eventTypes));
    Svidget.ActionCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.Action ]);
        this.__type = "Svidget.ActionCollection";
        this.parent = parent;
        this._ctor = Svidget.ActionCollection;
    };
    Svidget.ActionCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.Action(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.ActionParam = function(name, options, parent) {
        this.__type = "Svidget.ActionParam";
        options = options || {};
        parent = parent instanceof Svidget.Action ? parent : null;
        var c = Svidget.Conversion, privates = new function() {
            this.writable = [ "type", "subtype", "typedata", "description", "defvalue" ];
            this.name = c.toString(name);
            this.type = function(type, defvalue) {
                type = null == type ? Svidget.getType(defvalue) : Svidget.resolveType(type);
                return type;
            }(options.type, options.defvalue);
            this.subtype = c.toString(options.subtype);
            this.typedata = c.toString(options.typedata);
            this.description = c.toString(options.description);
            this.defvalue = options.defvalue;
            this.parent = parent;
        }();
        this.setup(privates);
        this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramBubble);
    };
    Svidget.ActionParam.prototype = {
        parent: function() {
            var res = this.getPrivate("parent");
            return res;
        },
        attached: function() {
            var parent = this.parent();
            return null != parent && parent instanceof Svidget.Action;
        },
        toTransport: function() {
            var transport = {
                name: this.name(),
                type: this.type(),
                subtype: this.subtype(),
                typedata: this.typedata(),
                description: this.description(),
                defvalue: this.defvalue()
            };
            return transport;
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        ondeclaredchange: function(handler) {
            return this.onchange(null, Svidget.declaredHandlerName, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        offdeclaredchange: function() {
            return this.offchange(Svidget.declaredHandlerName);
        },
        toString: function() {
            return '[Svidget.ActionParam { name: "' + this.name() + '" }]';
        }
    };
    Svidget.ActionParam.eventTypes = [ "change" ];
    Svidget.ActionParam.optionProperties = [ "type", "subtype", "typedata", "description", "defvalue" ];
    Svidget.ActionParam.allProxyProperties = [ "name", "type", "subtype", "typedata", "description", "defvalue" ];
    Svidget.ActionParam.writableProxyProperties = [];
    Svidget.extend(Svidget.ActionParam, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.ActionParam, Svidget.ParamPrototype);
    Svidget.extend(Svidget.ActionParam, new Svidget.EventPrototype(Svidget.ActionParam.eventTypes));
    Svidget.ActionParamCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionParam ]);
        this.__type = "Svidget.ActionParamCollection";
        this.parent = parent;
        this._ctor = Svidget.ActionParamCollection;
    };
    Svidget.ActionParamCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionParamCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.ActionParam(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.EventDesc = function(name, options, parent) {
        this.__type = "Svidget.EventDesc";
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        var that = this, c = Svidget.Conversion, privates = new function() {
            this.writable = [ "description", "enabled", "external" ];
            this.name = c.toString(name);
            this.description = c.toString(options.description);
            this.external = null == options.external || c.toBool(options.external);
            this.enabled = null == options.enabled || c.toBool(options.enabled);
            this.eventName = "trigger";
            this.eventContainer = new Svidget.EventContainer([ this.eventName ], that);
            this.parent = parent;
        }();
        this.setup(privates);
        privates.eventContainer.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventBubble);
    };
    Svidget.EventDesc.prototype = {
        name: function(val) {
            if (void 0 !== val) return false;
            var res = this.getPrivate("name");
            return res;
        },
        attached: function() {
            this.parent();
            return null != this.parent && this.parent instanceof Svidget.Widget;
        },
        parent: function() {
            var res = this.getPrivate("parent");
            return res;
        },
        enabled: function(val) {
            null === val && (val = true);
            var res = this.getset("enabled", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getset("enabled");
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        description: function(val) {
            var res = this.getset("description", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("description");
            this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        external: function(val) {
            null === val && (val = true);
            var res = this.getset("external", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("external");
            this.trigger("change", {
                property: "external",
                value: val
            });
            return true;
        },
        eventName: function() {
            return this.getPrivate("eventName");
        },
        eventContainer: function() {
            return this.getset("eventContainer");
        },
        on: function(type, data, name, handler) {
            if (Svidget.isFunction(type)) {
                handler = type;
                type = this.eventName();
            }
            this.eventContainer().on(type, data, name, handler);
        },
        ontrigger: function(data, name, handler) {
            this.eventContainer().on(this.eventName(), data, name, handler);
        },
        ondeclaredtrigger: function(handler) {
            return this.ontrigger(null, Svidget.declaredHandlerName, handler);
        },
        off: function(type, handlerOrName) {
            if (Svidget.isFunction(type)) {
                handlerOrName = type;
                type = this.eventName();
            }
            this.eventContainer().off(type, handlerOrName);
        },
        offtrigger: function(handlerOrName) {
            this.eventContainer().off(this.eventName(), handlerOrName);
        },
        offdeclaredtrigger: function() {
            return this.offtrigger(Svidget.declaredHandlerName);
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        ondeclaredchange: function(handler) {
            return this.onchange(null, Svidget.declaredHandlerName, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        offdeclaredchange: function() {
            return this.offchange(Svidget.declaredHandlerName);
        },
        trigger: function(type, value) {
            if (this.enabled()) {
                if (void 0 === value) {
                    value = type;
                    type = this.eventName();
                }
                this.eventContainer().trigger(type, value);
            }
        },
        triggerEvent: function(value) {
            this.trigger(this.eventName(), value);
        },
        toTransport: function() {
            var transport = {
                name: this.name(),
                description: this.description(),
                external: this.external(),
                enabled: this.enabled()
            };
            return transport;
        },
        toString: function() {
            return '[Svidget.EventDesc { name: "' + this.name() + '" }]';
        }
    };
    Svidget.EventDesc.eventTypes = [ "trigger", "change" ];
    Svidget.EventDesc.optionProperties = [ "external", "enabled", "description" ];
    Svidget.EventDesc.allProxyProperties = [ "name", "external", "enabled", "description", "eventContainer" ];
    Svidget.EventDesc.writableProxyProperties = [];
    Svidget.extend(Svidget.EventDesc, Svidget.ObjectPrototype);
    Svidget.EventDescCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.EventDesc ]);
        this.__type = "Svidget.EventDescCollection";
        this.parent = parent;
        this._ctor = Svidget.EventDescCollection;
    };
    Svidget.EventDescCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.EventDescCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.EventDesc(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.Param = function(name, value, options, parent) {
        this.__type = "Svidget.Param";
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        var c = Svidget.Conversion, privates = new function() {
            this.writable = [ "shortname", "binding", "enabled", "type", "subtype", "value", "description", "defvalue", "typedata", "coerce", "group" ];
            this.name = c.toString(name);
            this.shortname = c.toString(options.shortname);
            this.description = c.toString(options.description);
            this.enabled = null == options.enabled || c.toBool(options.enabled);
            this.type = function(type, value, defvalue) {
                value = null != value ? value : defvalue;
                type = null == type ? Svidget.getType(value) : Svidget.resolveType(type);
                return type;
            }(options.type, value, options.defvalue);
            this.subtype = c.toString(options.subtype);
            this.typedata = c.toString(options.typedata);
            this.coerce = c.toBool(options.coerce);
            this.group = c.toString(options.group);
            this.value = this.coerce ? (val = value, type = this.type, subtype = this.subtype, 
            typedata = this.typedata, Svidget.convert(val, type, subtype, typedata)) : value;
            var val, type, subtype, typedata;
            this.defvalue = options.defvalue;
            this.sanitizer = (Svidget.isFunction(options.sanitizer) ? options.sanitizer : c.toString(options.sanitizer)) || null;
            this.parent = parent;
            this.binding = c.toString(options.binding);
            this.bindingQuery = null;
        }();
        this.setup(privates);
        privates.bindingQuery = Svidget.DOM.select(privates.binding);
        privates.sanitizerFunc = Svidget.findFunction(privates.sanitizer);
        this.valuePopulated = false;
        this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramBubble);
    };
    Svidget.Param.prototype = {
        attached: function() {
            this.parent();
            return null != this.parent && this.parent instanceof Svidget.Widget;
        },
        parent: function() {
            var res = this.getPrivate("parent");
            return res;
        },
        shortname: function(val) {
            var res = this.getset("shortname", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("shortname");
            this.trigger("change", {
                property: "shortname",
                value: val
            });
            return true;
        },
        group: function(val) {
            var res = this.getset("group", val, "string");
            if (void 0 === val || !!!res) return res;
            val = this.getPrivate("group");
            this.trigger("change", {
                property: "group",
                value: val
            });
            return true;
        },
        enabled: function(val) {
            null === val && (val = true);
            var res = this.getset("enabled", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getset("enabled");
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        value: function(val) {
            if (!this.enabled() && void 0 !== val) return false;
            var res = this.getset("value", val, null, this.validateValue);
            if (void 0 === val || !!!res) return res;
            var finalVal = val;
            true === this.getset("coerce") && (finalVal = this.coerceValue(finalVal));
            finalVal = this.applySanitizer(finalVal);
            this.setPrivate("value", finalVal);
            this.applyBinding(finalVal);
            this.trigger("valuechange", {
                value: finalVal
            });
            this.trigger("set", {
                value: finalVal
            });
            return true;
        },
        serializedValue: function() {
            var val = this.value();
            return Svidget.Conversion.toString(val);
        },
        coerce: function(val) {
            var res = this.getset("coerce", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getset("coerce");
            this.trigger("change", {
                property: "coerce",
                value: val
            });
            return true;
        },
        binding: function(bind) {
            var res = this.getset("binding", bind, "string");
            if (void 0 === bind || !!!res) return res;
            bind = this.getset("binding");
            this.getset("bindingQuery", Svidget.DOM.select(bind));
            this.trigger("change", {
                property: "binding",
                value: bind
            });
            return true;
        },
        bindingQuery: function() {
            return this.getset("bindingQuery");
        },
        sanitizer: function(funcName) {
            if (void 0 !== funcName) {
                "function" != typeof funcName && (funcName += "");
                var func = Svidget.findFunction(funcName);
                this.getset("sanitizerFunc", func);
            }
            var res = this.getset("sanitizer", funcName);
            if (void 0 === bind || !!!res) return res;
            this.trigger("change", {
                property: "sanitizer",
                value: val
            });
            return true;
        },
        sanitizerFunc: function() {
            var bind = this.getset("sanitizer"), func = Svidget.findFunction(bind);
            return func;
        },
        applySanitizer: function(val) {
            var func = this.sanitizerFunc();
            if (!func) return val;
            var returnVal = func.call(null, this, val);
            return void 0 === returnVal ? val : returnVal;
        },
        validateValue: function(val) {
            return true;
        },
        coerceValue: function(val) {
            return Svidget.convert(val, this.type(), this.subtype(), this.typedata());
        },
        applyBinding: function(val) {
            var bind = this.bindingQuery();
            null != bind && bind.setValue(val);
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        ondeclaredchange: function(handler) {
            return this.onchange(null, Svidget.declaredHandlerName, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        offdeclaredchange: function() {
            return this.offchange(Svidget.declaredHandlerName);
        },
        onset: function(data, name, handler) {
            return this.on("set", data, name, handler);
        },
        ondeclaredset: function(handler) {
            return this.onset(null, Svidget.declaredHandlerName, handler);
        },
        offset: function(handlerOrName) {
            return this.off("set", handlerOrName);
        },
        offdeclaredset: function() {
            return this.offset(Svidget.declaredHandlerName);
        },
        toTransport: function() {
            var transport = {
                name: this.name(),
                shortname: this.shortname(),
                enabled: this.enabled(),
                type: this.type(),
                subtype: this.subtype(),
                typedata: this.typedata(),
                coerce: this.coerce(),
                defvalue: this.defvalue(),
                value: this.value()
            };
            return transport;
        },
        toString: function() {
            return '[Svidget.Param { name: "' + this.name() + '" }]';
        }
    };
    Svidget.Param.eventTypes = [ "change", "set" ];
    Svidget.Param.optionProperties = [ "type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce", "group" ];
    Svidget.Param.allProxyProperties = [ "name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce", "group" ];
    Svidget.Param.writableProxyProperties = [ "value" ];
    Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
    Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));
    Svidget.ParamCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.Param ]);
        this.__type = "Svidget.ParamCollection";
        this.parent = parent;
        this._ctor = Svidget.ParamCollection;
    };
    Svidget.ParamCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ParamCollection, {
        create: function(name, value, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.Param(name, value, options, parent);
            return obj;
        }
    }, true);
    Svidget.Widget = function() {
        this.__type = "Svidget.Widget";
        var that = this, privates = new function() {
            this.writable = [ "id", "enabled", "started", "connected", "populatedFromPage" ];
            this.params = new Svidget.ParamCollection([], that);
            this.actions = new Svidget.ActionCollection([], that);
            this.events = new Svidget.EventDescCollection([], that);
            this.enabled = true;
            this.connected = false;
            this.started = false;
            this.populatedFromPage = false;
            this.id = null;
            this.page = null;
            this.parentElement = null;
        }();
        this.setup(privates);
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);
        this.wireCollectionAddRemoveHandlers(privates.actions, that.actionAdded, that.actionRemoved);
        this.wireCollectionAddRemoveHandlers(privates.events, that.eventAdded, that.eventRemoved);
        this._init();
    };
    Svidget.Widget.prototype = {
        _init: function() {},
        id: function() {
            return this.getset("id");
        },
        enabled: function(val) {
            null === val && (val = true);
            var res = this.getset("enabled", val, "bool");
            if (void 0 === val || !!!res) return res;
            val = this.getset("enabled");
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        connected: function() {
            return this.getset("connected");
        },
        started: function() {
            var val = this.getset("started");
            return val;
        },
        populatedFromPage: function() {
            return this.getset("populatedFromPage");
        },
        start: function() {
            this.getset("started", true);
        },
        connect: function(id) {
            if (!this.connected()) {
                this.getset("id", id);
                this.getset("connected", true);
            }
        },
        setPopulatedFromPage: function() {
            this.getset("populatedFromPage", true);
            this.trigger("pagepopulate", this);
        },
        updateParentElement: function(item) {},
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params"), item = this.selectFirst(col, selector);
            return item;
        },
        newParam: function(name, value, options) {
            return new Svidget.Param(name, value, options, this);
        },
        addParam: function(nameOrObject, value, options) {
            return this.params().add(nameOrObject, value, options, this);
        },
        removeParam: function(name) {
            return this.params().remove(name);
        },
        removeAllParams: function() {
            return this.params().clear();
        },
        paramAdded: function(param) {
            Svidget.log("widget: param added: " + param.name());
            this.trigger("paramadd", param);
            Svidget.root.signalParamAdded(param);
        },
        paramRemoved: function(param) {
            Svidget.log("widget: param removed: " + param.name());
            this.trigger("paramremove", param.name());
            Svidget.root.signalParamRemoved(param.name());
        },
        paramBubble: function(type, event, param) {
            "change" == type && this.paramChanged(param, event.value);
            "valuechange" != type && "set" != type || this.paramSet(param, event.value);
        },
        paramChanged: function(param, eventValue) {
            this.trigger("paramchange", eventValue, param);
            Svidget.root.signalParamChanged(param, eventValue);
        },
        paramSet: function(param, eventValue) {
            this.trigger("paramset", eventValue, param);
            this.trigger("paramvaluechange", eventValue, param);
            Svidget.root.signalParamSet(param, eventValue);
        },
        actions: function(selector) {
            var col = this.getset("actions");
            return this.select(col, selector);
        },
        action: function(selector) {
            var col = this.getset("actions"), item = this.selectFirst(col, selector);
            return item;
        },
        newAction: function(name, options) {
            return new Svidget.Action(name, options, this);
        },
        addAction: function(nameOrObject, options) {
            var action = this.actions().add(nameOrObject, options, this);
            if (null == action) return action;
            if (null == options || null == options.params || !Svidget.isArray(options.params)) return action;
            for (var i = 0; i < options.params.length; i++) {
                var p = options.params[i];
                null != p && null != p.name && action.addParam(p.name, p);
            }
        },
        removeAction: function(name) {
            return this.actions().remove(name);
        },
        removeAllActions: function() {
            return this.actions().clear();
        },
        actionAdded: function(action) {
            Svidget.log("widget: action added: " + action.name());
            this.trigger("actionadd", action);
            Svidget.root.signalActionAdded(action);
        },
        actionRemoved: function(action) {
            Svidget.log("widget: action removed: " + action.name());
            this.trigger("actionremove", action.name());
            Svidget.root.signalActionRemoved(action.name());
        },
        actionBubble: function(type, event, action) {
            "invoke" == type && this.actionInvoked(action, event.value);
            "change" == type && this.actionChanged(action, event.value);
            "paramchange" == type && this.actionParamChanged(action, event.target, event.value);
            "paramadd" == type && this.actionParamAdded(action, event.value);
            "paramremove" == type && this.actionParamRemoved(action, event.value);
        },
        actionInvoked: function(action, returnData) {
            this.trigger("actioninvoke", returnData, action);
            Svidget.root.signalActionInvoked(action, returnData);
        },
        actionChanged: function(action, eventValue) {
            this.trigger("actionchange", eventValue, action);
            Svidget.root.signalActionChanged(action, eventValue);
        },
        actionParamChanged: function(action, actionParam, eventValue) {
            this.trigger("actionparamchange", eventValue, actionParam);
            Svidget.root.signalActionParamChanged(actionParam, action, eventValue);
        },
        actionParamAdded: function(action, actionParam) {
            this.trigger("actionparamadd", actionParam, action);
            Svidget.root.signalActionParamAdded(actionParam, action.name());
        },
        actionParamRemoved: function(action, actionParamName) {
            this.trigger("actionparamremove", actionParamName, action);
            Svidget.root.signalActionParamRemoved(actionParamName, action.name());
        },
        events: function(selector) {
            var col = this.getset("events");
            return this.select(col, selector);
        },
        event: function(selector) {
            var col = this.getset("events"), item = this.selectFirst(col, selector);
            return item;
        },
        newEvent: function(name, options) {
            return new Svidget.EventDesc(name, options, this);
        },
        addEvent: function(nameOrObject, options) {
            return this.events().add(nameOrObject, options, this);
        },
        removeEvent: function(name) {
            return this.events().remove(name);
        },
        removeAllEvents: function() {
            return this.events().clear();
        },
        eventAdded: function(eventDesc) {
            Svidget.log("widget: event added: " + eventDesc.name());
            this.trigger("eventadd", eventDesc);
            Svidget.root.signalEventAdded(eventDesc);
        },
        eventRemoved: function(eventDesc) {
            Svidget.log("widget: event removed: " + eventDesc.name());
            this.trigger("eventremove", eventDesc.name());
            Svidget.root.signalEventRemoved(eventDesc.name());
        },
        eventBubble: function(type, event, eventDesc) {
            "trigger" == type && this.eventTrigger(eventDesc, event);
            "change" == type && this.eventChanged(eventDesc, event.value);
        },
        eventTrigger: function(eventDesc, event) {
            Svidget.log("widget: event trigger: " + eventDesc.name());
            this.trigger("eventtrigger", event.value, eventDesc);
            Svidget.root.signalEventTriggered(event.target, event.value);
        },
        eventChanged: function(eventDesc, eventValue) {
            this.trigger("eventchange", eventValue, eventDesc);
            Svidget.root.signalEventChanged(eventDesc, eventValue);
        },
        toTransport: function() {
            var transport = {
                id: this.id(),
                enabled: this.enabled(),
                params: this.toParamsTransport(),
                actions: this.toActionsTransport(),
                events: this.toEventsTransport()
            };
            return transport;
        },
        toParamsTransport: function() {
            var col = this.params(), ps = col.select(function(p) {
                return p.toTransport();
            }).toArray();
            return ps;
        },
        toActionsTransport: function() {
            var col = this.actions(), acs = col.select(function(a) {
                return a.toTransport();
            }).toArray();
            return acs;
        },
        toEventsTransport: function() {
            var col = this.events(), evs = col.select(function(e) {
                return e.toTransport();
            }).toArray();
            return evs;
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        ondeclaredchange: function(handler) {
            return this.onchange(null, Svidget.declaredHandlerName, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        offdeclaredchange: function() {
            return this.offchange(Svidget.declaredHandlerName);
        },
        onparamadd: function(data, name, handler) {
            return this.on("paramadd", data, name, handler);
        },
        ondeclaredparamadd: function(handler) {
            return this.onparamadd(null, Svidget.declaredHandlerName, handler);
        },
        offparamadd: function(handlerOrName) {
            return this.off("paramadd", handlerOrName);
        },
        offdeclaredparamadd: function() {
            return this.offparamadd(Svidget.declaredHandlerName);
        },
        onparamremove: function(data, name, handler) {
            return this.on("paramremove", data, name, handler);
        },
        ondeclaredparamremove: function(handler) {
            return this.onparamremove(null, Svidget.declaredHandlerName, handler);
        },
        offparamremove: function(handlerOrName) {
            return this.off("paramremove", handlerOrName);
        },
        offdeclaredparamremove: function() {
            return this.offparamremove(Svidget.declaredHandlerName);
        },
        onparamchange: function(data, name, handler) {
            return this.on("paramchange", data, name, handler);
        },
        offparamchange: function(handlerOrName) {
            return this.off("paramchange", handlerOrName);
        },
        onparamset: function(data, name, handler) {
            return this.on("paramset", data, name, handler);
        },
        offparamset: function(handlerOrName) {
            return this.off("paramset", handlerOrName);
        },
        onactionadd: function(data, name, handler) {
            return this.on("actionadd", data, name, handler);
        },
        ondeclaredactionadd: function(handler) {
            return this.onactionadd(null, Svidget.declaredHandlerName, handler);
        },
        offactionadd: function(handlerOrName) {
            return this.off("actionadd", handlerOrName);
        },
        offdeclaredactionadd: function() {
            return this.offactionadd(Svidget.declaredHandlerName);
        },
        onactionremove: function(data, name, handler) {
            return this.on("actionremove", data, name, handler);
        },
        ondeclaredactionremove: function(handler) {
            return this.onactionremove(null, Svidget.declaredHandlerName, handler);
        },
        offactionremove: function(handlerOrName) {
            return this.off("actionremove", handlerOrName);
        },
        offdeclaredactionremove: function() {
            return this.offactionremove(Svidget.declaredHandlerName);
        },
        onactionchange: function(data, name, handler) {
            return this.on("actionchange", data, name, handler);
        },
        offactionchange: function(handlerOrName) {
            return this.off("actionchange", handlerOrName);
        },
        onactioninvoke: function(data, name, handler) {
            return this.on("actioninvoke", data, name, handler);
        },
        offactioninvoke: function(handlerOrName) {
            return this.off("actioninvoke", handlerOrName);
        },
        onactionparamadd: function(data, name, handler) {
            return this.on("actionparamadd", data, name, handler);
        },
        offactionparamadd: function(handlerOrName) {
            return this.off("actionparamadd", handlerOrName);
        },
        onactionparamremove: function(data, name, handler) {
            return this.on("actionparamremove", data, name, handler);
        },
        offactionparamremove: function(handlerOrName) {
            return this.off("actionparamremove", handlerOrName);
        },
        onactionparamchange: function(data, name, handler) {
            return this.on("actionparamchange", data, name, handler);
        },
        offactionparamchange: function(handlerOrName) {
            return this.off("actionparamchange", handlerOrName);
        },
        oneventadd: function(data, name, handler) {
            return this.on("eventadd", data, name, handler);
        },
        ondeclaredeventadd: function(handler) {
            return this.oneventadd(null, Svidget.declaredHandlerName, handler);
        },
        offeventadd: function(handlerOrName) {
            return this.off("eventadd", handlerOrName);
        },
        offdeclaredeventadd: function() {
            return this.offeventadd(Svidget.declaredHandlerName);
        },
        oneventremove: function(data, name, handler) {
            return this.on("eventremove", data, name, handler);
        },
        ondeclaredeventremove: function(handler) {
            return this.oneventremove(null, Svidget.declaredHandlerName, handler);
        },
        offeventremove: function(handlerOrName) {
            return this.off("eventremove", handlerOrName);
        },
        offdeclaredeventremove: function() {
            return this.offeventremove(Svidget.declaredHandlerName);
        },
        oneventchange: function(data, name, handler) {
            return this.on("eventchange", data, name, handler);
        },
        offeventchange: function(handlerOrName) {
            return this.off("eventchange", handlerOrName);
        },
        oneventtrigger: function(data, name, handler) {
            return this.on("eventtrigger", data, name, handler);
        },
        offeventtrigger: function(handlerOrName) {
            return this.off("eventtrigger", handlerOrName);
        },
        onpagepopulate: function(data, name, handler) {
            return this.on("pagepopulate", data, name, handler);
        },
        offpagepopulate: function(handlerOrName) {
            return this.off("pagepopulate", handlerOrName);
        },
        toString: function() {
            return '[Svidget.Widget { id: "' + this.id() + '" }]';
        }
    };
    Svidget.Widget.eventTypes = [ "change", "pagepopulate", "paramvaluechange", "paramset", "paramchange", "paramadd", "paramremove", "actioninvoke", "actionchange", "actionadd", "actionremove", "eventtrigger", "eventchange", "eventadd", "eventremove" ];
    Svidget.extend(Svidget.Widget, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.Widget, new Svidget.EventPrototype(Svidget.Widget.eventTypes));
    Svidget.Proxy = function(parent, options, propList, writePropList, eventList) {
        this.__type = "Svidget.Proxy";
        options = options || {};
        var propCol = new Svidget.Collection(Svidget.isArray(propList) ? propList : null), writePropCol = new Svidget.Collection(Svidget.isArray(writePropList) ? writePropList : null);
        writePropCol = writePropCol.where(function(i) {
            return propCol.contains(i);
        });
        var privates = {
            writable: writePropCol.toArray(),
            propertyChangeFuncs: new Svidget.Collection(),
            eventContainer: new Svidget.EventContainer(eventList, this),
            parent: parent,
            connected: null == options.connected || !!options.connected
        };
        this.setup(privates);
        for (var p in options) void 0 === privates[p] && (privates[p] = options[p]);
        for (var i = 0; i < propCol.length; i++) {
            var prop = propCol[i] + "";
            0 < prop.length && (this[prop] = buildPropFunc(prop));
        }
        function buildPropFunc(prop) {
            return function(val) {
                return this.getsetProp(prop, val);
            };
        }
    };
    Svidget.Proxy.prototype = {
        parent: function() {
            var res = this.getPrivate("parent");
            return res;
        },
        attached: function() {
            var parent = this.parent();
            return null != parent;
        },
        propertyChangeFuncs: function() {
            return this.getPrivate("propertyChangeFuncs");
        },
        connected: function(val) {
            return this.getPrivate("connected");
        },
        getsetProp: function(prop, val) {
            var res = this.getset(prop, val);
            if (void 0 === val || !!!res) return res;
            this.handlePropertyChange(prop, val);
            return true;
        },
        handlePropertyChange: function(name, val) {},
        triggerPropertyChange: function(name, val) {
            var funcList = this.propertyChangeFuncs(), that = this;
            funcList.each(function(func) {
                func(that, name, val);
            });
        },
        notifyPropertyChange: function(name, val) {
            if (null != name) {
                this.getset(name, val);
                this.triggerFromWidget("change", {
                    property: name,
                    value: val
                }, this);
            }
        },
        refreshProperties: function(propObj) {
            for (var name in propObj) {
                var item = this.getPrivate(name);
                null != item && this.setPrivate(name, propObj[name]);
            }
        },
        connect: function() {
            this.setPrivate("connected", true);
        },
        onPropertyChange: function(func) {
            var funcList = this.propertyChangeFuncs();
            if ("function" === !typeof func) return false;
            funcList.add(func);
            return true;
        },
        offPropertyChange: function(func) {
            var funcList = this.propertyChangeFuncs();
            return funcList.remove(func);
        },
        eventContainer: function() {
            return this.getPrivate("eventContainer");
        },
        on: function(type, data, name, handler) {
            this.eventContainer().on(type, data, name, handler);
        },
        off: function(type, handlerOrName) {
            this.eventContainer().off(type, handlerOrName);
        },
        triggerFromWidget: function(type, value, originalTarget) {
            this.eventContainer().trigger(type, value, originalTarget);
        },
        registerBubbleCallback: function(types, bubbleTarget, callback) {
            this.eventContainer().registerBubbleCallback(types, bubbleTarget, callback);
        }
    };
    Svidget.extend(Svidget.Proxy, Svidget.ObjectPrototype);
    Svidget.ActionProxy = function(name, options, parent) {
        var valueObj = {
            name: name,
            params: new Svidget.ActionParamProxyCollection([], this)
        };
        options = options || {};
        for (var p in options) void 0 === valueObj[p] && (valueObj[p] = options[p]);
        parent && (parent = parent instanceof Svidget.WidgetReference ? parent : null);
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.Action.allProxyProperties, Svidget.Action.writableProxyProperties ]);
        this.__type = "Svidget.ActionProxy";
        this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionProxyBubble);
        this.wireCollectionAddRemoveHandlers(valueObj.params, this.paramAdded, this.paramRemoved);
    };
    Svidget.ActionProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ActionProxy, {
        invoke: function() {
            if (!this.canInvoke()) return false;
            var args = Svidget.array(arguments);
            svidget.signalActionInvoke(this.parent(), this, args);
            return true;
        },
        canInvoke: function() {
            return this.getset("external");
        },
        invokeFromWidget: function(returnVal) {
            this.triggerFromWidget("invoke", {
                returnValue: returnVal
            }, this);
        },
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params"), item = this.selectFirst(col, selector);
            return item;
        },
        addParam: function(nameOrObject, options) {
            return this.params().add(nameOrObject, options, this);
        },
        removeParam: function(name) {
            return this.params().remove(name);
        },
        paramProxyBubble: function(type, event, param) {
            "change" == type && this.paramChanged(param, event.value);
        },
        paramChanged: function(param, eventValue) {
            this.triggerFromWidget("paramchange", eventValue, param);
        },
        paramAdded: function(param) {
            this.triggerFromWidget("paramadd", param);
        },
        paramRemoved: function(param) {
            this.triggerFromWidget("paramremove", param.name());
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        oninvoke: function(data, name, handler) {
            return this.on("invoke", data, name, handler);
        },
        offinvoke: function(handlerOrName) {
            return this.off("invoke", handlerOrName);
        },
        onparamadd: function(data, name, handler) {
            return this.on("paramadd", data, name, handler);
        },
        offparamadd: function(handlerOrName) {
            return this.off("paramadd", handlerOrName);
        },
        onparamchange: function(data, name, handler) {
            return this.on("paramchange", data, name, handler);
        },
        offparamchange: function(handlerOrName) {
            return this.off("paramchange", handlerOrName);
        },
        onparamremove: function(data, name, handler) {
            return this.on("paramremove", data, name, handler);
        },
        offparamremove: function(handlerOrName) {
            return this.off("paramremove", handlerOrName);
        },
        toString: function() {
            return '[Svidget.ActionProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.ActionProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionProxy ]);
        this.__type = "Svidget.ActionProxyCollection";
        this.parent = parent;
        this._ctor = Svidget.ActionProxyCollection;
    };
    Svidget.ActionProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionProxyCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.ActionProxy(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.ActionParamProxy = function(name, options, parent) {
        var valueObj = {
            name: name
        };
        options = options || {};
        for (var p in options) void 0 === valueObj[p] && (valueObj[p] = options[p]);
        parent && (parent = parent instanceof Svidget.ActionProxy ? parent : null);
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.ActionParam.allProxyProperties, Svidget.ActionParam.writableProxyProperties ]);
        this.__type = "Svidget.ActionParamProxy";
        this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramProxyBubble);
    };
    Svidget.ActionParamProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ActionParamProxy, {
        toString: function() {
            return '[Svidget.ActionParamProxy { name: "' + this.name() + '" }]';
        }
    }, true);
    Svidget.ActionParamProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionParamProxy ]);
        this.__type = "Svidget.ActionParamProxyCollection";
        this.parent = parent;
        this._ctor = Svidget.ActionParamProxyCollection;
    };
    Svidget.ActionParamProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionParamProxyCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.ActionParamProxy(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.EventDescProxy = function(name, options, parent) {
        var valueObj = {
            name: name,
            eventName: "trigger"
        };
        options = options || {};
        for (var p in options) void 0 === valueObj[p] && (valueObj[p] = options[p]);
        parent && (parent = parent instanceof Svidget.WidgetReference ? parent : null);
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.EventDesc.allProxyProperties, Svidget.EventDesc.writableProxyProperties ]);
        this.__type = "Svidget.EventDescProxy";
        this.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventProxyBubble);
    };
    Svidget.EventDescProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.EventDescProxy, {
        triggerEventName: function() {
            return this.getPrivate("eventName");
        },
        on: function(type, data, name, handler) {
            if (Svidget.isFunction(type)) {
                handler = type;
                type = this.triggerEventName();
            }
            this.eventContainer().on(type, data, name, handler);
        },
        ontrigger: function(data, name, handler) {
            this.eventContainer().on(this.triggerEventName(), data, name, handler);
        },
        off: function(type, handlerOrName) {
            if (Svidget.isFunction(type)) {
                handlerOrName = type;
                type = this.triggerEventName();
            }
            this.eventContainer().off(type, handlerOrName);
        },
        offtrigger: function(handlerOrName) {
            this.eventContainer().off(this.triggerEventName(), handlerOrName);
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        trigger: function(value) {
            if (!this.canTrigger()) return false;
            svidget.signalEventTrigger(this.parent(), this, value);
            return true;
        },
        canTrigger: function() {
            return this.getset("external");
        },
        triggerEventFromWidget: function(value) {
            this.eventContainer().trigger(this.triggerEventName(), value);
        },
        toString: function() {
            return '[Svidget.EventDescProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.EventDescProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.EventDescProxy ]);
        this.__type = "Svidget.EventDescProxyCollection";
        this.parent = parent;
        this._ctor = Svidget.EventDescProxyCollection;
    };
    Svidget.EventDescProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.EventDescProxyCollection, {
        create: function(name, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.EventDescProxy(name, options, parent);
            return obj;
        }
    }, true);
    Svidget.ParamProxy = function(name, value, options, parent) {
        var valueObj = {
            name: name,
            value: value
        };
        options = options || {};
        for (var p in options) valueObj[p] = options[p];
        parent && (parent = parent instanceof Svidget.WidgetReference ? parent : null);
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.Param.allProxyProperties, Svidget.Param.writableProxyProperties ]);
        this.__type = "Svidget.ParamProxy";
        this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramProxyBubble);
    };
    Svidget.ParamProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ParamProxy, {
        handlePropertyChange: function(name, val) {
            if ("value" == name) {
                this.parent().updateParamValue(this.name(), val);
                svidget.signalPropertyChange(this.parent(), this, "param", name, val);
            }
        },
        notifyValueChange: function(val) {
            this.getset("value", val);
            this.triggerFromWidget("valuechange", {
                value: val
            }, this);
            this.triggerFromWidget("set", {
                value: val
            }, this);
        },
        serializedValue: function() {
            var val = this.value();
            return Svidget.Conversion.toString(val);
        },
        onchange: function(data, name, handler) {
            return this.on("change", data, name, handler);
        },
        offchange: function(handlerOrName) {
            this.off("change", handlerOrName);
        },
        onset: function(data, name, handler) {
            return this.on("set", data, name, handler);
        },
        offset: function(handlerOrName) {
            return this.off("set", handlerOrName);
        },
        toString: function() {
            return '[Svidget.ParamProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.ParamProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ParamProxy ]);
        this.__type = "Svidget.ParamProxyCollection";
        this.parent = parent;
        this._ctor = Svidget.ParamProxyCollection;
    };
    Svidget.ParamProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ParamProxyCollection, {
        create: function(name, value, options, parent) {
            if (null == name || "string" === !typeof name) return null;
            if (null != this.getByName(name)) return null;
            var obj = new Svidget.ParamProxy(name, value, options, parent);
            return obj;
        }
    }, true);
    Svidget.WidgetReference = function(id, paramValueObj, declaringElement, element, connected, crossdomain) {
        this.__type = "Svidget.WidgetReference";
        var that = this, privates = new function() {
            this.writable = [ "enabled", "started", "populated", "paramValues" ];
            this.params = new Svidget.ParamProxyCollection([], that);
            this.actions = new Svidget.ActionProxyCollection([], that);
            this.events = new Svidget.EventDescProxyCollection([], that);
            this.eventContainer = new Svidget.EventContainer(Svidget.Widget.eventTypes, that);
            this.paramValues = paramValueObj;
            this.enabled = true;
            this.started = false;
            this.populated = false;
            this.connected = !!connected;
            this.crossdomain = !!crossdomain;
            this.state = "declared";
            this.id = id;
            this.element = element;
            this.declaringElement = declaringElement;
            this.url = declaringElement.getAttribute("data");
        }();
        this.setup(privates);
        this.setElement = function(ele) {
            if (null != privates.element) return false;
            if (!Svidget.DOM.isElement(ele)) return false;
            privates.element = ele;
            this.setElement = null;
        }, function(paramValueObj) {
            if (null == paramValueObj) return;
            for (var name in paramValueObj) this.addParamProxy(name, paramValueObj[name], {
                connected: false
            });
        }.call(that, paramValueObj);
        declaringElement.widgetReference = this;
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramProxyAdded, that.paramProxyRemoved);
        this.wireCollectionAddRemoveHandlers(privates.actions, that.actionProxyAdded, that.actionProxyRemoved);
        this.wireCollectionAddRemoveHandlers(privates.events, that.eventProxyAdded, that.eventProxyRemoved);
    };
    Svidget.WidgetReference.prototype = {
        id: function() {
            var id = this.getset("id");
            return id;
        },
        name: function() {
            return this.id();
        },
        enabled: function() {
            var enabled = this.getset("enabled");
            return enabled;
        },
        url: function() {
            var url = this.getset("url");
            return url;
        },
        element: function() {
            var ele = this.getset("element");
            return ele;
        },
        declaringElement: function() {
            var ele = this.getset("declaringElement");
            return ele;
        },
        root: function() {
            if (this.isCrossDomain()) return null;
            var doc = this.document(), win = doc.parentWindow || doc.defaultView;
            return win.svidget;
        },
        window: function() {
            var ele = this.element();
            return null == ele ? null : ele.contentWindow;
        },
        document: function() {
            var ele = this.element();
            return Svidget.DOM.getDocument(ele);
        },
        connected: function(val) {
            var res = this.getset("connected", val);
            return !(void 0 === val || !res) || res;
        },
        crossdomain: function(val) {
            var res = this.getset("crossdomain", val);
            return !(void 0 === val || !res) || res;
        },
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params"), item = this.selectFirst(col, selector);
            return item;
        },
        actions: function(selector) {
            var col = this.getset("actions");
            return this.select(col, selector);
        },
        action: function(selector) {
            var col = this.getset("actions"), item = this.selectFirst(col, selector);
            return item;
        },
        events: function(selector) {
            var col = this.getset("events");
            return this.select(col, selector);
        },
        event: function(selector) {
            var col = this.getset("events"), item = this.selectFirst(col, selector);
            return item;
        },
        paramValues: function() {
            var val = this.getset("paramValues");
            return val;
        },
        addParamProxy: function(nameOrObject, value, options) {
            return this.params().add(nameOrObject, value, options, this);
        },
        removeParamProxy: function(name) {
            return this.params().remove(name);
        },
        refreshParamProxy: function(name, value, options) {
            var p = this.param(name);
            if (null == p) return this.params().add(name, value, options, this);
            p.refreshProperties(options);
            return p;
        },
        updateParamValue: function(name, value) {
            var val = this.getset("paramValues");
            val = val || {};
            val[name] = value;
            this.getset("paramValues", val);
        },
        paramProxyAdded: function(param) {
            Svidget.log("page: param proxy added: " + param.name());
            this.triggerFromWidget("paramadd", param);
        },
        paramProxyRemoved: function(param) {
            Svidget.log("page: param proxy removed: " + param.name());
            this.triggerFromWidget("paramremove", param.name());
        },
        paramProxyBubble: function(type, event, param) {
            Svidget.log("page: param proxy bubble: " + param.name());
            "change" == type && this.paramProxyChanged(param, event.value);
            "valuechange" == type && this.paramProxyValueChanged(param, event.value);
        },
        paramProxyChanged: function(param, eventValue) {
            Svidget.log("page: param proxy change: " + param.name());
            this.triggerFromWidget("paramchange", eventValue, param);
        },
        paramProxyValueChanged: function(param, eventValue) {
            Svidget.log("page: param proxy value change: " + param.name());
            this.triggerFromWidget("paramvaluechange", eventValue, param);
        },
        addActionProxy: function(nameOrObject, options) {
            return this.actions().add(nameOrObject, options, this);
        },
        removeActionProxy: function(name) {
            return this.actions().remove(name);
        },
        actionProxyAdded: function(action) {
            Svidget.log("page: action proxy added: " + action.name());
            this.triggerFromWidget("actionadd", action);
        },
        actionProxyRemoved: function(action) {
            Svidget.log("page: action proxy removed: " + action.name());
            this.triggerFromWidget("actionremove", action.name());
        },
        actionProxyBubble: function(type, event, action) {
            Svidget.log("page: action proxy bubble: " + action.name());
            "invoke" == type && this.actionProxyInvoked(action, event.value);
            "change" == type && this.actionProxyChanged(action, event.value);
            "paramchange" == type && this.actionParamProxyChanged(action, event.target, event.value);
            "paramadd" == type && this.actionParamProxyAdded(action, event.value);
            "paramremove" == type && this.actionParamProxyRemoved(action, event.value);
        },
        actionProxyInvoked: function(action, eventValue) {
            this.triggerFromWidget("actioninvoke", eventValue, action);
        },
        actionProxyChanged: function(action, eventValue) {
            this.triggerFromWidget("actionchange", eventValue, action);
        },
        actionParamProxyAdded: function(action, actionParam) {
            this.triggerFromWidget("actionparamadd", actionParam, action);
        },
        actionParamProxyRemoved: function(action, actionParamName) {
            this.triggerFromWidget("actionparamremove", actionParamName, action);
        },
        actionParamProxyChanged: function(action, actionParam, eventValue) {
            this.triggerFromWidget("actionparamchange", eventValue, actionParam);
        },
        addEventProxy: function(nameOrObject, options) {
            return this.events().add(nameOrObject, options, this);
        },
        removeEventProxy: function(name) {
            return this.events().remove(name);
        },
        eventProxyAdded: function(ev) {
            Svidget.log("page: event proxy added: " + ev.name());
            this.triggerFromWidget("eventadd", ev);
        },
        eventProxyRemoved: function(ev) {
            Svidget.log("page: event proxy removed: " + ev.name());
            this.triggerFromWidget("eventremove", ev.name());
        },
        eventProxyBubble: function(type, event, eventDesc) {
            Svidget.log("page: event proxy bubble: " + eventDesc.name());
            "trigger" == type && this.eventProxyTriggered(eventDesc, event);
            "change" == type && this.eventProxyChanged(eventDesc, event.value);
        },
        eventProxyTriggered: function(eventDesc, event) {
            Svidget.log("page: event proxy trigger: " + eventDesc.name());
            this.triggerFromWidget("eventtrigger", event.value, eventDesc);
        },
        eventProxyChanged: function(eventDesc, eventValue) {
            Svidget.log("page: event proxy change: " + eventDesc.name());
            this.triggerFromWidget("eventchange", eventValue, eventDesc);
        },
        eventContainer: function() {
            return this.getPrivate("eventContainer");
        },
        on: function(type, data, name, handler) {
            this.eventContainer().on(type, data, name, handler);
        },
        off: function(type, handlerOrName) {
            this.eventContainer().off(type, handlerOrName);
        },
        triggerFromWidget: function(type, value, originalTarget) {
            this.eventContainer().trigger(type, value, originalTarget);
        },
        hasElement: function() {
            return null != this.element();
        },
        isAttached: function() {
            var ele = this.element();
            return null != ele && null != ele.parentNode;
        },
        isCrossDomain: function() {
            return this.element() !== this.declaringElement();
        },
        started: function() {
            var val = this.getset("started");
            return val;
        },
        populated: function() {
            var val = this.getset("populated");
            return val;
        },
        start: function() {
            this.getset("started", true);
        },
        populate: function(widgetObj) {
            if (!this.populated()) {
                this.enabled(widgetObj.enabled);
                this._populateParams(widgetObj.params);
                this._populateActions(widgetObj.actions);
                this._populateEvents(widgetObj.events);
                this.getset("populated", true);
            }
        },
        _populateParams: function(params) {
            if (params && Svidget.isArray(params)) for (var i = 0; i < params.length; i++) {
                var p = params[i], paramProxy = this.refreshParamProxy(p.name, p.value, p);
                paramProxy.connect();
            }
        },
        _populateActions: function(actions) {
            if (actions && Svidget.isArray(actions)) for (var i = 0; i < actions.length; i++) {
                var a = actions[i], action = this.addActionProxy(a.name, a);
                this._populateActionParams(a.params, action);
            }
        },
        _populateActionParams: function(actionParams, action) {
            if (actionParams && Svidget.isArray(actionParams)) for (var i = 0; i < actionParams.length; i++) {
                var ap = actionParams[i];
                action.addParam(ap.name, ap);
            }
        },
        _populateEvents: function(events) {
            if (events && Svidget.isArray(events)) for (var i = 0; i < events.length; i++) {
                var e = events[i];
                this.addEventProxy(e.name, e);
            }
        }
    };
    Svidget.extend(Svidget.WidgetReference, Svidget.ObjectPrototype);
    Svidget.Root.PagePrototype = {
        initInternal: function() {
            this.idSeed = 1;
            window._svidget = "page";
            this.connected(true);
            Object.defineProperty(this, "$", Svidget.readOnlyProperty(null));
        },
        readyPage: function() {
            Svidget.log("page: readyPage");
            this.loadPageWidgets();
        },
        loadPageWidgets: function() {
            var that = this, svidgetEles = this.findAllWidgetElements();
            svidgetEles.each(function(item) {
                that.loadPageWidget(item);
            });
        },
        loadPageWidget: function(objEle, paramValues) {
            if (null == objEle.widgetReference && !objEle.svidgetLoad) {
                var widget = this.createWidgetReference(objEle, paramValues);
                this.addWidget(widget);
                this.readyWidgetReference(widget, objEle);
                return widget;
            }
        },
        createWidgetReference: function(objEle, paramValues) {
            var paramObj;
            paramObj = void 0 === paramValues ? this.parseParamElements(objEle) : paramValues;
            var connected = !objEle.hasAttribute("data-connected") || this.isAttrEmptyOrTrue(objEle, "data-connected"), crossdomain = this.isAttrEmptyOrTrue(objEle, "data-crossdomain") || "" == objEle.data;
            this.setElementPosition(objEle, objEle.getAttribute("data-x"), objEle.getAttribute("data-y"));
            var widgetID = this.getWidgetIDForElement(objEle), coreEle = this.resolveCoreWidgetElement(objEle, null, crossdomain), wRef = new Svidget.WidgetReference(widgetID, paramObj, objEle, coreEle, connected, crossdomain);
            objEle._widget = wRef;
            return wRef;
        },
        isAttrEmptyOrTrue: function(ele, attr) {
            return !!Svidget.DOM.isAttrEmpty(ele, attr) || Svidget.Conversion.toBool(Svidget.DOM.attrValue(ele, attr));
        },
        readyWidgetReference: function(widget, objEle) {
            var ele = widget.element() || objEle;
            this.addWidgetLoadEvents(ele, widget);
        },
        addWidgetLoadEvents: function(objEle, widget) {
            Svidget.log("page: addWidgetLoadEvents: id = " + objEle.id + ", tag = " + objEle.tagName);
            var handler = Svidget.wrap(this.finishPageWidget, this);
            widget._waitingForDOM = true;
            Svidget.DOM.on(objEle, "load", function() {
                handler(widget);
            });
        },
        finishPageWidget: function(widget) {
            Svidget.log("page: finishPageWidget: id = " + widget.id());
            widget._waitingForDOM = false;
            var finalEle = this.ensureCoreElementResolved(widget);
            null != finalEle && finalEle != widget.declaringElement() ? this.readyWidgetReference(widget, widget.element()) : this.ensureWidgetStarted(widget);
        },
        ensureCoreElementResolved: function(widget) {
            if (widget.hasElement()) return null;
            var coreEle = this.resolveCoreWidgetElement(widget.declaringElement(), widget, widget.crossdomain());
            if (null != coreEle) {
                Svidget.log("page: CoreElementCreated: " + coreEle.tagName + " id:" + widget.id());
                widget.setElement(coreEle);
                return coreEle;
            }
            return null;
        },
        ensureWidgetStarted: function(widget) {
            widget.hasElement() && !widget.started() && Svidget.DOM.isElementDocumentReady(widget.element()) && this.signalStart(widget, widget.paramValues());
        },
        resolveCoreWidgetElement: function(objEle, widget, crossdomain) {
            var widgetDoc = Svidget.DOM.getDocument(objEle);
            if (null === widgetDoc && !crossdomain) return null;
            var ifmEle = null, coreEle = objEle;
            if (void 0 === widgetDoc || crossdomain) {
                ifmEle = this.buildIFrameElement(objEle);
                objEle.parentNode.insertBefore(ifmEle, objEle);
                this.disableAndHide(objEle);
                coreEle = ifmEle;
            }
            return coreEle;
        },
        waitForWidgets: function() {
            setTimeout(Svidget.wrap(this.checkUnfinishedWidgetReferences, this), 50);
        },
        checkUnfinishedWidgetReferences: function() {
            if (!this.allWidgetsStarted) {
                Svidget.log("page: checkUnfinishedWidgetReferences");
                var that = this;
                this.widgets().where(function(w) {
                    return that.needsFinishing(w);
                }).each(function(w) {
                    0;
                    that.finishPageWidget(w);
                });
                this.waitForWidgets();
            }
        },
        needsFinishing: function(widget) {
            return !widget._waitingForDOM && (!(widget.hasElement() && widget.started() || !Svidget.DOM.isElementDocumentReady(widget.declaringElement())) || !(!widget.hasElement() || !widget.isCrossDomain() || widget.started() || !Svidget.DOM.isElementDocumentReady(widget.element())));
        },
        areAllWidgetsStarted: function() {
            return this.widgets().all(function(w) {
                return w.started();
            });
        },
        disableAndHide: function(ele) {
            ele.data = "";
            Svidget.DOM.disable(ele);
            Svidget.DOM.hide(ele);
        },
        getWidgetIDForElement: function(objEle) {
            var id = objEle.id;
            return null != id && Svidget.DOM.get(id) == objEle ? id : this.newWidgetID();
        },
        newWidgetID: function() {
            void 0 === this.idCounter && (this.idCounter = 1);
            for (var idNum = this.idCounter; ;) {
                var id = "_svidget_" + idNum;
                idNum++;
                if (null == Svidget.DOM.get(id)) break;
            }
            this.idCounter = idNum;
            return id;
        },
        buildIFrameElement: function(objEle) {
            var iframe = document.createElement("iframe"), objItem = Svidget.DOM.wrap(objEle);
            objItem.attributes().each(function(a) {
                "data" == a.name() || "data-url" == a.name() ? iframe.setAttribute("src", a.value()) : "id" == a.name() ? iframe.setAttribute("id", a.value() + "_frame") : iframe.setAttribute(a.name(), a.value());
            });
            iframe.frameBorder = 0;
            iframe.seamless = true;
            return iframe;
        },
        buildObjectElement: function(options, paramObj) {
            if (!document.createElement) return null;
            var objEle = document.createElement("object");
            objEle.setAttribute("role", "svidget");
            objEle.setAttribute("data-url", options.url);
            true !== options.crossdomain && objEle.setAttribute("data", options.url);
            options.id && objEle.setAttribute("id", options.id);
            options.width && objEle.setAttribute("width", options.width);
            options.height && objEle.setAttribute("height", options.height);
            void 0 !== options.connected && objEle.setAttribute("data-connected", options.connected);
            true === options.crossdomain && objEle.setAttribute("data-crossdomain", options.crossdomain);
            options.style && objEle.setAttribute("style", options.style);
            options.cssclass && objEle.setAttribute("class", options.cssclass);
            void 0 !== options.allowfullscreen && objEle.setAttribute("allowfullscreen", options.allowfullscreen);
            options.title && objEle.setAttribute("title", options.title);
            this.setElementPosition(objEle, options.x, options.y);
            for (var key in paramObj) {
                var paramEle = document.createElement("param");
                paramEle.setAttribute("name", key);
            }
            return objEle;
        },
        createObjectElement: function(container, options, paramObj) {
            var objEle = this.buildObjectElement(options, paramObj);
            objEle.svidgetLoad = true;
            container.appendChild(objEle);
            return objEle;
        },
        setElementPosition: function(ele, x, y) {
            var px = null != x ? parseFloat(x) : NaN, py = null != y ? parseFloat(y) : NaN;
            if (!isNaN(px) || !isNaN(py)) {
                var pos = ele.style.position;
                "absolute" != pos && "fixed" != pos && (ele.style.position = "absolute");
                isNaN(px) || (ele.style.left = px + "px");
                isNaN(py) || (ele.style.top = py + "px");
            }
        },
        populateWidgetReference: function(widgetRef, widgetTransport) {
            Svidget.log("page: populateWidgetReference");
            widgetRef.populated() || widgetRef.populate(widgetTransport);
        },
        findAllWidgetElements: function() {
            var that = this, objectEles = Svidget.DOM.getByName("object", true), svidgetEles = objectEles.where(function(item) {
                return that.containsSvidgetRole(item);
            });
            return svidgetEles;
        },
        containsSvidgetRole: function(ele) {
            var role = Svidget.DOM.attrValue(ele, "role");
            return /(^|,)\s*svidget\s*(,|$)/.test(role);
        },
        parseParamElements: function(objEle) {
            for (var paramEles = Svidget.DOM.getChildrenByName(objEle, "param", true), obj = {}, i = 0; i < paramEles.length; i++) {
                var name = paramEles[i].getAttribute("name");
                null != name && 0 < name.length && (obj[name] = paramEles[i].getAttribute("value"));
            }
            return obj;
        },
        getWidget: function(id) {
            if (null == id) return null;
            var col = this.widgets();
            return col.first(function(w) {
                return w.id() === id;
            });
        },
        addWidget: function(widget) {
            if (this.widgets().contains(widget)) return false;
            this.widgets().add(widget);
            return true;
        },
        load: function(selector, urlOrOptions, paramObj, callback) {
            var container = Svidget.DOM.selectElement(selector);
            if (null == container) return null;
            var options = null;
            if ("string" == typeof urlOrOptions) options = {
                url: urlOrOptions
            }; else {
                if (null == urlOrOptions) return null;
                options = urlOrOptions;
            }
            if (null != options.url) {
                this.allWidgetsStarted = false;
                var widgetEle = this.createObjectElement(container, options, paramObj);
                delete widgetEle.svidgetLoad;
                var widget = this.loadPageWidget(widgetEle, paramObj);
                callback && "function" == typeof callback && setTimeout(function() {
                    callback(widget);
                }, 0);
                return widget;
            }
        },
        widgets: function(selector) {
            var col = this.getWidgets();
            return this.select(col, selector);
        },
        widget: function(selector) {
            var col = this.getWidgets(), item = this.selectFirst(col, selector);
            return item;
        },
        getWidgets: function() {
            var col = this.getset("widgets");
            if (null == col) {
                col = new Svidget.ObjectCollection(null, Svidget.WidgetReference);
                this.getset("widgets", col);
            }
            return col;
        },
        triggerWidgetEvent: function(widgetRef, eventName, data) {
            var ev = widgetRef.event(eventName);
            null != ev && ev.triggerFromWidget(data);
        },
        receiveFromWidget: function(name, payload, widgetID) {
            Svidget.log("page: receiveFromWidget {name: " + name + ", widgetID: " + widgetID + "}");
            var widget = this.getWidget(widgetID);
            switch (name) {
              case "paramadded":
                this.handleReceiveWidgetParamAdded(widget, payload);
                break;

              case "paramremoved":
                this.handleReceiveWidgetParamRemoved(widget, payload);
                break;

              case "paramchanged":
                this.handleReceiveWidgetParamChanged(widget, payload);
                break;

              case "paramset":
                this.handleReceiveWidgetParamSet(widget, payload);
                break;

              case "actionadded":
                this.handleReceiveWidgetActionAdded(widget, payload);
                break;

              case "actionremoved":
                this.handleReceiveWidgetActionRemoved(widget, payload);
                break;

              case "actionchanged":
                this.handleReceiveWidgetActionChanged(widget, payload);
                break;

              case "actioninvoked":
                this.handleReceiveWidgetActionInvoked(widget, payload);
                break;

              case "actionparamadded":
                this.handleReceiveWidgetActionParamAdded(widget, payload);
                break;

              case "actionparamremoved":
                this.handleReceiveWidgetActionParamRemoved(widget, payload);
                break;

              case "actionparamchanged":
                this.handleReceiveWidgetActionParamChanged(widget, payload);
                break;

              case "eventadded":
                this.handleReceiveWidgetEventAdded(widget, payload);
                break;

              case "eventremoved":
                this.handleReceiveWidgetEventRemoved(widget, payload);
                break;

              case "eventchanged":
                this.handleReceiveWidgetEventChanged(widget, payload);
                break;

              case "eventtriggered":
                this.handleReceiveWidgetEventTriggered(widget, payload);
                break;

              case "startack":
                this.handleReceiveWidgetStartAck(widget, payload);
            }
        },
        signalStart: function(widgetRef, paramValues) {
            Svidget.log("page: signalStart {id: " + widgetRef.id() + ", url: " + widgetRef.url() + ", tag: " + widgetRef.element().tagName + "}");
            var payload = {
                id: widgetRef.id(),
                params: paramValues,
                connected: widgetRef.connected()
            };
            this.comm().signalWidget(widgetRef, "start", payload);
        },
        signalPropertyChange: function(widgetRef, obj, objType, propName, propValue) {
            if (widgetRef.started() && widgetRef.connected()) {
                Svidget.log("page: signalPropertyChange {id: " + widgetRef.id() + ", type: " + objType + "}");
                var payload = {
                    type: objType,
                    name: obj.name(),
                    propertyName: propName,
                    value: propValue
                };
                this.comm().signalWidget(widgetRef, "propertychange", payload);
            }
        },
        signalActionInvoke: function(widgetRef, actionProxy, argList) {
            if (widgetRef.started() && widgetRef.connected()) {
                Svidget.log("page: signalActionInvoke {id: " + widgetRef.id() + ", url: " + widgetRef.url() + "}");
                var payload = {
                    action: actionProxy.name(),
                    args: argList
                };
                this.comm().signalWidget(widgetRef, "actioninvoke", payload);
            }
        },
        signalEventTrigger: function(widgetRef, eventDescProxy, data) {
            if (widgetRef.started() && widgetRef.connected()) {
                Svidget.log("page: signalEventTrigger {id: " + widgetRef.id() + "}");
                var payload = {
                    event: eventDescProxy.name(),
                    data: data
                };
                this.comm().signalWidget(widgetRef, "eventtrigger", payload);
            }
        },
        handleReceiveWidgetInitialized: function() {
            Svidget.log("page: handleReceiveWidgetInitialized");
        },
        handleReceiveWidgetLoaded: function(widgetRef, widgetTransport) {
            null != widgetRef ? this.populateWidgetReference(widgetRef, widgetTransport) : this.checkUnfinishedWidgetReferences();
        },
        handleReceiveWidgetStartAck: function(widgetRef, widgetTransport) {
            Svidget.log("page: handleReceiveWidgetStartAck {widget: " + widgetRef.id() + "}");
            if (!widgetRef.started()) {
                widgetRef.start();
                this.populateWidgetReference(widgetRef, widgetTransport);
                this.triggerWidgetLoad(widgetRef.id());
                if (this.areAllWidgetsStarted()) {
                    this.allWidgetsStarted = true;
                    this.markLoaded();
                }
            }
        },
        handleReceiveWidgetParamAdded: function(widgetRef, paramPayload) {
            Svidget.log("page: handleReceiveWidgetParamAdded {param: " + paramPayload.name + "}");
            widgetRef.addParamProxy(paramPayload.name, paramPayload);
        },
        handleReceiveWidgetParamRemoved: function(widgetRef, paramName) {
            Svidget.log("page: handleReceiveWidgetParamRemoved {param: " + paramName + "}");
            widgetRef.removeParamProxy(paramName);
        },
        handleReceiveWidgetParamChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetParamChanged {param: " + changePayload.name + "}");
            var param = widgetRef.param(changePayload.name);
            null != param && param.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        handleReceiveWidgetParamSet: function(widgetRef, setPayload) {
            Svidget.log("page: handleReceiveWidgetParamSet {param: " + setPayload.name + "}");
            var param = widgetRef.param(setPayload.name);
            null != param && param.notifyValueChange(setPayload.value);
        },
        handleReceiveWidgetActionAdded: function(widgetRef, actionPayload) {
            Svidget.log("page: handleReceiveWidgetActionAdded {action: " + actionPayload.name + "}");
            widgetRef.addActionProxy(actionPayload.name, actionPayload);
        },
        handleReceiveWidgetActionRemoved: function(widgetRef, actionName) {
            Svidget.log("page: handleReceiveWidgetActionRemoved {action: " + actionName + "}");
            widgetRef.removeActionProxy(actionName);
        },
        handleReceiveWidgetActionChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetActionChanged {action: " + changePayload.name + "}");
            var action = widgetRef.action(changePayload.name);
            null != action && action.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        handleReceiveWidgetActionInvoked: function(widgetRef, actionReturnPayload) {
            Svidget.log("page: handleReceiveWidgetActionInvoked {action: " + actionReturnPayload.name + "}");
            var action = widgetRef.action(actionReturnPayload.name);
            null != action && action.invokeFromWidget(actionReturnPayload.returnValue);
        },
        handleReceiveWidgetActionParamAdded: function(widgetRef, actionParamPayload) {
            Svidget.log("page: handleReceiveWidgetActionParamAdded {actionparam: " + actionParamPayload.name + "}");
            var action = widgetRef.action(actionParamPayload.actionName);
            null != action && action.addParam(actionParamPayload.name, actionParamPayload);
        },
        handleReceiveWidgetActionParamRemoved: function(widgetRef, actionParamNamePayload) {
            Svidget.log("page: handleReceiveWidgetActionParamRemoved {actionparam: " + actionParamNamePayload + "}");
            var action = widgetRef.action(actionParamNamePayload.actionName);
            null != action && action.removeParam(actionParamNamePayload.name);
        },
        handleReceiveWidgetActionParamChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetActionParamChanged {actionparam: " + changePayload.name + "}");
            var action = widgetRef.action(changePayload.actionName);
            if (null != action) {
                var actionParam = action.param(changePayload.name);
                null != actionParam && actionParam.notifyPropertyChange(changePayload.property, changePayload.value);
            }
        },
        handleReceiveWidgetEventAdded: function(widgetRef, eventDescPayload) {
            Svidget.log("page: handleReceiveWidgetEventAdded {event: " + eventDescPayload.name + "}");
            widgetRef.addEventProxy(eventDescPayload.name, eventDescPayload);
        },
        handleReceiveWidgetEventRemoved: function(widgetRef, eventDescName) {
            Svidget.log("page: handleReceiveWidgetEventRemoved {event: " + eventDescName + "}");
            widgetRef.removeEventProxy(eventDescName);
        },
        handleReceiveWidgetEventChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetEventChanged {event: " + changePayload.name + "}");
            var ev = widgetRef.event(changePayload.name);
            null != ev && ev.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        handleReceiveWidgetEventTriggered: function(widgetRef, eventDataPayload) {
            Svidget.log("page: handleReceiveWidgetEventTriggered {event: " + eventDataPayload.name + "}");
            var ev = widgetRef.event(eventDataPayload.name);
            null != ev && ev.triggerEventFromWidget(eventDataPayload.value);
        }
    };
    Svidget.Root.WidgetPrototype = {
        initInternal: function() {
            this.loadCurrent();
            window._svidget = "widget";
        },
        readyWidget: function() {
            Svidget.log("widget: readyWidget");
            this.startWidget();
            this.markLoaded();
        },
        loadCurrent: function() {
            var widget = new Svidget.Widget();
            this.setCurrent(widget);
            this.setCurrent = null;
            Object.defineProperty(this, "$", Svidget.readOnlyProperty(widget));
        },
        startWidget: function() {
            var widget = this.current();
            this.parseElements();
            this.connected() ? this.startWidgetConnected(widget) : this.startWidgetStandalone(widget);
        },
        startWidgetStandalone: function(widget) {
            var paramValues = this.getParamValuesFromQueryString();
            this.setParamValues(widget, paramValues, true);
            widget.start();
        },
        startWidgetConnected: function(widget) {
            if (null != this.paramValues) {
                this.setParamValues(this.paramValues);
                this.paramValues = null;
                widget.setPopulatedFromPage();
            }
            widget.start();
        },
        parseElements: function() {
            var paramsElement = this.getParamsElement();
            this.populateParams(paramsElement);
            var actionsElement = this.getActionsElement();
            this.populateActions(actionsElement);
            var eventsElement = this.getEventsElement();
            this.populateEvents(eventsElement);
        },
        getParamsElement: function() {
            return this.getSvidgetElement("params");
        },
        getActionsElement: function() {
            return this.getSvidgetElement("actions");
        },
        getEventsElement: function() {
            return this.getSvidgetElement("events");
        },
        getSvidgetElement: function(name) {
            var eles = Svidget.DOM.getByNameSvidget(name, true);
            return 0 == eles.length ? null : eles[0];
        },
        populateParams: function(xele) {
            if (null != xele) {
                var that = this, widget = this.current();
                this.populateElementObjects(xele, function(nextEle, widget) {
                    var param = that.buildParam(nextEle, widget);
                    null != param && widget.addParam(param);
                });
                this.wireDeclaredHandler(widget, widget.ondeclaredparamadd, Svidget.DOM.attrValue(xele, "onadd"));
                this.wireDeclaredHandler(widget, widget.ondeclaredparamremove, Svidget.DOM.attrValue(xele, "onremove"));
            }
        },
        buildParam: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "param")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            if (null == name) return null;
            var value = Svidget.DOM.attrValue(xele, "value"), options = this.buildOptions(xele, Svidget.Param.optionProperties), param = new Svidget.Param(name, value, options, widget);
            this.wireDeclaredChangeHandler(param, Svidget.DOM.attrValue(xele, "onchange"));
            this.wireDeclaredSetHandler(param, Svidget.DOM.attrValue(xele, "onset"));
            return param;
        },
        populateActions: function(xele) {
            if (null != xele) {
                var that = this, widget = this.current();
                this.populateElementObjects(xele, function(nextEle, widget) {
                    var action = that.buildAction(nextEle, widget);
                    if (null != action) {
                        widget.addAction(action);
                        that.populateActionParams(nextEle, action);
                    }
                });
                this.wireDeclaredHandler(widget, widget.ondeclaredactionadd, Svidget.DOM.attrValue(xele, "onadd"));
                this.wireDeclaredHandler(widget, widget.ondeclaredactionremove, Svidget.DOM.attrValue(xele, "onremove"));
            }
        },
        populateActionParams: function(actionEle, action) {
            if (null != actionEle) {
                var that = this;
                this.populateElementObjects(actionEle, function(nextEle, widget) {
                    var param = that.buildActionParam(nextEle, action);
                    null != param && action.addParam(param);
                });
            }
        },
        buildAction: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "action")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            if (null == name) return null;
            var options = this.buildOptions(xele, Svidget.Action.optionProperties), action = new Svidget.Action(name, options, widget);
            this.wireDeclaredChangeHandler(action, Svidget.DOM.attrValue(xele, "onchange"));
            this.wireDeclaredInvokeHandler(action, Svidget.DOM.attrValue(xele, "oninvoke"));
            this.wireDeclaredParamAddHandler(action, Svidget.DOM.attrValue(xele, "onparamadd"));
            this.wireDeclaredParamRemoveHandler(action, Svidget.DOM.attrValue(xele, "onparamremove"));
            this.wireDeclaredParamChangeHandler(action, Svidget.DOM.attrValue(xele, "onparamchange"));
            return action;
        },
        buildActionParam: function(xele, action) {
            if (!this.isValidSvidgetElement(xele, "actionparam")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            if (null == name) return null;
            var options = this.buildOptions(xele, Svidget.ActionParam.optionProperties), param = new Svidget.ActionParam(name, options, action);
            this.wireDeclaredChangeHandler(param, Svidget.DOM.attrValue(xele, "onchange"));
            return param;
        },
        populateEvents: function(xele) {
            if (null != xele) {
                var that = this, widget = this.current();
                this.populateElementObjects(xele, function(nextEle, widget) {
                    var ev = that.buildEvent(nextEle, widget);
                    null != ev && widget.addEvent(ev);
                });
                this.wireDeclaredHandler(widget, widget.ondeclaredeventadd, Svidget.DOM.attrValue(xele, "onadd"));
                this.wireDeclaredHandler(widget, widget.ondeclaredeventremove, Svidget.DOM.attrValue(xele, "onremove"));
            }
        },
        buildEvent: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "event")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            if (null == name) return null;
            var options = this.buildOptions(xele, Svidget.EventDesc.optionProperties), ev = new Svidget.EventDesc(name, options, widget);
            this.wireDeclaredChangeHandler(ev, Svidget.DOM.attrValue(xele, "onchange"));
            this.wireDeclaredTriggerHandler(ev, Svidget.DOM.attrValue(xele, "ontrigger"));
            return ev;
        },
        populateElementObjects: function(xele, eachAction) {
            if (null != xele && null != xele.childNodes) for (var widget = this.current(), nextEle = xele.firstElementChild; null != nextEle; ) {
                eachAction && eachAction(nextEle, widget);
                nextEle = nextEle.nextElementSibling;
            }
        },
        buildOptions: function(xele, optionProps) {
            var options = {};
            if (null == optionProps || !Svidget.isArray(optionProps)) return options;
            for (var i = 0; i < optionProps.length; i++) {
                var optName = optionProps[i], optVal = Svidget.DOM.attrValue(xele, optName);
                null != optVal && (options[optName] = optVal);
            }
            return options;
        },
        wireDeclaredChangeHandler: function(obj, funcStr) {
            this.wireDeclaredHandler(obj, obj.ondeclaredchange, funcStr);
        },
        wireDeclaredSetHandler: function(param, funcStr) {
            this.wireDeclaredHandler(param, param.ondeclaredset, funcStr);
        },
        wireDeclaredInvokeHandler: function(action, funcStr) {
            this.wireDeclaredHandler(action, action.ondeclaredinvoke, funcStr);
        },
        wireDeclaredTriggerHandler: function(event, funcStr) {
            this.wireDeclaredHandler(event, event.ondeclaredtrigger, funcStr);
        },
        wireDeclaredParamAddHandler: function(action, funcStr) {
            this.wireDeclaredHandler(action, action.ondeclaredparamadd, funcStr);
        },
        wireDeclaredParamRemoveHandler: function(action, funcStr) {
            this.wireDeclaredHandler(action, action.ondeclaredparamremove, funcStr);
        },
        wireDeclaredParamChangeHandler: function(action, funcStr) {
            this.wireDeclaredHandler(action, action.ondeclaredparamchange, funcStr);
        },
        wireDeclaredHandler: function(obj, wireFunc, funcStr) {
            if (null != wireFunc) {
                var func = Svidget.findFunction(funcStr);
                null != func && Svidget.isFunction(func) && wireFunc.call(obj, func);
            }
        },
        connectWidget: function(id, paramValues, connected) {
            var widget = this.current();
            if (!widget.connected()) {
                if (connected) {
                    Svidget.log("widget: connect {id: " + id + "}");
                    widget.connect(id);
                    this.getset("connected", true);
                } else Svidget.log("widget: standalone {id: " + id + "}");
                this.paramValues = paramValues || {};
                this.fixSizing();
            }
        },
        startWidgetWithPageParams: function() {
            var widget = this.current();
            if (widget.started()) {
                this.setParamValues(widget, this.paramValues);
                widget.setPopulatedFromPage();
            }
        },
        getParamValuesFromQueryString: function() {
            var qs = Svidget.Util.queryString();
            return qs;
        },
        setParamValues: function(widget, paramValues, qsMode) {
            var col = widget.params();
            null != col && col.each(function(p) {
                var key = qsMode && p.shortname() || p.name(), val = paramValues[key];
                void 0 === val && (val = paramValues[p.name()]);
                void 0 === val && (val = p.defvalue());
                void 0 !== key && p.value(val);
            });
        },
        isValidSvidgetElement: function(xele, name) {
            return null != xele && xele.localName == name && xele.namespaceURI == Svidget.Namespaces.svidget;
        },
        fixSizing: function() {
            var root = Svidget.DOM.root();
            if (root && root.viewBox && root.viewBox.baseVal && 0 < root.viewBox.baseVal.width && 0 < root.viewBox.baseVal.height) {
                root.setAttribute("width", "100%");
                root.setAttribute("height", "100%");
            }
        },
        current: function() {
            return this.getset("current");
        },
        connected: function() {
            return this.getset("connected");
        },
        receiveFromParent: function(name, payload) {
            Svidget.log("widget: receiveFromParent {name: " + name + "}");
            "start" == name ? this.handleReceiveParentStart(payload) : "actioninvoke" == name ? this.handleReceiveParentActionInvoke(payload) : "eventtrigger" == name ? this.handleReceiveParentEventTrigger(payload) : "propertychange" == name && this.handleReceiveParentPropertyChange(payload);
        },
        signalStartAck: function() {
            Svidget.log("widget: signalStartAck {id: " + this.current().id() + "}");
            var t = this.current().toTransport();
            this.comm().signalParent("startack", t, this.current().id());
        },
        signalParamAdded: function(param) {
            if (this.connected()) {
                Svidget.log("widget: signalParamAdded {id: " + this.current().id() + "}");
                var transport = param.toTransport();
                this.comm().signalParent("paramadded", transport, this.current().id());
            }
        },
        signalParamRemoved: function(paramName) {
            if (this.connected()) {
                Svidget.log("widget: signalParamRemoved {id: " + this.current().id() + "}");
                this.comm().signalParent("paramremoved", paramName, this.current().id());
            }
        },
        signalParamChanged: function(param, changeData) {
            if (this.connected()) {
                Svidget.log("widget: signalParamChanged {id: " + this.current().id() + "}");
                changeData.name = param.name();
                this.comm().signalParent("paramchanged", changeData, this.current().id());
            }
        },
        signalParamSet: function(param, changeData) {
            if (this.connected()) {
                Svidget.log("widget: signalParamSet {id: " + this.current().id() + "}");
                changeData.name = param.name();
                this.comm().signalParent("paramset", changeData, this.current().id());
            }
        },
        signalActionAdded: function(action) {
            if (this.connected()) {
                Svidget.log("widget: signalActionAdded {id: " + this.current().id() + "}");
                var transport = action.toTransport();
                this.comm().signalParent("actionadded", transport, this.current().id());
            }
        },
        signalActionRemoved: function(actionName) {
            if (this.connected()) {
                Svidget.log("widget: signalActionRemoved {id: " + this.current().id() + "}");
                this.comm().signalParent("actionremoved", actionName, this.current().id());
            }
        },
        signalActionChanged: function(action, changeData) {
            if (this.connected()) {
                Svidget.log("widget: signalActionChanged {id: " + this.current().id() + "}");
                changeData.name = action.name();
                this.comm().signalParent("actionchanged", changeData, this.current().id());
            }
        },
        signalActionInvoked: function(action, returnData) {
            if (this.connected()) {
                Svidget.log("widget: signalActionInvoked {id: " + this.current().id() + "}");
                returnData.name = action.name();
                this.comm().signalParent("actioninvoked", returnData, this.current().id());
            }
        },
        signalActionParamAdded: function(actionParam, actionName) {
            if (this.connected()) {
                Svidget.log("widget: signalActionParamAdded {id: " + this.current().id() + "}");
                var transport = actionParam.toTransport();
                transport.actionName = actionName;
                this.comm().signalParent("actionparamadded", transport, this.current().id());
            }
        },
        signalActionParamRemoved: function(actionParamName, actionName) {
            if (this.connected()) {
                Svidget.log("widget: signalActionParamRemoved {id: " + this.current().id() + "}");
                var transport = {
                    name: actionParamName,
                    actionName: actionName
                };
                this.comm().signalParent("actionparamremoved", transport, this.current().id());
            }
        },
        signalActionParamChanged: function(actionParam, action, changeData) {
            if (this.connected()) {
                Svidget.log("widget: signalActionParamChanged {id: " + this.current().id() + "}");
                changeData.name = actionParam.name();
                changeData.actionName = action.name();
                this.comm().signalParent("actionparamchanged", changeData, this.current().id());
            }
        },
        signalEventAdded: function(eventDesc) {
            if (this.connected()) {
                Svidget.log("widget: signalEventAdded {id: " + this.current().id() + "}");
                var transport = eventDesc.toTransport();
                this.comm().signalParent("eventadded", transport, this.current().id());
            }
        },
        signalEventRemoved: function(eventDescName) {
            if (this.connected()) {
                Svidget.log("widget: signalEventRemoved {id: " + this.current().id() + "}");
                this.comm().signalParent("eventremoved", eventDescName, this.current().id());
            }
        },
        signalEventChanged: function(eventDesc, changeData) {
            if (this.connected()) {
                Svidget.log("widget: signalEventChanged {id: " + this.current().id() + "}");
                changeData.name = eventDesc.name();
                this.comm().signalParent("eventchanged", changeData, this.current().id());
            }
        },
        signalEventTriggered: function(eventDesc, value) {
            if (this.connected()) {
                Svidget.log("widget: signalEventTriggered {id: " + this.current().id() + "}");
                var transport = {
                    name: eventDesc.name(),
                    value: value
                };
                this.comm().signalParent("eventtriggered", transport, this.current().id());
            }
        },
        handleReceiveParentStart: function(payload) {
            payload = payload || {};
            var connected = false !== payload.connected;
            this.connectWidget(payload.id, payload.params, connected);
            connected && this.signalStartAck();
            this.startWidgetWithPageParams();
        },
        handleReceiveParentPropertyChange: function(payload) {
            payload = payload || {};
            payload.type;
            if ("param" == payload.type && "value" == payload.propertyName && null != payload.name) {
                var param = this.current().param(payload.name);
                null != param && param.value(payload.value);
            }
        },
        handleReceiveParentActionInvoke: function(payload) {
            payload = payload || {};
            var actionName = payload.action, action = this.current().action(actionName);
            null != action && action.external() && action.invokeApply(payload.args);
        },
        handleReceiveParentEventTrigger: function(payload) {
            payload = payload || {};
            var eventName = payload.event, ev = this.current().event(eventName);
            null != ev && ev.external() && ev.trigger(payload.data);
        }
    };
    window.document || console.warn("svidget requires a global windowy object with window.document to work correctly.");
    return new Svidget.Root(window, createOptions);
});