/*** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Svidget.js v0.1.0
 * Release Date: 2014-10-23
 * 
 * A framework for creating complex widgets using SVG.
 * 
 * http://www.svidget.org/
 * 
 * Copyright 2014, Joe Agster
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
(function() {
    var Svidget = {};
    Svidget.emptyArray = [];
    Svidget.root = window;
    // note: this may be different for node.js
    /** @function Svidget.array
    Builds an array from any collection, be it another array, HTMLCollection, etc. */
    Svidget.array = function(anyCollection) {
        // oops, we need a collection with a length property
        if (!anyCollection || !anyCollection.length) return null;
        try {
            // this may blow up for IE8 and below and other less than modern browsers
            return Svidget.emptyArray.slice.call(anyCollection, 0);
        } catch (e) {
            // iterate the old fashioned way and push items onto array
            var res = [];
            for (var i = 0; i < anyCollection.length; i++) {
                res.push(anyCollection[i]);
            }
            return res;
        }
    };
    /** @function Svidget.isArray
    Determines if passed in object is actually an array. 
    This is a more relaxed check and handles the case when array is a Svidget.Collection and/or across frame boundaries */
    Svidget.isArray = function(array) {
        return array != null && (Array.isArray(array) || Array.prototype.isPrototypeOf(array) || array.length && array.push);
    };
    Svidget.isFunction = function(func) {
        return typeof func === "function";
    };
    Svidget.isColor = function(color) {
        // todo
        return false;
    };
    // SUMMARY
    // Extends a class with members in the prototype object.
    // REMARKS
    // This is handle in a multiple prototype inheritance scenario. This function can be called for multiple prototypes.
    // This is useful for extending native object prototypes as well.
    Svidget.extend = function(objtype, prototype, overwrite) {
        for (var methodName in prototype) {
            // do we check for hasOwnProperty here? 
            if (overwrite || objtype.prototype[methodName] === undefined) {
                objtype.prototype[methodName] = prototype[methodName];
            }
        }
    };
    Svidget.wrap = function(func, context) {
        // todo: use function.bind() if available
        // ensure func is function, return undefined if not
        if (func == null || typeof func !== "function") return undefined;
        // return a wrapper function
        var p = function() {
            return func.apply(context, arguments);
        };
        return p;
    };
    Svidget.log = function(msg) {
        if (!Svidget.Settings.enableLogging) return;
        console.log(msg);
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
    //show private members of objects, useful for debugging
    Svidget.Settings.enableLogging = false;
    // whether console.logging is enabled, turn on for troubleshooting
    // Prototypal overrides
    if (!Array.prototype.contains) {
        Array.prototype.contains = function(obj) {
            var i = this.length;
            while (i--) {
                if (this[i] === obj) {
                    return true;
                }
            }
            return false;
        };
    }
    // a note about "bla instanceof Array" checks, they don't work across frame boundaries
    // so we use isArray
    if (!Array.isArray) {
        Array.isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
        };
    }
    Svidget.ObjectPrototype = {
        setup: function(privates) {
            this.getPrivate = Svidget.getPrivateAccessor(privates);
            this.setPrivate = Svidget.setPrivateAccessor(privates);
            if (Svidget.Settings.showPrivates) this.privates = privates;
        },
        getset: function(prop, val, validator) {
            // ** get mode
            var curProp = this.getPrivate(prop);
            if (val === undefined) return curProp;
            // ** set mode
            if (validator && !validator(val)) return false;
            // throw error?
            var oldProp = curProp;
            var success = this.setPrivate(prop, val);
            return success;
        },
        // should always return a collection
        select: function(col, selector) {
            if (typeof selector === "number") {
                selector = parseInt(selector);
                // coerce to integer
                return col.wrap(col.getByIndex(selector));
            }
            if (selector !== undefined) return col.wrap(col.getByName(selector + ""));
            // todo: should we clone collection?
            return col;
        },
        // should always return a single item
        selectFirst: function(col, selector) {
            if (typeof selector === "number") {
                selector = parseInt(selector);
                // coerce to integer
                return col.getByIndex(selector);
            }
            if (selector !== undefined) return col.getByName(selector + "");
            return col.first();
        },
        // protected
        wireCollectionAddRemoveHandlers: function(col, addFunc, removeFunc) {
            if (col == null) return;
            col.onAdded(Svidget.wrap(addFunc, this));
            col.onRemoved(Svidget.wrap(removeFunc, this));
        }
    };
    // prototype inheritance:
    // http://dailyjs.com/2010/03/04/framework-part-2-oo/;
    // Encapsulates a set of prototype methods for managing events
    Svidget.EventPrototype = function(typelist) {
        // note: fields declared in a prototype become shared across instances until overriden
        // todo: validate typelist
        // these are the event types that the base object supports, like "invoke" for action.
        this.eventTypes = new Svidget.Collection(typelist);
    };
    Svidget.EventPrototype.prototype = {
        // follows jQuery convention of (type, data, handler)
        // with a twist, we allow them to specify a name for the handler, for easier removal with off
        // if the name or handler already was added, then nothing happens and false is returned
        // required: type, handler
        // allowed signatures
        //   (type, handler)
        //   (type, data, handler)
        //   (type, data, name, handler)
        on: function(type, data, name, handler) {
            // resolve handler from whether name, data passed
            handler = handler || (Svidget.isFunction(name) ? name : Svidget.isFunction(data) ? data : null);
            data = arguments.length > 2 ? data : null;
            name = name !== undefined && handler !== name ? name : null;
            return this.addHandler(type, handler, name, data);
        },
        // allowed signatures
        //   (type, handler)
        //   (type, name)
        off: function(type, handlerOrName) {
            // separate handlerOrName into handler, name
            var handler = Svidget.isFunction(handlerOrName) ? handlerOrName : null;
            var name = handler != null ? null : handlerOrName;
            return this.removeHandler(type, handler, name);
        },
        trigger: function(type, value, originalTarget) {
            if (type == null) return;
            // nothing to do
            // get event object from handlers
            var e = this.triggerHandlers(type, value, originalTarget);
            Svidget.log("trigger: " + type);
            // if not stopPropagation call bubble
            if (!e.isPropagationStopped()) {
                this.bubble(type, e);
            }
        },
        triggerHandlers: function(type, value, originalTarget) {
            // generate event object
            var e = new Svidget.Event(null, type, null, this.getTarget(), originalTarget, value);
            if (type == null || this.handlers == null || this.handlers[type] == null) return e;
            // nothing to do
            var handlers = this.handlers[type];
            // loop through each handler (make sure it is a function)
            // h == { handler: handler, name: name, data: data }
            handlers.each(function(h) {
                if (e.isImmediatePropagationStopped()) return false;
                // if stopImmediatePropagation, then exit loop by returning false
                if (h == null || h.handler == null || typeof h.handler !== "function") return;
                // handler is not a function
                // set name/data
                e.name = h.name;
                e.data = h.data;
                // invoke handler
                h.handler.call(null, e);
            });
            return e;
        },
        bubble: function(type, sourceEvent) {
            // invoked from child
            this.ensureBubbleParents();
            sourceEvent.name = null;
            sourceEvent.data = null;
            if (this.bubbleParents[type]) this.bubbleParents[type](type, sourceEvent, this.getTarget());
        },
        addHandler: function(type, handler, name, data) {
            this.ensureHandlersByType(type);
            // todo: get handler function name, we will use to off() handlers by name
            //if (this.handlers[type].contains(handler)) return false;
            if (this.handlerExists(type, handler, name)) return false;
            var obj = this.toHandlerObject(handler, name, data);
            this.handlers[type].push(obj);
            return true;
        },
        removeHandler: function(type, handler, name) {
            this.ensureHandlers();
            if (!this.handlers[type]) return false;
            //return this.handlers[type].removeAll(handler);
            var that = this;
            return this.handlers[type].removeWhere(function(item) {
                return that.handlerMatch(item, handler, name);
            });
        },
        handlerExists: function(type, handler, name) {
            var that = this;
            var any = this.handlers[type].any(function(item) {
                return that.handlerMatch(item, handler, name);
            });
            return any;
        },
        handlerMatch: function(handlerObj, handler, name) {
            if (name != null && handlerObj.name === name) return true;
            if (handler === handlerObj.handler) return true;
            return false;
        },
        setBubbleParent: function(type, callback) {
            this.ensureBubbleParents();
            this.bubbleParents[type] = callback;
        },
        // private, called by the object to register a single callback for all its event types
        // bubbleTarget: usually a parent object
        registerBubbleCallback: function(types, bubbleTarget, callback) {
            if (bubbleTarget && callback) {
                for (var i = 0; i < types.length; i++) {
                    this.setBubbleParent(types[i], Svidget.wrap(callback, bubbleTarget));
                }
            }
        },
        toHandlerObject: function(handler, name, data) {
            var handlerFunc = typeof handler !== "function" ? null : handlerFunc;
            var res = {
                handler: handler,
                name: name,
                data: data
            };
            return res;
        },
        bubbleFuncs: function(objectType) {},
        ensureHandlers: function() {
            if (!this.handlers) this.handlers = {};
        },
        ensureHandlersByType: function(type) {
            this.ensureHandlers();
            if (!this.handlers[type]) {
                this.handlers[type] = new Svidget.Collection();
            }
        },
        ensureBubbleParents: function() {
            if (!this.bubbleParents) this.bubbleParents = {};
        },
        // internal
        // returns the target object to use for the event object
        // override in eventContainer
        getTarget: function() {
            return this;
        }
    };
    Svidget.ParamPrototype = {
        // name is immutable after creation
        name: function() {
            var res = this.getPrivate("name");
            return res;
        },
        description: function(val) {
            var res = this.getset("description", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            if (this.trigger) this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        type: function(val) {
            var res = this.getset("type", val, this.validateType);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            if (this.trigger) this.trigger("change", {
                property: "type",
                value: val
            });
            return true;
        },
        subtype: function(val) {
            var res = this.getset("subtype", val, this.validateSubtype);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            if (this.trigger) this.trigger("change", {
                property: "subtype",
                value: val
            });
            return true;
        },
        validateType: function(t) {
            if (!typeof t === "string") return false;
            return Svidget.ParamTypes[t] != undefined;
        },
        validateSubtype: function(t) {
            if (!typeof t === "string") return false;
            return Svidget.ParamSubTypes[t] != undefined;
        }
    };
    Svidget.Collection = function(array) {
        this.__type = "Svidget.Collection";
        this.source = array;
        //this.baseType = Svidget.Collection;
        //	this.items = [];
        // append items from source to this instance
        if (array && (Svidget.isArray(array) || Array.prototype.isPrototypeOf(array))) {
            this.push.apply(this, array);
        }
    };
    Svidget.Collection.prototype = new Array();
    Svidget.extend(Svidget.Collection, {
        any: function(predicate) {
            if (predicate == null) return this.length > 0;
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) return true;
            }
            return false;
        },
        all: function(predicate) {
            if (predicate == null) return false;
            for (var i = 0; i < this.length; i++) {
                if (!predicate(this[i])) return false;
            }
            return true;
        },
        contains: function(obj) {
            return this.indexOf(obj) >= 0;
        },
        each: function(operation) {
            for (var i = 0; i < this.length; i++) {
                var res = operation(this[i]);
                if (res === false) break;
            }
        },
        first: function(predicate) {
            if (this.length == 0) return null;
            if (predicate == null || !typeof predicate === "function") return this[0];
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) return this[i];
            }
            return null;
        },
        // Chainable
        select: function(selector) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                result.push(selector(this[i]));
            }
            return new Svidget.Collection(result);
        },
        // Chainable
        where: function(predicate) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) result.push(this[i]);
            }
            return new Svidget.Collection(result);
        },
        // others, if needed:
        // average
        // min
        // max
        // sum
        // agg (generic aggregate function)
        // concat
        // first
        // last
        // union
        // intersect
        // zip
        // modifiers
        add: function(obj) {
            var pos = this.indexOf(obj);
            if (pos >= 0) return false;
            this.push(obj);
            return true;
        },
        addRange: function(array) {
            if (!Svidget.isArray(array)) return false;
            this.push.apply(this, array);
            return true;
        },
        insert: function(obj, index) {
            if (index < 0 || index > this.length) return false;
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
            var removed = false;
            while (this.remove(obj)) {
                removed = true;
            }
            return removed;
        },
        removeWhere: function(predicate) {
            var result = [];
            var removed = false;
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) result.push(this[i]);
            }
            for (var i = 0; i < result.length; i++) {
                removed = this.remove(result) || removed;
            }
            return removed;
        },
        // misc
        toArray: function() {
            var arr = [];
            for (var i = 0; i < this.length; i++) {
                arr.push(this[i]);
            }
            //var check = arr instanceof Array;
            //Svidget.log('is it array: ' + check);
            return arr;
        }
    });
    Svidget.ObjectCollection = function(array, type) {
        // todo: filter input array by type specified
        Svidget.Collection.apply(this, [ array ]);
        this.__type = "Svidget.ObjectCollection";
        // private fields
        var privates = new function() {
            this.writable = [ "addedFunc", "removedFunc" ];
            this.type = type;
            this.addedFunc = null;
            this.removedFunc = null;
        }();
        // private accessors
        this.setup(privates);
    };
    var base = new Svidget.Collection();
    Svidget.ObjectCollection.prototype = base;
    Svidget.ObjectCollection.prototype.base_add = base.add;
    Svidget.ObjectCollection.prototype.base_remove = base.remove;
    Svidget.extend(Svidget.ObjectCollection, {
        // gets an item in the collection by its index (if number passed) or id/name (if string passed)
        get: function(selector) {
            if (typeof selector === "number") return col.getByIndex(selector);
            return col.getByName(selector);
        },
        getByIndex: function(index) {
            if (index == null || isNaN(index)) return null;
            index = parseInt(index);
            return this[index];
        },
        getByName: function(name) {
            return this.first(function(p) {
                return p.name() == name;
            });
        },
        type: function() {
            return this.getset("type");
        },
        // this returns the newly created object, or null
        add: function() {
            if (arguments.length == 0) return null;
            // call add overload
            var item;
            var arg0;
            var success;
            if (arguments.length >= 1) arg0 = arguments[0];
            if (typeof arg0 === "string") {
                item = this.create.apply(this, arguments);
            } else {
                item = arg0;
            }
            if (item == null) return null;
            success = this.addObject(item);
            if (!success) return null;
            // if succeeded, notify widget
            this.triggerAdded(item);
            return item;
        },
        addObject: function(obj) {
            // ensure obj is a valid Param
            if (obj == null || !obj instanceof this.type()) return false;
            // ensure no other parameter exists in the collection by that name
            if (obj.name !== undefined && this.getByName(obj.name()) != null) return false;
            // add to collection
            this.push(obj);
            return obj;
        },
        // returns the object added if successful, otherwise null
        create: function() {
            // override me
            return null;
        },
        //		addCreate: function (name, value, options) {
        //			// create param
        //			// call addObject
        //			if (name == null || !typeof name === "string") return false;
        //			// ensure no other parameter exists in the collection by that name
        //			if (this.getByName(name) != null) return false;
        //			// create obj
        //			var obj = new Svidget.Param(name, value, options);
        //			this.push(obj);
        //			return true;
        //		},
        remove: function(name) {
            var item = this.getByName(name);
            if (item == null) return false;
            var success = this.base_remove(item);
            if (!success) return false;
            // if succeeded, notify widget
            this.triggerRemoved(item);
        },
        wrap: function(item) {
            var items = [ item ];
            if (item == null || !item instanceof this.type()) items = [];
            var col = new this.constructor(items, this.parent);
            return col;
        },
        // EVENTS
        // internal
        // wires up an internal handler when an item is added to the collection
        onAdded: function(func) {
            this.getset("addedFunc", func);
        },
        // internal
        // wires up an internal handler when an item is removed from the collection
        onRemoved: function(func) {
            this.getset("removedFunc", func);
        },
        // private
        triggerAdded: function(item) {
            var func = this.getset("addedFunc");
            if (func) func(item);
        },
        // private
        triggerRemoved: function(item) {
            var func = this.getset("removedFunc");
            if (func) func(item);
        }
    }, true);
    // overwrite base methods, copied above
    Svidget.extend(Svidget.Collection, Svidget.ObjectPrototype);
    //var base = new Svidget.Collection;
    //Svidget.ParamCollection.prototype.base_add = base.add;
    //Svidget.ParamCollection.prototype.base_remove = base.remove;
    //Svidget.extend(Svidget.ParamCollection, base);
    // tasks:
    // - finish add() methods
    // -
    // prototype inheritance:
    // http://dailyjs.com/2010/03/04/framework-part-2-oo/;
    Svidget.Communicator = function() {
        this.__type = "Svidget.Communicator";
        this.sameDomain = null;
        this._init();
    };
    Svidget.Communicator.prototype = {
        _init: function() {
            this.addMessageEvent();
        },
        // REGION: Events
        addMessageEvent: function() {
            window.addEventListener("message", Svidget.wrap(this.receiveXSM, this), false);
        },
        // REGION: Receive
        receiveFromParent: function(name, payload) {
            svidget.receiveFromParent(name, payload);
        },
        receiveFromWidget: function(name, payload, widgetID) {
            svidget.receiveFromWidget(name, payload, widgetID);
        },
        receiveXSM: function(message) {
            if (message == null) return;
            var msgData = message.data;
            if (msgData == null) return;
            // it's possible in future we'll have a nested widget scenario, so a widget can have both a parent and widgets.
            if (msgData.widget !== undefined) this.receiveFromWidget(msgData.name, msgData.payload, msgData.widget); else this.receiveFromParent(msgData.name, msgData.payload);
        },
        // REGION: Signal Parent
        signalParent: function(name, payload, widgetID) {
            // todo: cache result of isParentSameDomain
            if (this.isParentSameDomain()) {
                this.signalParentDirect(name, payload, widgetID);
            } else {
                this.signalParentXSM(name, payload, widgetID);
            }
        },
        signalParentDirect: function(name, payload, widgetID) {
            //var check = window === window.parent;
            // note: if window.parent.svidget is null it means the widget DOM was ready before the page DOM, although unlikely it is possible
            // so we need to handle somehow
            if (window.parent != null && window !== window.parent && window.parent.svidget != null && window.parent.svidget) {
                var root = window.parent.svidget;
                setTimeout(function() {
                    root.routeFromWidget(name, payload, widgetID);
                }, 0);
            }
        },
        signalParentXSM: function(name, payload, widgetID) {
            if (window.parent != null) {
                //alert('postMessage');
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
        // todo: move to widget
        // note: this returns true when widget is forced cross domain
        isParentSameDomain: function() {
            if (this.sameParentDomain == null) this.sameParentDomain = this.checkParentSameDomain();
            return this.sameParentDomain;
        },
        // todo: move to Svidget.DOM
        checkParentSameDomain: function() {
            try {
                var d = window.parent.document;
                return true;
            } catch (ex) {
                return false;
            }
        },
        // REGION: Widgets
        signalWidget: function(widgetRef, name, payload) {
            Svidget.log("communicator: signalWidget {name: " + name + "}");
            if (!widgetRef.isCrossDomain()) //this.isWidgetSameDomain(widgetProxy))
            this.signalWidgetDirect(widgetRef, name, payload); else this.signalWidgetXSM(widgetRef, name, payload);
        },
        signalWidgetDirect: function(widgetRef, name, payload) {
            if (widgetRef == null) return;
            var root = widgetRef.root();
            if (root != null) {
                setTimeout(function() {
                    root.receiveFromParent(name, payload);
                }, 0);
            }
        },
        signalWidgetXSM: function(widgetRef, name, payload) {
            if (widgetRef != null && widgetRef.window() != null) {
                var msg = this.buildSignalWidgetMessage(name, payload);
                //widgetRef.window().postMessage(msg, '*');
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
    // Valid Selectors
    // element itself
    // "someid" - reference to element
    // "#someid" - reference to element
    // ".someid" - reference to element class
    // https://developer.mozilla.org/en-US/docs/Web/API/document.querySelectorAll
    Svidget.DOM = {
        // REMARKS
        // Wrapper for getElementById
        get: function(sel) {
            return document.getElementById(sel);
        },
        getByName: function(tagName, asCollection) {
            return this.getChildrenByName(document, tagName, asCollection);
        },
        getByNameNS: function(namespace, tagName, asCollection) {
            var tags = document.getElementsByTagNameNS(namespace, tagName);
            if (asCollection) {
                return new Svidget.Collection(Svidget.array(tags));
            }
            return tags;
        },
        // Gets elements by tag name belonging to the svidget namespace
        getByNameSvidget: function(tagName, asCollection) {
            return this.getByNameNS(Svidget.Namespaces.svidget, tagName, asCollection);
        },
        getChildrenByName: function(source, tagName, asCollection) {
            var tags = source.getElementsByTagName(tagName);
            if (asCollection) {
                return new Svidget.Collection(Svidget.array(tags));
            }
            return tags;
        },
        // if sel is a string calls get()
        getElement: function(sel) {
            if (typeof sel == "string") return this.get(sel); else return sel;
        },
        // gets an element by ID and returns a DomItem
        getItem: function(sel) {
            return this.wrap(this.get(sel));
        },
        // returns a DomQuery object
        select: function(sel) {
            // todo: support jQuery selector if querySelectorAll fails, it might be loaded on the page so we might as well use it if we can
            if (!document.querySelectorAll) return null;
            if (sel == null) return null;
            // new Svidget.DomQuery();
            // use querySelectorAll
            var attrRX = /@[^=#\s]+/g;
            var hasAttr = attrRX.test(sel);
            var col = new Svidget.Collection();
            var res;
            // if selector has an attribute in it, split it first by comma
            if (hasAttr) {
                var parts = sel.split(",");
                for (var i = 0; i < parts.length; i++) {
                    res = selectSingle(parts[i]);
                    if (res) col.addRange(res);
                }
            } else {
                res = selectSingle(sel);
                // its possible selector was bad, in which case we get null, so check
                if (res) col.addRange(res);
            }
            var query = new Svidget.DOMQuery(col, sel);
            return query;
            // given a selector string free from any commas, looks up the elements/attributes for it
            // and returns a collection.
            function selectSingle(s) {
                if (s == null) return null;
                var attrRXEnd = /@([^=#\s]+)$/g;
                var sel = s;
                var attrName;
                var match = attrRXEnd.exec(s);
                if (match) {
                    attrName = match[1];
                    // match the subgroup
                    sel = sel.replace(match[0], "");
                }
                // query
                var eles;
                try {
                    eles = document.querySelectorAll(sel);
                } catch (ex) {
                    // seelctor was invalid, so just return null
                    return null;
                }
                // build collection
                var col = [];
                for (var i = 0; i < eles.length; i++) {
                    var ele = eles[i];
                    var item;
                    if (attrName) {
                        var attr = Svidget.DOM.attr(ele, attrName);
                        if (attr != null) {
                            item = new Svidget.DOMItem(attr);
                        }
                    } else {
                        item = new Svidget.DOMItem(ele);
                    }
                    if (item) {
                        col.push(item);
                    }
                }
                return new Svidget.Collection(col);
            }
        },
        // Returns the first DOM element in a query
        selectElement: function(sel) {
            if (typeof sel == "string") {
                var q = this.select(sel);
                if (q == null || q.length == 0) return null;
                return q.item(0).source();
            } else if (this.isElement(sel)) return sel; else return null;
        },
        // returns a DomItem if ele is a element or attribute object
        // else returns the original item
        wrap: function(ele) {
            return new Svidget.DOMItem(ele);
        },
        // converts an HTML or SVG DOM node into a pure object literal used to transport
        transportize: function(ele) {
            return {
                name: ele.localName,
                namespace: ele.namespaceURI,
                value: ele.value,
                type: ele.nodeType == 1 ? Svidget.NodeType.element : ele.nodeType == 2 ? Svidget.NodeType.attribute : null
            };
        },
        // Elements
        root: function() {
            return document.documentElement;
        },
        rootItem: function() {
            // should we cache?
            return this.wrap(this.root());
        },
        attr: function(ele, attrName) {
            return ele.attributes[attrName];
        },
        attrValue: function(ele, attrName) {
            var a = this.attr(ele, attrName);
            if (a) return a.value;
            return null;
        },
        clone: function(item) {},
        cloneDetached: function(item) {},
        isDOMNode: function(source) {
            return source.namespaceURI && source.localName && source.nodeType && source.value && (source.nodeType == 1 || source.nodeType == 2);
        },
        fromNodeType: function(type) {
            if (type == 1) return "element";
            if (type == 2) return "attribute";
            if (type == 3) return "text";
            return null;
        },
        // TEXT
        text: function(sel, text) {
            var obj = this.select(sel);
            if (text === undefined) return this.getText(obj); else this.setText(obj, text);
        },
        getText: function(obj) {
            if (obj.textContent) return obj.textContent; else if (obj.innerHTML) return obj.innerHTML; else return null;
        },
        setText: function(obj, text) {
            if (obj.textContent) obj.textContent = text + ""; else if (obj.innerHTML) obj.innerHTML = text + "";
        },
        // VALIDATION
        // returns null - it means document hasn't loaded yet
        // returns undefined - it means document is loaded but not accessible due to security (cross domain) constraints
        getDocument: function(objOrWinEle) {
            try {
                var doc = objOrWinEle.contentDocument;
                // certain browsers (Chrome) returns a blank document instead of null
                if (doc != null && doc.URL == "about:blank") return null;
                return doc;
            } catch (ex) {
                return undefined;
            }
        },
        // determines if document for <object> or <iframe> is loaded and ready
        isElementDocumentReady: function(objOrWinEle) {
            return this.getDocument(objOrWinEle) !== null;
        },
        isElement: function(ele) {
            return ele instanceof HTMLElement;
        },
        // MANIPULATION
        // todo move to DomItem
        attach: function(containerEle, eles) {},
        // detaches an element from the DOM
        // RETURNS
        // The elements that were detached
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
        // EVENTS
        // Note: todo: for on and off
        // wrap callback in compat layer with jQuery style event object
        // PARAMS
        // obj: object to attach listener to
        // name: type of event i.e. "click"
        // callback: function to call back
        // capture: whether in capture/bubble
        // RETURNS
        // true if successful
        // REMARKS
        // Note: this is for DOM events
        // todo: support for event delegation?
        on: function(obj, type, callback, capture) {
            capture = !!capture;
            // normalize to bool (default == false)
            var attached = false;
            if (obj.addEventListener) {
                // Supports DOM spec
                obj.addEventListener(type, callback, capture);
                attached = true;
            } else if (obj.attachEvent) {
                // IE8 and below
                obj.attachEvent("on" + type, callback);
                attached = true;
            }
            // obj doesn't support events
            return attached;
        },
        off: function(obj, type, callback, capture) {
            capture = !!capture;
            // normalize to bool (default == false)
            var detached = false;
            if (obj.addEventListener) {
                obj.removeEventListener(type, callback, false);
                detached = true;
            } else if (document.attachEvent) {
                document.detachEvent("on" + type, callback);
                detached = true;
            }
            // obj doesn't support events
            return detached;
        }
    };
    //var doc = document;
    //var docele = document.documentElement;;
    // SUMMARY
    // Encapsulates a single DOM element or attribute.
    // REMARKS
    // An actual DOM element need not be provided.
    // source can be an actual DOM element or attribute, or a object describing one. Object properties must match names.
    Svidget.DOMItem = function(source) {
        this.__type = "Svidget.DOMItem";
        source = source || {};
        // default source to empty object
        // privates
        var privates = new function() {
            this.writable = [ "value" ];
            this.type = null;
            this.name = null;
            this.value = null;
            this.namespace = null;
            this.source = source;
            this.sourceDOM = isSourceDOM(source);
        }();
        // private accessors
        this.setup(privates);
        function isSourceDOM(source) {
            if (source == null) return false;
            return source.namespaceURI && source.localName && source.nodeType && (source.value || source.textContent) && (source.nodeType == 1 || source.nodeType == 2);
        }
        function getType(typeCode) {
            if (typeCode == Svidget.NodeType.element) return "element";
            if (typeCode == Svidget.NodeType.attribute) return "attribute";
            return null;
        }
        function getNamespaceType(namespace) {
            for (var n in Svidget.Namespaces) {
                if (namespace === Svidget.Namespaces[n]) return n;
            }
        }
        if (privates.sourceDOM) {
            privates.typeCode = source.nodeType == 1 ? Svidget.NodeType.element : source.nodeType == 2 ? Svidget.NodeType.attribute : null;
            privates.name = source.localName;
            privates.namespace = source.namespaceURI;
        } else {
            privates.typeCode = source.type;
            privates.name = source.name;
            privates.namespace = source.namespace;
        }
        privates.value = source.value || source.textContent;
        privates.type = getType(privates.typeCode);
        privates.namespaceType = getNamespaceType(privates.namespace);
        // build attributes
        this.cachedAttributes = null;
        // build child elements
        this.cachedElements = null;
    };
    Svidget.DOMItem.prototype = {
        typeCode: function() {
            return this.getset("type");
        },
        //	type: function () {
        //		var type = this.typeCode();
        //		if (type == Svidget.NodeType.element) return "element";
        //		if (type == Svidget.NodeType.attribute) return "attribute";
        //		return null;
        //	},
        // gets the element or attribute name of the item
        name: function() {
            return this.getset("name");
        },
        // gets the element text content or the attribute value
        value: function(val) {
            var source = this.source();
            if (val === undefined) return source.value || source.textContent;
            var strval = val + "";
            if (source.value) source.value = strval; else source.textContent = strval;
        },
        namespace: function() {
            return this.getset("namespace");
        },
        namespaceType: function() {
            return this.getset("namespaceType");
        },
        //	namespaceType: function () {
        //		var ns = this.namespace();
        //		for (var n in Svidget.Namespaces) {
        //			if (ns === Svidget.Namespaces[n]) return n;
        //		}
        //	},
        hasElements: function() {
            if (this.isAttribute()) return false;
            var source = this.source();
            if (this.isAttached() || source.children && source.children.length) {
                return source.children.length > 0;
            }
            return false;
        },
        hasAttributes: function() {
            if (this.isAttribute()) return false;
            var source = this.source();
            if (this.isAttached() || source.attributes && source.attributes.length) {
                return source.attributes.length > 0;
            }
            return false;
        },
        isAttribute: function() {
            return this.type() == Svidget.NodeType.attribute;
        },
        // returns child elements as DomItem instances
        // returns null if this is an attribute
        elements: function() {
            // lazy load
            if (this.cachedElements != null && Svidget.isArray(this.cachedElements)) return this.cachedElements;
            var isDOM = this.isAttached();
            if (!isDOM && (!source.elements || !source.elements.length)) return null;
            var source = this.source();
            var origcol = isDOM ? source.children : source.elements;
            var eles = new Svidget.Collection(Svidget.array(origcol));
            eles = eles.select(function(e) {
                return new Svidget.DOMItem(e);
            });
            this.cachedElements = eles;
            return this.cachedElements;
        },
        // returns attributes as DomItem instances
        // returns null if this is an attribute
        attributes: function() {
            // lazy load
            if (this.cachedAttributes != null && Svidget.isArray(this.cachedAttributes)) return this.cachedAttributes;
            var isDOM = this.isAttached();
            if (!isDOM && (!source.attributes || !source.attributes.length)) return null;
            var source = this.source();
            var origcol = source.attributes;
            var attrs = new Svidget.Collection(Svidget.array(origcol));
            attrs = attrs.select(function(a) {
                return new Svidget.DOMItem(a);
            });
            this.cachedAttributes = attrs;
            return this.cachedAttributes;
        },
        // gets the underlyind DOM object
        source: function() {
            return this.getset("source");
        },
        isAttached: function() {
            return this.getset("sourceDOM");
        }
    };
    // todo: extend eventprototype
    Svidget.extend(Svidget.DOMItem, Svidget.ObjectPrototype);
    // SUMMARY
    // Represents the result of a DOM query. Chainable.
    // REMARKS
    // Similar to a jQuery object
    Svidget.DOMQuery = function(domItemCollection, selector) {
        this.__type = "Svidget.DOMQuery";
        var items = new Svidget.Collection(domItemCollection);
        // if domItemCollection not valid its ok, will just initialize an empty collection
        var privates = new function() {
            this.writable = [];
            this.items = items;
            this.selector = selector;
        }();
        // private accessors
        this.getPrivate = Svidget.getPrivateAccessor(privates);
        this.setPrivate = Svidget.setPrivateAccessor(privates);
        // define length readonly property
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
            if (items == null) return null;
            return items[index];
        },
        hasItems: function() {
            //return this.items().length > 0;
            return this.length > 0;
        },
        // returns the selector string used for this query
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
    // extend Svidget.Collection?
    // note: down the road we may make this more like a jquery object
    Svidget.extend(Svidget.DOMQuery, Svidget.ObjectPrototype);
    // Enums
    Svidget.DocType = {
        html: 0,
        svg: 1
    };
    // http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#document
    Svidget.DocReadyState = {
        loading: 0,
        //'loading',
        interactive: 1,
        //'interactive',
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
        bool: 3
    };
    Svidget.ParamSubTypes = {
        none: 0,
        color: 1,
        integer: 2,
        regex: 3
    };
    Svidget.NodeType = {
        element: 0,
        attribute: 1
    };
    Svidget.Namespaces = {
        html: "http://www.w3.org/1999/xhtml",
        // also used for HTML5
        svidget: "http://www.svidget.org/svidget",
        //todo: should be change to 2014? maybe not, just keep simple
        svg: "http://www.w3.org/2000/svg",
        xlink: "http://www.w3.org/1999/xlink"
    };
    // delegation example:
    // page with multiple widgets
    // widget1 has finished loading, and triggers is loaded event
    // parent
    // note: this will not wrap browser events like jQuery so no need for original event object
    // we may also create a DOMEvent object
    // we will stick to Kinetic model for now
    Svidget.Event = function(name, type, data, target, origTarget, value) {
        //this.data = data; 
        //this.name = name; // the name of the handler specified at bind time
        //this.target = target; 
        //this.timeStamp = +new Date();
        //this.type = type; 
        //this.value = null; 
        //this.widget = null; // not needed, they can infer from target
        // target: current object (param, action, etc) that currently triggered event (either original or current bubble target)
        Object.defineProperty(this, "currentTarget", Svidget.readOnlyProperty(target));
        // data: this is data that was passed at bind time (writable)
        Object.defineProperty(this, "data", Svidget.fixedProperty(data));
        // name: the name of the handler specified at bind time (writable)
        Object.defineProperty(this, "name", Svidget.fixedProperty(name));
        Object.defineProperty(this, "timeStamp", Svidget.readOnlyProperty(+new Date()));
        // target: object (param, action, etc) that triggered event
        Object.defineProperty(this, "target", Svidget.readOnlyProperty(origTarget == null ? target : origTarget));
        // type: i.e. "invoke", "change", "actioninvoke", "eventtrigger" etc
        Object.defineProperty(this, "type", Svidget.readOnlyProperty(type));
        // value: this is the value specified at trigger time
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
    // Implements EventPrototype as a standalone object.
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
    //(function () {
    // Svidget is an object var not a class var, so instantiate with ()
    // We declare it this way so that we can maintain private members via var
    // REMARKS: this should be instantiated last after all ofther lib scripts loaded
    Svidget.Root = function(root) {
        this.__type = "Svidget.Root";
        //var isWidget = null;
        //var isBrowser = null; 
        //var domLoaded = false;
        //var doc = document;
        //var docElement = document.documentElement;
        var that = this;
        // private fields
        var privates = new function() {
            this.writable = [ "current", "widgets", "connected", "loaded" ];
            // Common:
            this.comm = new Svidget.Communicator();
            this.eventContainer = new Svidget.EventContainer([ "loaded" ], that);
            // todo: move event names to array at bottom
            this.loaded = false;
            // Widget:
            this.current = null;
            this.connected = false;
            // Page:
            this.widgets = null;
        }();
        // private accessors
        this.setup(privates);
        // state
        //this.isWidget = null; // moved to function
        this.isBrowser = true;
        // whether in browser or in some other execution environment i.e. Node.js
        //this.isReady = false; // moved to function
        this.root = root || window;
        // i.e. window
        this.docType = null;
        this.setCurrent = function(widget) {
            privates.current = widget;
        };
        // invoke init
        // todo: convert to private methods
        this._init();
    };
    Svidget.Root.prototype = {
        _init: function() {
            //this._initDomObjects();
            this._initEvents();
            this._initPrototypes();
            this.initInternal();
            this._initReady();
        },
        //	_initDomObjects: function () {
        //		return;
        //		// we need to rework this, we cannot access private vars from a prototype
        //		if (doc == null) doc = this.root.document;
        //		if (doc && doc.documentElement) docElement = doc.documentElement;
        //	},
        _initEvents: function() {},
        _initPrototypes: function() {
            if (this.isWidget()) {
                Svidget.extend(Svidget.Root, Svidget.Root.WidgetPrototype, true);
            } else {
                Svidget.extend(Svidget.Root, Svidget.Root.PagePrototype, true);
            }
        },
        _initReady: function() {
            // is DOM loaded?
            // if not attach handler, if so call ready
            if (this.isDomReady()) {
                this.ready();
            } else {
                // add ready handler
                this.addReadyEvents();
            }
        },
        // protected: overriden in prototypes
        initInternal: function() {},
        ready: function() {
            // if widget create Widget class
            this.isReady = true;
            if (this.isWidget()) {
                this.readyWidget();
            } else {
                this.readyPage();
            }
        },
        getDocType: function() {
            // determine if in widget
            var localName = document.documentElement.localName;
            var namespaceUri = document.documentElement.namespaceURI;
            if (localName == "svg" && namespaceUri == Svidget.Namespaces.svg) return Svidget.DocType.svg;
            return Svidget.DocType.html;
        },
        isWidget: function() {
            this.docType = this.getDocType();
            return this.docType == Svidget.DocType.svg;
        },
        // ready if interactive or complete
        isDomReady: function() {
            // determine DOM loaded
            var rs = document.readyState;
            if (rs == null || !Svidget.DocReadyState[rs]) return false;
            return Svidget.DocReadyState[rs] >= Svidget.DocReadyState.interactive;
        },
        addReadyEvents: function() {
            // attach to: DOMContentLoaded, readystatechange, load
            // we attach at all 3 stages
            var handler = Svidget.wrap(this.readyHandler, this);
            Svidget.DOM.on(document, "DOMContentLoaded", handler);
            Svidget.DOM.on(document, "readystatechange", handler);
            Svidget.DOM.on(window, "load", handler);
        },
        readyHandler: function() {
            this.ensureReady();
        },
        ensureReady: function() {
            if (!this.isReady) this.ready();
            this.isReady = true;
        },
        // note: loaded state only applies to declared widgets ? (needs determiniation)
        // widgets loaded via svidget.load() 
        markLoaded: function() {
            if (this.getset("loaded") === true) return;
            this.getset("loaded", true);
            this.triggerLoaded();
        },
        eventContainer: function() {
            return this.getset("eventContainer");
        },
        on: function(type, data, name, handler) {
            this.eventContainer().on(type, data, name, handler);
        },
        off: function(type, handler) {
            this.eventContainer().off(type, handler);
        },
        // triggers the event, using the specified data as input
        trigger: function(name, value) {
            // call something on parent widget
            this.eventContainer().trigger(name, value);
        },
        // public
        // wires up a handler for the "load" event
        // note: this can happen before window.onload event
        // convention: use past tense (ie "loaded") as method name to present tense event name (ie "load")
        loaded: function(handler) {
            this.on("load", null, null, handler);
        },
        // public
        // wires up a handler for the "widgetload" event
        widgetloaded: function(widgetID, handler) {
            if (handler === undefined && Svidget.isFunction(widgetID)) {
                handler = widgetID;
                widgetID = null;
            }
            this.on("widgetload", widgetID, null, handler);
        },
        triggerLoaded: function() {
            this.trigger("load");
        },
        triggerWidgetLoaded: function(widgetID) {
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
        // virtual, overriden in root.widget
        current: function() {
            return null;
        },
        // todo: confirm we need
        connected: function(val) {
            var res = this.getset("connected", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            return true;
        }
    };
    Svidget.extend(Svidget.Root, Svidget.ObjectPrototype);
    // Events:
    // .on('load')
    // .on('widgetload')
    // core object
    //var svidget = new Svidget.Root(this);
    //})();
    //var doc = document;
    //var docele = document.documentElement;
    // can be embed a prototype object in object constructor and them assign prototype inside? hmmm
    // would innerPrototype methods be private? probably not
    //function MyObj() {
    //	var innerPrototype = {
    //		func1: function () {
    //			alert('func1');
    //		}
    //	}
    //	MyObj.prototype = innerPrototype;
    //};
    // Declare Util class
    Svidget.Util = {};
    // SUMMARY
    // Gets all the values from the query string and returns the result as an object.
    // PARAMS
    //  duplicates: if true group duplicates in an array (default == false)
    //  lastOneWins: if true then last duplicate encountered will win, else first one will win (default == false)
    // REMARKS
    // Adapted from SO answer: http://stackoverflow.com/a/2880929/242407
    Svidget.Util.queryString = function(duplicates, lastOneWins) {
        var match, pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g, decode = function(s) {
            return decodeURIComponent(s.replace(pl, " "));
        }, query = window.location.search.substring(1);
        var urlParams = {};
        while (match = search.exec(query)) {
            // index 1 and 2 because those are the subgroups in parens (), index 0 is the whole string match
            var name = decode(match[1]), value = decode(match[2]);
            var array;
            if (duplicates) {
                if (urlParams[name] !== undefined) {
                    if (Svidget.isArray(urlParams[name])) urlParams[name].push(value); else urlParams[name] = [ urlParams[name], value ];
                } else urlParams[name] = value;
            } else if (lastOneWins || urlParams[name] === undefined) urlParams[name] = value;
        }
        return urlParams;
    };
    Svidget.Action = function(name, options, parent) {
        this.__type = "Svidget.Action";
        // validate:
        // name is not null
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        // parent can only be a Widget
        var that = this;
        // private fields
        var privates = new function() {
            this.writable = [ "binding", "enabled", "external", "description" ];
            this.params = new Svidget.ActionParamCollection([], that);
            this.name = name;
            this.description = options.description;
            this.enabled = options.enabled !== false;
            this.binding = options.binding || null;
            this.external = options.external !== false;
            this.widget = parent;
            this.bindingFunc = null;
        }();
        // private accessors
        this.setup(privates);
        // todo: move to core or util
        this.buildBindingFunc = function(bind) {
            if (typeof bind === "function") {
                return bind;
            } else if (bind != null) {
                bind = bind + "";
                //coerce to string
                var func = Svidget.root[bind];
                if (func == null) return null;
                if (typeof func === "function") return func;
                // bind is an expression, so just wrap it in a function
                if (bind.substr(0, 7) != "return ") return new Function("return " + bind); else return new Function(bind);
            }
            return null;
        };
        // create bindingFunc from binding
        // binding can be string or function
        privates.bindingFunc = this.buildBindingFunc(privates.binding);
        // wire up event bubble parent
        //if (parent && parent.actionBubble) {
        //	for (var i = 0; i < Svidget.Action.eventTypes.length; i++) {
        //		this.setBubbleParent(Svidget.Action.eventTypes[i], Svidget.wrap(parent.actionBubble, parent));
        //	}
        //}
        this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionBubble);
        // add/remove event handlers for params
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);
    };
    Svidget.Action.prototype = {
        // name is immutable after creation
        name: function() {
            var res = this.getPrivate("name");
            return res;
        },
        // attached is a state property
        // gets whether the param is attached to the widget
        attached: function() {
            var widget = this.getset("widget");
            return this.widget != null && this.widget instanceof Svidget.Widget;
        },
        // in get mode: returns value
        // in set mode: returns true/false if set succeeded
        enabled: function(val) {
            var res = this.getset("enabled", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        external: function(val) {
            var res = this.getset("external", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "external",
                value: val
            });
            return true;
        },
        description: function(val) {
            var res = this.getset("description", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        binding: function(bind) {
            // todo: bind can be string or function, so check for both, enforce
            //bind = bind !== undefined ? bind + "" : undefined; // coerce to string
            var res = this.getset("binding", bind);
            // if undefined its a get so return value, if res is false then set failed
            if (bind === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "binding",
                value: val
            });
            return true;
        },
        bindingFunc: function() {
            var bind = this.binding();
            var func = this.buildBindingFunc(bind);
            return func;
        },
        // invocation
        invoke: function() {
            if (!this.enabled()) return false;
            var func = this.invocableBindingFunc();
            if (!func) return;
            var returnVal = func.apply(null, arguments);
            //Svidget.root, arguments);
            //var argObj = this.toArgumentObject(Svidget.array(arguments));
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
            if (func == null || typeof func !== "function") return null;
            return func;
        },
        // build an object based on the action params, and values from arguments on invoke
        toArgumentObject: function(args) {
            var argsObj = {};
            var col = this.params();
            for (var i = 0; i < args.length; i++) {
                if (i >= col.length) break;
                var p = col[i];
                argsObj[p.name()] = args[i];
            }
            return argsObj;
        },
        // select by index: params(0)
        // select by name: params("color")
        // return read-only collection: params()
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            //var item = this.params(selector).first();
            var col = this.getset("params");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // public
        addParam: function(name, options) {
            return this.params().add(name, options, this);
        },
        // public
        removeParam: function(name) {
            return this.params().remove(name);
        },
        paramBubble: function(type, event, param) {
            if (type == "change") this.paramChanged(param, event.value);
        },
        // handle param added
        paramChanged: function(param, eventValue) {
            Svidget.log("action: param changed: " + param.name());
            this.trigger("paramchange", eventValue, param);
        },
        // handle param added
        paramAdded: function(param) {
            Svidget.log("action: param added: " + param.name());
            this.trigger("paramadd", param);
        },
        // private
        // handle param removed
        paramRemoved: function(param) {
            Svidget.log("action: param removed: " + param.name());
            this.trigger("paramremove", param.name());
        },
        // helpers
        toTransport: function() {
            var transport = {
                name: this.name(),
                description: this.description(),
                external: this.external(),
                enabled: this.enabled(),
                //binding: this.binding(), 
                params: this.toParamsTransport()
            };
            return transport;
        },
        toParamsTransport: function() {
            var col = this.params();
            var ps = col.select(function(p) {
                return p.toTransport();
            }).toArray();
            return ps;
        },
        // overrides
        toString: function() {
            return '[Svidget.Action { name: "' + this.name + '" }]';
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
        var that = this;
        this.parent = parent;
    };
    Svidget.ActionCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionCollection, {
        create: function(name, options, parent) {
            // create action
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other action exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.Action(name, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    Svidget.ActionParam = function(name, options, parent) {
        this.__type = "Svidget.ActionParam";
        // validate:
        // name is not null
        options = options || {};
        // parent must be Action
        // todo: enforce
        // private fields
        var privates = new function() {
            this.writable = [ "type", "subtype", "description" ];
            this.name = name;
            this.type = options.type || "string";
            this.subtype = options.subtype || null;
            this.description = options.description;
            this.parent = parent;
        }();
        // private accessors
        this.setup(privates);
        // wire up event bubble parent
        this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramBubble);
    };
    Svidget.ActionParam.prototype = {
        toTransport: function() {
            var transport = {
                name: this.name(),
                type: this.type(),
                subtype: this.subtype(),
                description: this.description()
            };
            return transport;
        },
        // overrides
        toString: function() {
            return '[Svidget.ActionParam { name: "' + this.name + '" }]';
        }
    };
    Svidget.ActionParam.eventTypes = [ "change" ];
    Svidget.ActionParam.optionProperties = [ "type", "subtype", "description" ];
    Svidget.ActionParam.allProxyProperties = [ "name", "type", "subtype", "description" ];
    Svidget.ActionParam.writableProxyProperties = [];
    Svidget.extend(Svidget.ActionParam, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.ActionParam, Svidget.ParamPrototype);
    Svidget.extend(Svidget.ActionParam, new Svidget.EventPrototype(Svidget.ActionParam.eventTypes));
    Svidget.ActionParamCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionParam ]);
        this.__type = "Svidget.ActionParamCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.ActionParamCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionParamCollection, {
        create: function(name, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other action exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.ActionParam(name, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    // todo: rename to CustomEvent? no
    Svidget.EventDesc = function(name, options, parent) {
        this.__type = "Svidget.EventDesc";
        // validate:
        // name is not null
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        // parent can only be a Widget
        var that = this;
        // private fields
        var privates = new function() {
            this.writable = [ "description", "enabled", "external" ];
            this.name = name;
            this.description = options.description;
            this.external = options.external !== false;
            this.enabled = options.enabled !== false;
            this.eventName = "trigger";
            // this is the internal name we use for the event
            this.eventContainer = new Svidget.EventContainer([ this.eventName ], that);
        }();
        // private accessors
        this.setup(privates);
        // wire up event bubble parent
        privates.eventContainer.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventBubble);
    };
    Svidget.EventDesc.prototype = {
        // name is immutable after creation
        name: function() {
            var res = this.getPrivate("name");
            return res;
        },
        // attached is a state property
        // gets whether the param is attached to the widget
        attached: function() {
            var widget = this.getset("widget");
            return this.widget != null && this.widget instanceof Svidget.Widget;
        },
        // in get mode: returns value
        // in set mode: returns true/false if set succeeded
        enabled: function(val) {
            var res = this.getset("enabled", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        description: function(val) {
            var res = this.getset("description", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "description",
                value: val
            });
            return true;
        },
        // when true, allows outside access to trigger the event, default is false
        external: function(val) {
            var res = this.getset("external", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "public",
                value: val
            });
            return true;
        },
        // actionables
        // private: used internally for a default event name for the container
        eventName: function() {
            return this.getPrivate("eventName");
        },
        eventContainer: function() {
            return this.getset("eventContainer");
        },
        // type, data, name, handler
        // type, data, handler
        // type, handler
        on: function(type, data, name, handler) {
            // if type is function, then assume type not passes so use default event name
            if (Svidget.isFunction(type)) {
                handler = type;
                type = this.eventName();
            }
            this.eventContainer().on(type, data, name, handler);
        },
        // todo: deprecate and use on(), adapt args
        // data, name, handler
        // data, handler
        // handler
        onTrigger: function(data, name, handler) {
            this.eventContainer().on(this.eventName(), data, name, handler);
        },
        off: function(type, handlerOrName) {
            // if type is function, then assume type not passes so use default event name
            if (Svidget.isFunction(type)) {
                handlerOrName = type;
                type = this.eventName();
            }
            this.eventContainer().off(type, handlerOrName);
        },
        // todo: deprecate and use off(), adapt args
        offTrigger: function(handlerOrName) {
            this.eventContainer().off(this.eventName(), handlerOrName);
        },
        // triggers the event, using the specified data as input
        trigger: function(type, value) {
            if (!this.enabled()) return;
            if (value === undefined) {
                value = type;
                type = this.eventName();
            }
            this.eventContainer().trigger(type, value);
        },
        triggerEvent: function(value) {
            this.trigger(this.eventName(), value);
        },
        // helpers
        toTransport: function() {
            var transport = {
                name: this.name(),
                description: this.description(),
                external: this.external(),
                enabled: this.enabled()
            };
            return transport;
        },
        // overrides
        toString: function() {
            return '[Svidget.EventDesc { name: "' + this.name + '" }]';
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
        var that = this;
        this.parent = parent;
    };
    Svidget.EventDescCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.EventDescCollection, {
        create: function(name, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other action exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.EventDesc(name, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    Svidget.Param = function(name, value, options, parent) {
        this.__type = "Svidget.Param";
        // validate:
        // name is not null
        options = options || {};
        parent = parent instanceof Svidget.Widget ? parent : null;
        // parent can only be a Widget
        // private fields
        var privates = new function() {
            this.writable = [ "binding", "enabled", "type", "subtype", "value", "description" ];
            this.name = name;
            this.shortname = options.shortname;
            this.description = options.description;
            this.enabled = options.enabled !== false;
            this.type = options.type || "string";
            this.subtype = options.subtype || null;
            this.value = value;
            this.widget = parent;
            this.binding = options.binding || null;
            this.bindingQuery = null;
        }();
        // private accessors
        this.setup(privates);
        // target or binding
        privates.bindingQuery = Svidget.DOM.select(privates.binding);
        this.valuePopulated = false;
        // flipped to true once a value has been assigned or the default value is applied
        //this.isProxy;
        // maybe we do need a separate ParameterProxy class
        // wire up event bubble parent
        this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramBubble);
    };
    Svidget.Param.prototype = {
        // moved to ParamPrototype
        // name is immutable after creation
        //	name: function () {
        //		var res = this.getPrivate("name");
        //		return res;
        //	},
        //	type: function (val) {
        //		var res = this.getset("type", val, this.validateType);
        //		// if undefined its a get so return value, if res is false then set failed
        //		if (val === undefined || !!!res) return res;
        //		// fire "changed" event
        //		this.trigger("changed", { property: "type" });
        //		return true;
        //	},
        //	subtype: function (val) {
        //		var res = this.getset("subtype", val, this.validateSubtype);
        //		// if undefined its a get so return value, if res is false then set failed
        //		if (val === undefined || !!!res) return res;
        //		// fire "changed" event
        //		this.trigger("changed", { property: "subtype" });
        //		return true;
        //	},
        // name is immutable after creation
        shortname: function() {
            var res = this.getPrivate("shortname");
            return res;
        },
        // attached is a state property
        // gets whether the param is attached to the widget
        attached: function() {
            var widget = this.getset("widget");
            return this.widget != null && this.widget instanceof Svidget.Widget;
        },
        // in get mode: returns value
        // in set mode: returns true/false if set succeeded
        enabled: function(val) {
            var res = this.getset("enabled", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire "changed" event
            this.trigger("change", {
                property: "enabled",
                value: val
            });
            return true;
        },
        value: function(val) {
            var res = this.getset("value", val, this.validateValue);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // check enabled
            if (!this.enabled()) return false;
            // todo: validate val using param.validate
            // apply to binding
            this.applyBinding(val);
            // fire "valuechange" event
            this.trigger("valuechange", {
                value: val
            });
            return true;
        },
        binding: function(bind) {
            bind = bind !== undefined ? bind + "" : undefined;
            // coerce to string
            var res = this.getset("binding", bind);
            // if undefined its a get so return value, if res is false then set failed
            if (bind === undefined || !!!res) return res;
            // todo: construct bindingQuery object
            this.getset("bindingQuery", Svidget.DOM.select(bind));
            // fire "changed" event
            this.trigger("change", {
                property: "binding",
                value: bind
            });
            return true;
        },
        bindingQuery: function() {
            return this.getset("bindingQuery");
        },
        //	validateType: function (t) {
        //		if (!typeof t === "string") return false;
        //		return (Svidget.ParamTypes[t] != undefined);
        //	},
        //	validateSubtype: function (t) {
        //		if (!typeof t === "string") return false;
        //		return (Svidget.ParamSubTypes[t] != undefined);
        //	},
        validateValue: function(val) {
            return true;
        },
        // helpers
        applyBinding: function(val) {
            var bind = this.bindingQuery();
            if (bind == null) return;
            bind.setValue(val);
        },
        toTransport: function() {
            var transport = {
                name: this.name(),
                shortname: this.shortname(),
                enabled: this.enabled(),
                type: this.type(),
                subtype: this.subtype(),
                value: this.value(),
                binding: this.binding()
            };
            return transport;
        },
        // overrides
        toString: function() {
            return '[Svidget.Param { name: "' + this.name + '" }]';
        }
    };
    // todo: convert these to functions so that users can't manipulate
    Svidget.Param.eventTypes = [ "valuechange", "change" ];
    Svidget.Param.optionProperties = [ "type", "subtype", "binding", "enabled", "shortname" ];
    Svidget.Param.allProxyProperties = [ "name", "value", "type", "subtype", "binding", "enabled", "shortname" ];
    Svidget.Param.writableProxyProperties = [ "value" ];
    Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
    Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));
    Svidget.ParamCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.Param ]);
        this.__type = "Svidget.ParamCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.ParamCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ParamCollection, {
        create: function(name, value, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other parameter exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.Param(name, value, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    // note: Widget class should be decoupled from the DOM
    Svidget.Widget = function() {
        this.__type = "Svidget.Widget";
        var that = this;
        // privates
        var privates = new function() {
            this.writable = [ "id", "enabled", "started", "connected" ];
            this.params = new Svidget.ParamCollection([], that);
            this.actions = new Svidget.ActionCollection([], that);
            this.events = new Svidget.EventDescCollection([], that);
            this.enabled = true;
            // reserved for future use
            this.connected = false;
            this.started = false;
            this.id = null;
            // provided by parent
            this.page = null;
            // todo: get a reference to an object containing details about the page (determine if we need)
            this.parentElement = null;
        }();
        // private accessors
        this.setup(privates);
        // this.started = false;
        // this.loaded = false;
        // this.standalone = false;
        // this.paramValues = null;
        // wire events for params add/remove and bubbles
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);
        // wire events for actions add/remove and bubbles
        this.wireCollectionAddRemoveHandlers(privates.actions, that.actionAdded, that.actionRemoved);
        // wire events for events add/remove
        this.wireCollectionAddRemoveHandlers(privates.events, that.eventAdded, that.eventRemoved);
        this._init();
    };
    Svidget.Widget.prototype = {
        _init: function() {},
        start: function() {
            // if DOM not ready then readyConnected(0 will be called when ready()
            //if (this.loaded) this.readyConnected();
            this.getset("started", true);
        },
        connect: function(id) {
            // if DOM not ready then readyConnected(0 will be called when ready()
            //if (this.loaded) this.readyConnected();
            if (this.connected()) return;
            this.getset("id", id);
            this.getset("connected", true);
        },
        // REGION: Parent
        // internal
        // called from the root to signal that the parent element has changed, so we update there
        updateParentElement: function(item) {},
        // REGION: Params
        // select by index: params(0)
        // select by name: params("color")
        // return read-only collection: params()
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            //var item = this.params(selector).first();
            var col = this.getset("params");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // public
        addParam: function(nameOrObject, value, options) {
            return this.params().add(nameOrObject, value, options, this);
        },
        // public
        removeParam: function(name) {
            return this.params().remove(name);
        },
        // handle param added
        paramAdded: function(param) {
            // raise event
            //alert('param added');
            Svidget.log("widget: param added: " + param.name());
            // event.value = param
            this.trigger("paramadd", param);
            // signal parent
            svidget.signalParamAdded(param);
        },
        // private
        // handle param removed
        paramRemoved: function(param) {
            // raise event
            //alert('param removed');
            Svidget.log("widget: param removed: " + param.name());
            // event.value = param.name
            this.trigger("paramremove", param.name());
            // signal parent
            svidget.signalParamRemoved(param.name());
        },
        // internal, called from param
        paramBubble: function(type, event, param) {
            if (type == "change") this.paramChanged(param, event.value);
            if (type == "valuechange") this.paramValueChanged(param, event.value);
        },
        // private
        // eventValue ex = { property: "binding", value: bindValue }
        paramChanged: function(param, eventValue) {
            this.trigger("paramchange", eventValue, param);
            // signal parent
            svidget.signalParamChanged(param, eventValue);
        },
        // private
        // eventValue ex = { value: "3" }
        paramValueChanged: function(param, eventValue) {
            this.trigger("paramvaluechange", eventValue, param);
            // signal parent
            svidget.signalParamValueChanged(param, eventValue);
        },
        // REGION: Actions
        // public
        // select by index: params(0)
        // select by name: params("color")
        // return read-only collection: params()
        actions: function(selector) {
            var col = this.getset("actions");
            return this.select(col, selector);
        },
        action: function(selector) {
            //var item = this.actions(selector).first();
            var col = this.getset("actions");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // public
        addAction: function(nameOrObject, options) {
            var action = this.actions().add(nameOrObject, options, this);
            if (action == null) return action;
            // add params
            // options.params
            if (options == null || options.params == null || !Svidget.isArray(options.params)) return action;
            for (var i = 0; i < options.params.length; i++) {
                var p = options.params[i];
                if (p != null && p.name != null) {
                    action.addParam(p.name, p);
                }
            }
        },
        // public
        removeAction: function(name) {
            return this.actions().remove(name);
        },
        // private
        // handle action added
        actionAdded: function(action) {
            Svidget.log("widget: action added: " + action.name());
            // trigger event
            // event.value = action
            this.trigger("actionadd", action);
            // signal parent
            svidget.signalActionAdded(action);
        },
        // private
        // handle action removed
        actionRemoved: function(action) {
            Svidget.log("widget: action removed: " + action.name());
            // trigger event
            // event.value = action.name
            this.trigger("actionremove", action.name());
            // signal parent
            svidget.signalActionRemoved(action.name());
        },
        // private
        // internal, called from action
        actionBubble: function(type, event, action) {
            if (type == "invoke") this.actionInvoked(action, event.value);
            if (type == "change") this.actionChanged(action, event.value);
            // event.target is actionParam that was changed
            if (type == "paramchange") this.actionParamChanged(action, event.target, event.value);
            // for add/remove, event.value == actionParam added or removed
            if (type == "paramadd") this.actionParamAdded(action, event.value);
            if (type == "paramremove") this.actionParamRemoved(action, event.value);
        },
        // private
        actionInvoked: function(action, returnData) {
            this.trigger("actioninvoke", returnData, action);
            // signal parent
            svidget.signalActionInvoked(action, returnData);
        },
        // private
        // eventValue ex = { property: "binding", value: bindValue }
        actionChanged: function(action, eventValue) {
            this.trigger("actionchange", eventValue, action);
            // signal parent
            svidget.signalActionChanged(action, eventValue);
        },
        // private
        actionParamChanged: function(action, actionParam, eventValue) {
            this.trigger("actionparamchange", eventValue, actionParam);
            // signal parent
            svidget.signalActionParamChanged(actionParam, action, eventValue);
        },
        // private
        actionParamAdded: function(action, actionParam) {
            this.trigger("actionparamadd", actionParam, action);
            // signal parent
            svidget.signalActionParamAdded(actionParam, action.name());
        },
        // private
        actionParamRemoved: function(action, actionParamName) {
            this.trigger("actionparamremove", actionParamName, action);
            // signal parent
            svidget.signalActionParamRemoved(actionParamName, action.name());
        },
        // REGION: Events 
        // public
        // select by index: events(0)
        // select by name: events("color")
        // return read-only collection: events()
        events: function(selector) {
            var col = this.getset("events");
            return this.select(col, selector);
        },
        event: function(selector) {
            var col = this.getset("events");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // public
        addEvent: function(nameOrObject, options) {
            return this.events().add(nameOrObject, options, this);
        },
        // public
        removeEvent: function(name) {
            return this.events().remove(name);
        },
        // private
        // handle event added
        eventAdded: function(eventDesc) {
            Svidget.log("widget: event added: " + eventDesc.name());
            // trigger event
            // event.value = event
            this.trigger("eventadd", eventDesc);
            // signal parent
            svidget.signalEventAdded(eventDesc);
        },
        // private
        // handle event removed
        eventRemoved: function(eventDesc) {
            Svidget.log("widget: event removed: " + eventDesc.name());
            // trigger event
            // event.value = event name
            this.trigger("eventremove", eventDesc.name());
            // signal parent
            svidget.signalEventRemoved(eventDesc.name());
        },
        // internal, called from eventdesc.EventPrototype
        eventBubble: function(type, event, eventDesc) {
            if (type == "trigger") this.eventTrigger(eventDesc, event);
            if (type == "change") this.eventChanged(eventDesc, event.value);
        },
        // private
        eventTrigger: function(eventDesc, event) {
            Svidget.log("widget: event trigger: " + eventDesc.name());
            this.trigger("eventtrigger", event.value, eventDesc);
            // FYI: event.target == eventDesc
            svidget.signalEventTriggered(event.target, event.value);
        },
        // private
        eventChanged: function(eventDesc, eventValue) {
            this.trigger("eventchange", eventValue, eventDesc);
            // signal parent
            svidget.signalEventChanged(eventDesc, eventValue);
        },
        //bubbleFuncs: function (objectType) {
        //	if (objectType == "param") return this.paramBubble;
        //	if (objectType == "action") return this.actionBubble;
        //	if (objectType == "event") return this.eventBubble;
        //	return null;
        //},
        // REGION: Properties
        id: function() {
            return this.getset("id");
        },
        enabled: function() {
            return this.getset("enabled");
        },
        connected: function() {
            return this.getset("connected");
        },
        started: function() {
            var val = this.getset("started");
            return val;
        },
        // REGION: Communication
        // todo: rename to serialize()
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
            var col = this.params();
            var ps = col.select(function(p) {
                return p.toTransport();
            }).toArray();
            return ps;
        },
        toActionsTransport: function() {
            var col = this.actions();
            var acs = col.select(function(a) {
                return a.toTransport();
            }).toArray();
            return acs;
        },
        toEventsTransport: function() {
            var col = this.events();
            var evs = col.select(function(e) {
                return e.toTransport();
            }).toArray();
            return evs;
        }
    };
    // todo: wrap in closure to prevent tampering
    Svidget.Widget.eventTypes = [ "paramvaluechange", "paramchange", "paramadd", "paramremove", "actioninvoke", "actionchange", "actionadd", "actionremove", "eventtrigger", "eventadd", "eventremove" ];
    Svidget.extend(Svidget.Widget, Svidget.ObjectPrototype);
    Svidget.extend(Svidget.Widget, new Svidget.EventPrototype(Svidget.Widget.eventTypes));
    Svidget.Proxy = function(parent, valueObj, propList, writePropList, eventList) {
        this.__type = "Svidget.Proxy";
        var that = this;
        valueObj = valueObj || {};
        // convert to collections
        var propCol = new Svidget.Collection(Svidget.isArray(propList) ? propList : null);
        var writePropCol = new Svidget.Collection(Svidget.isArray(writePropList) ? writePropList : null);
        // filter so that writable properties are also contained in all properties
        writePropCol = writePropCol.where(function(i) {
            return propCol.contains(i);
        });
        // private fields
        var privates = {
            writable: writePropCol.toArray(),
            propertyChangeFuncs: new Svidget.Collection(),
            eventContainer: new Svidget.EventContainer(eventList, that),
            parent: parent,
            connected: valueObj.connected == null ? true : !!valueObj.connected
        };
        // private accessors
        this.setup(privates);
        // copy property values to privates
        for (var p in valueObj) {
            if (privates[p] === undefined) {
                privates[p] = valueObj[p];
            }
        }
        // load functions for each property onto this object
        for (var i = 0; i < propCol.length; i++) {
            var prop = propCol[i] + "";
            if (prop.length > 0) {
                this[prop] = buildPropFunc(prop);
            }
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
        propertyChangeFuncs: function() {
            return this.getPrivate("propertyChangeFuncs");
        },
        // gets whether the proxy is connected to its underlying widget counterpart
        connected: function(val) {
            return this.getPrivate("connected");
        },
        // private
        // this is invoked when attempting to set a property value on the proxy itself
        // this in turn notifies the parent, which in turn notifies the widget
        getsetProp: function(prop, val) {
            var res = this.getset(prop, val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            // fire propertyChange event
            // this.triggerPropertyChange(prop, val); // obsolete
            this.handlePropertyChange(prop, val);
            return true;
        },
        handlePropertyChange: function(name, val) {},
        triggerPropertyChange: function(name, val) {
            // notifies root that property change, sends it to widget
            // invoke func(this, name, val)
            var funcList = this.propertyChangeFuncs();
            var that = this;
            funcList.each(function(func) {
                func(that, name, val);
            });
        },
        // private
        // this is invoked when the widget communicates that a property was changed
        notifyPropertyChange: function(name, val) {
            // notifies this proxy that property changed on widget
            if (name == null) return;
            // update value to match source
            this.getset(name, val);
            // trigger change event
            this.triggerFromWidget("change", {
                property: name,
                value: val
            }, this);
        },
        // internal
        // refreshes the proxy object with values from the widget
        refreshProperties: function(propObj) {
            for (var name in propObj) {
                var item = this.getPrivate(name);
                if (item != null) {
                    this.setPrivate(name, propObj[name]);
                }
            }
        },
        // sets the proxy object as connected to the widget
        connect: function() {
            this.setPrivate("connected", true);
        },
        // obsolete (9/1/2014)
        // use regular events ("change", "paramchange")
        onPropertyChange: function(func) {
            var funcList = this.propertyChangeFuncs();
            if (!typeof func === "function") return false;
            funcList.add(func);
            return true;
        },
        // obsolete (9/1/2014)
        // use regular events ("change", "paramchange")
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
        // Note: no access to trigger() object events here, only from widget
        // this is invoked from the widget to signal that the event was triggered
        triggerFromWidget: function(type, value, originalTarget) {
            this.eventContainer().trigger(type, value, originalTarget);
        },
        registerBubbleCallback: function(types, bubbleTarget, callback) {
            this.eventContainer().registerBubbleCallback(types, bubbleTarget, callback);
        }
    };
    Svidget.extend(Svidget.Proxy, Svidget.ObjectPrototype);
    Svidget.ActionProxy = function(name, options, parent) {
        var that = this;
        var valueObj = {
            name: name,
            params: new Svidget.ActionParamProxyCollection([], that)
        };
        options = options || {};
        // copy property values to privates
        for (var p in options) {
            if (valueObj[p] === undefined) valueObj[p] = options[p];
        }
        if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null;
        // parent can only be a WidgetReference
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.Action.allProxyProperties, Svidget.Action.writableProxyProperties ]);
        this.__type = "Svidget.ActionProxy";
        // register callback from action to widget, for event bubbles
        this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionProxyBubble);
        // add/remove event handlers for params
        this.wireCollectionAddRemoveHandlers(valueObj.params, that.paramAdded, that.paramRemoved);
    };
    Svidget.ActionProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ActionProxy, {
        invoke: function() {
            // build args obj from arguments
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
        // action params
        // select by index: params(0)
        // select by name: params("color")
        // return read-only collection: params()
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // internal
        addParam: function(nameOrObject, options) {
            return this.params().add(nameOrObject, options, this);
        },
        // internal
        removeParam: function(name) {
            return this.params().remove(name);
        },
        paramProxyBubble: function(type, event, param) {
            if (type == "change") this.paramChanged(param, event.value);
        },
        // private
        // eventValue ex = { property: "binding" }
        paramChanged: function(param, eventValue) {
            this.triggerFromWidget("paramchange", eventValue, param);
        },
        // handle param added
        paramAdded: function(param) {
            this.triggerFromWidget("paramadd", param);
        },
        // private
        // handle param removed
        paramRemoved: function(param) {
            this.triggerFromWidget("paramremove", param.name());
        },
        toString: function() {
            return '[Svidget.ActionProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.ActionProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionProxy ]);
        this.__type = "Svidget.ActionProxyCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.ActionProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionProxyCollection, {
        create: function(name, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other action exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.ActionProxy(name, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    // for settable properties:
    // - notify root of property change
    // - root communicates change to widget
    // - widget communicates success or failure
    //   - if success, widget triggers event
    //   - if fail, root calls fail function with current value, object restores value
    Svidget.ActionParamProxy = function(name, options, parent) {
        var that = this;
        var valueObj = {
            name: name
        };
        options = options || {};
        // copy property values to privates
        for (var p in options) {
            if (valueObj[p] === undefined) valueObj[p] = options[p];
        }
        if (parent) parent = parent instanceof Svidget.ActionProxy ? parent : null;
        // parent can only be a WidgetReference
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.ActionParam.allProxyProperties, Svidget.ActionParam.writableProxyProperties ]);
        this.__type = "Svidget.ActionParamProxy";
        // register callback from action to widget, for event bubbles
        this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramProxyBubble);
    };
    Svidget.ActionParamProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ActionParamProxy, {
        toString: function() {
            return '[Svidget.ActionParamProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.ActionParamProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ActionParamProxy ]);
        this.__type = "Svidget.ActionParamProxyCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.ActionParamProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ActionParamProxyCollection, {
        create: function(name, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other action exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.ActionParamProxy(name, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    // for settable properties:
    // - notify root of property change
    // - root communicates change to widget
    // - widget communicates success or failure
    //   - if success, widget triggers event
    //   - if fail, root calls fail function with current value, object restores value
    Svidget.EventDescProxy = function(name, options, parent) {
        var eventName = "trigger";
        var that = this;
        var valueObj = {
            name: name,
            eventName: eventName
        };
        options = options || {};
        // copy property values to privates
        for (var p in options) {
            if (valueObj[p] === undefined) valueObj[p] = options[p];
        }
        if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null;
        // parent can only be a WidgetReference
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.EventDesc.allProxyProperties, Svidget.EventDesc.writableProxyProperties ]);
        this.__type = "Svidget.EventDescProxy";
        // register callback from action to widget, for event bubbles
        this.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventProxyBubble);
    };
    Svidget.EventDescProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.EventDescProxy, {
        triggerEventName: function() {
            return this.getPrivate("eventName");
        },
        // overwrites: Svidget.Proxy.on
        on: function(type, data, name, handler) {
            // if type is function, then assume type not passes so use default event name
            if (Svidget.isFunction(type)) {
                handler = type;
                type = this.triggerEventName();
            }
            this.eventContainer().on(type, data, name, handler);
        },
        // todo: rename to on() adapt args
        // data, name, handler
        // data, handler
        // handler
        onTrigger: function(data, name, handler) {
            this.eventContainer().on(this.triggerEventName(), data, name, handler);
        },
        // overwrites: Svidget.Proxy.off
        off: function(type, handlerOrName) {
            // if type is function, then assume type not passes so use default event name
            if (Svidget.isFunction(type)) {
                handlerOrName = type;
                type = this.triggerEventName();
            }
            this.eventContainer().off(type, handlerOrName);
        },
        // todo: rename to off() adapt args
        offTrigger: function(handlerOrName) {
            this.eventContainer().off(this.triggerEventName(), handlerOrName);
        },
        // this is called at page level, to trigger the event (if external) on the widget
        trigger: function(value) {
            // generally an event wouldn't be triggerable from outside, but we leave in the ability for testing purposes
            if (!this.canTrigger()) return false;
            svidget.signalEventTrigger(this.parent(), this, value);
            return true;
        },
        canTrigger: function() {
            return this.getset("external");
        },
        // overwrites: Svidget.Proxy.triggerFromWidget
        // this is invoked from the widget to signal that the event was triggered
        triggerEventFromWidget: function(value) {
            this.eventContainer().trigger(this.triggerEventName(), value);
        },
        // overrides
        toString: function() {
            return '[Svidget.EventDescProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.EventDescProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.EventDescProxy ]);
        this.__type = "Svidget.EventDescProxyCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.EventDescProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.EventDescProxyCollection, {
        create: function(name, options, parent) {
            if (name == null || !typeof name === "string") return null;
            // ensure no other parameter exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.EventDescProxy(name, options, parent);
            return obj;
        }
    }, true);
    // for settable properties:
    // - notify root of property change
    // - root communicates change to widget
    // - widget communicates success or failure
    //   - if success, widget triggers event
    //   - if fail, root calls fail function with current value, object restores value
    Svidget.ParamProxy = function(name, value, options, parent) {
        var valueObj = {
            name: name,
            value: value
        };
        options = options || {};
        // copy property values to privates
        for (var p in options) {
            valueObj[p] = options[p];
        }
        if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null;
        // parent can only be a WidgetReference
        Svidget.Proxy.apply(this, [ parent, valueObj, Svidget.Param.allProxyProperties, Svidget.Param.writableProxyProperties ]);
        this.__type = "Svidget.ParamProxy";
        // register callback from action to widget, for event bubbles
        this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramProxyBubble);
    };
    Svidget.ParamProxy.prototype = new Svidget.Proxy();
    Svidget.extend(Svidget.ParamProxy, {
        // overrides
        handlePropertyChange: function(name, val) {
            if (name == "value") {
                svidget.signalPropertyChange(this.parent(), this, "param", name, val);
            }
        },
        // private
        // this is invoked when the widget communicates that a property was changed
        notifyValueChange: function(val) {
            // notifies this proxy that property changed on widget
            // update value to match source
            this.getset("value", val);
            // trigger change event
            this.triggerFromWidget("valuechange", {
                value: val
            }, this);
        },
        toString: function() {
            return '[Svidget.ParamProxy { name: "' + this.name + '" }]';
        }
    }, true);
    Svidget.ParamProxyCollection = function(array, parent) {
        Svidget.ObjectCollection.apply(this, [ array, Svidget.ParamProxy ]);
        this.__type = "Svidget.ParamProxyCollection";
        var that = this;
        this.parent = parent;
    };
    Svidget.ParamProxyCollection.prototype = new Svidget.ObjectCollection();
    Svidget.extend(Svidget.ParamProxyCollection, {
        create: function(name, value, options, parent) {
            // create param
            // call addObject
            if (name == null || !typeof name === "string") return null;
            // ensure no other parameter exists in the collection by that name
            if (this.getByName(name) != null) return null;
            // create obj
            var obj = new Svidget.ParamProxy(name, value, options, parent);
            //this.push(obj);
            return obj;
        }
    }, true);
    // note: when param/action added/removed (even on initialize)
    // widget fires event, bubbles to page root
    // page root adds/removes param on this object
    Svidget.WidgetReference = function(id, paramValueObj, declaringElement, element, connected, crossdomain) {
        this.__type = "Svidget.WidgetReference";
        var that = this;
        // privates
        var privates = new function() {
            this.writable = [ "enabled", "started", "populated" ];
            this.params = new Svidget.ParamProxyCollection([], that);
            this.actions = new Svidget.ActionProxyCollection([], that);
            this.events = new Svidget.EventDescProxyCollection([], that);
            this.eventContainer = new Svidget.EventContainer(Svidget.Widget.eventTypes, that);
            this.paramValues = paramValueObj;
            this.enabled = true;
            this.started = false;
            this.populated = false;
            this.connected = !!connected;
            // whether widget is connected/disconnected
            this.crossdomain = !!crossdomain;
            // whether widget in forced crossdomain mode
            this.state = "declared";
            this.id = id;
            this.element = element;
            this.declaringElement = declaringElement;
            this.url = declaringElement.getAttribute("data");
        }();
        // private accessors
        this.setup(privates);
        this.setElement = function(ele) {
            if (privates.element != null) return false;
            if (!Svidget.DOM.isElement(ele)) return false;
            privates.element = ele;
            // self-destructing set accessor, todo: delete too?
            this.setElement = null;
        }, // initialize params from <object> tag on page, these will be replaced when the widget updates the values and sends them back to the page
        initParamsFromObject.call(that, paramValueObj);
        // set an instance to this on declaring element
        declaringElement.widgetReference = this;
        // wire events for params add/remove and bubbles
        this.wireCollectionAddRemoveHandlers(privates.params, that.paramProxyAdded, that.paramProxyRemoved);
        // wire events for actions add/remove and bubbles
        this.wireCollectionAddRemoveHandlers(privates.actions, that.actionProxyAdded, that.actionProxyRemoved);
        // wire events for events add/remove
        this.wireCollectionAddRemoveHandlers(privates.events, that.eventProxyAdded, that.eventProxyRemoved);
        function initParamsFromObject(paramValueObj) {
            if (paramValueObj == null) return;
            for (var name in paramValueObj) {
                this.addParamProxy(name, paramValueObj[name], {
                    connected: false
                });
            }
        }
    };
    Svidget.WidgetReference.prototype = {
        id: function() {
            var id = this.getset("id");
            return id;
        },
        name: function() {
            return this.id();
        },
        // should this be settable from the page?
        enabled: function(val) {
            var enabled = this.getset("enabled");
            return enabled;
        },
        url: function() {
            var url = this.getset("url");
            return url;
        },
        // RETURNS
        // The underlying HTML DOM element (either <object> or <iframe>) for this widget reference.
        element: function() {
            var ele = this.getset("element");
            return ele;
        },
        // RETURNS
        // The original HTML DOM <object> element used to declare this widget reference. Optional, null if declared programatically.
        declaringElement: function() {
            var ele = this.getset("declaringElement");
            return ele;
        },
        root: function() {
            // gets access to widget's root object, if same domain
            if (this.isCrossDomain()) {
                return null;
            }
            var doc = this.document();
            var win = doc.parentWindow || doc.defaultView;
            //var f = window.frames[0];
            // ele = this.element();
            //var s = win.$getSvidget();
            // note: is some browsers, this may not be available until its DOM is loaded
            return win.svidget;
        },
        window: function() {
            // gets access to widget's window object, if different domain
            var ele = this.element();
            if (ele == null) return null;
            // note: only FF supports <object>.contentWindow
            // ele is usually a <iframe>
            return ele.contentWindow;
        },
        // gets a reference to the widget DOM document, if cross domain will return null
        document: function() {
            var ele = this.element();
            return Svidget.DOM.getDocument(ele);
        },
        // gets whether the widget reference is connected to its underlying widget
        // if false, then the widget is cut off from the page
        connected: function(val) {
            var res = this.getset("connected", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            return true;
        },
        // gets the crossdomain flag
        crossdomain: function(val) {
            var res = this.getset("crossdomain", val);
            // if undefined its a get so return value, if res is false then set failed
            if (val === undefined || !!!res) return res;
            return true;
        },
        // RETURNS
        // A collection of ParamProxy objects.
        params: function(selector) {
            var col = this.getset("params");
            return this.select(col, selector);
        },
        param: function(selector) {
            var col = this.getset("params");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // RETURNS
        // A collection of ActionProxy objects.
        actions: function(selector) {
            var col = this.getset("actions");
            return this.select(col, selector);
        },
        action: function(selector) {
            //var item = this.actions(selector).first();
            var col = this.getset("actions");
            var item = this.selectFirst(col, selector);
            return item;
        },
        // RETURNS
        // A collection of EventDesc objects.
        events: function(selector) {
            var col = this.getset("events");
            return this.select(col, selector);
        },
        // public
        // Returns the first item indicated by selector
        event: function(selector) {
            var col = this.getset("events");
            var item = this.selectFirst(col, selector);
            return item;
        },
        paramValues: function() {
            var val = this.getset("paramValues");
            return val;
        },
        // internal
        addParamProxy: function(nameOrObject, value, options) {
            return this.params().add(nameOrObject, value, options, this);
        },
        // internal
        removeParamProxy: function(name) {
            return this.params().remove(name);
        },
        // internal
        // adds or updates the param proxy
        refreshParamProxy: function(name, value, options) {
            var p = this.param(name);
            if (p == null) return this.params().add(nameOrObject, value, options, this); else {
                p.refreshProperties(options);
                return p;
            }
        },
        // internal
        // handle param added
        paramProxyAdded: function(param) {
            // raise event
            //alert('param added');
            Svidget.log("page: param proxy added: " + param.name());
            // trigger event
            this.triggerFromWidget("paramadd", param);
        },
        // internal
        // handle param removed
        paramProxyRemoved: function(param) {
            // raise event
            //alert('param removed');
            Svidget.log("page: param proxy removed: " + param.name());
            // trigger event
            this.triggerFromWidget("paramremove", param.name());
        },
        paramProxyBubble: function(type, event, param) {
            Svidget.log("page: param proxy bubble: " + param.name());
            if (type == "change") this.paramProxyChanged(param, event.value);
            if (type == "valuechange") this.paramProxyValueChanged(param, event.value);
        },
        // private
        // eventValue ex = { property: "binding", value: bindValue }
        paramProxyChanged: function(param, eventValue) {
            Svidget.log("page: param proxy change: " + param.name());
            this.triggerFromWidget("paramchange", eventValue, param);
        },
        // private
        // eventValue ex = { value: "3" }
        paramProxyValueChanged: function(param, eventValue) {
            Svidget.log("page: param proxy value change: " + param.name());
            this.triggerFromWidget("paramvaluechange", eventValue, param);
        },
        // internal
        addActionProxy: function(nameOrObject, options) {
            return this.actions().add(nameOrObject, options, this);
        },
        // internal
        removeActionProxy: function(name) {
            return this.actions().remove(name);
        },
        // internal
        // handle param added
        actionProxyAdded: function(action) {
            // raise event
            Svidget.log("page: action proxy added: " + action.name());
            // trigger event
            this.triggerFromWidget("actionadd", action);
        },
        // internal
        // handle param removed
        actionProxyRemoved: function(action) {
            Svidget.log("page: action proxy removed: " + action.name());
            // trigger event
            this.triggerFromWidget("actionremove", action.name());
        },
        // private
        // internal, called from action
        actionProxyBubble: function(type, event, action) {
            Svidget.log("page: action proxy bubble: " + action.name());
            if (type == "invoke") this.actionProxyInvoked(action, event.value);
            if (type == "change") this.actionProxyChanged(action, event.value);
            // event.target is actionParam that was changed
            if (type == "paramchange") this.actionParamProxyChanged(action, event.target, event.value);
            // for add/remove, event.value == actionParam added or removed
            if (type == "paramadd") this.actionParamProxyAdded(action, event.value);
            if (type == "paramremove") this.actionParamProxyRemoved(action, event.value);
        },
        // private
        actionProxyInvoked: function(action, eventValue) {
            this.triggerFromWidget("actioninvoke", eventValue, action);
        },
        // private
        actionProxyChanged: function(action, eventValue) {
            this.triggerFromWidget("actionchange", eventValue, action);
        },
        // private
        actionParamProxyAdded: function(action, actionParam) {
            this.triggerFromWidget("actionparamadd", actionParam, action);
        },
        // private
        actionParamProxyRemoved: function(action, actionParamName) {
            this.triggerFromWidget("actionparamremove", actionParamName, action);
        },
        // private
        actionParamProxyChanged: function(action, actionParam, eventValue) {
            this.triggerFromWidget("actionparamchange", eventValue, actionParam);
        },
        // internal
        addEventProxy: function(nameOrObject, options) {
            return this.events().add(nameOrObject, options, this);
        },
        // internal
        removeEventProxy: function(name) {
            return this.events().remove(name);
        },
        // internal
        // handle param added
        eventProxyAdded: function(ev) {
            Svidget.log("page: event proxy added: " + ev.name());
            // trigger event
            this.triggerFromWidget("eventadd", ev);
        },
        // internal
        // handle param removed
        eventProxyRemoved: function(ev) {
            Svidget.log("page: event proxy removed: " + ev.name());
            // trigger event
            this.triggerFromWidget("eventremove", ev.name());
        },
        // internal, called from eventdescproxy
        eventProxyBubble: function(type, event, eventDesc) {
            Svidget.log("page: event proxy bubble: " + eventDesc.name());
            if (type == "trigger") this.eventProxyTriggered(eventDesc, event);
            if (type == "change") this.eventProxyChanged(eventDesc, event.value);
        },
        // private
        eventProxyTriggered: function(eventDesc, event) {
            Svidget.log("page: event proxy trigger: " + eventDesc.name());
            this.triggerFromWidget("eventtrigger", event.value, eventDesc);
        },
        // private
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
        // Note: no access to trigger() object events here, only from widget
        // this is invoked from the widget to signal that the event was triggered
        triggerFromWidget: function(type, value, originalTarget) {
            this.eventContainer().trigger(type, value, originalTarget);
        },
        hasElement: function() {
            return this.element() != null;
        },
        // True if element is valid <object> or <iframe> and part of DOM.
        isAttached: function() {
            var ele = this.element();
            return ele != null && ele.parentNode != null;
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
        // REGION: Populate
        // Inflates this object with the transport JSON object
        populate: function(widgetObj) {
            if (this.populated()) return;
            // enabled
            this.enabled(widgetObj.enabled);
            // params
            this._populateParams(widgetObj.params);
            // actions
            this._populateActions(widgetObj.actions);
            // events
            this._populateEvents(widgetObj.events);
            this.getset("populated", true);
        },
        // private
        // Populates the params from the transport object to this instance
        _populateParams: function(params) {
            if (params && Svidget.isArray(params)) {
                for (var i = 0; i < params.length; i++) {
                    var p = params[i];
                    // refresh - add or update param
                    var paramProxy = this.refreshParamProxy(p.name, p.value, p);
                    paramProxy.connect();
                }
            }
        },
        // private
        // Populates the params from the transport object to this instance
        _populateActions: function(actions) {
            if (actions && Svidget.isArray(actions)) {
                for (var i = 0; i < actions.length; i++) {
                    var a = actions[i];
                    var action = this.addActionProxy(a.name, a);
                    this._populateActionParams(a.params, action);
                }
            }
        },
        // private
        // Populates the actions from the transport object to this instance
        _populateActionParams: function(actionParams, action) {
            if (actionParams && Svidget.isArray(actionParams)) {
                for (var i = 0; i < actionParams.length; i++) {
                    var ap = actionParams[i];
                    action.addParam(ap.name, ap);
                }
            }
        },
        // private
        // Populates the events from the transport object to this instance
        _populateEvents: function(events) {
            if (events && Svidget.isArray(events)) {
                for (var i = 0; i < events.length; i++) {
                    var e = events[i];
                    this.addEventProxy(e.name, e);
                }
            }
        }
    };
    Svidget.extend(Svidget.WidgetReference, Svidget.ObjectPrototype);
    Svidget.Root.PagePrototype = {
        // ***********************************
        // REGION: Initializing
        initInternal: function() {
            this.idSeed = 1;
            // seed for widget IDs
            window._svidget = "page";
            this.connected(true);
        },
        readyPage: function() {
            Svidget.log("page: readyPage");
            //alert("page");
            this.loadPageWidgets();
        },
        // ***********************************
        // REGION: Widget Loading
        // 7/9:
        // figure out how id is initialized/passed
        // do we discard existing <object> with potentially loaded widget?
        // 7/10:
        // - startack
        // 7/16:
        // - need to account for case when <iframe> loads, handling initialized for second time
        // Parses page for <object role="svidget"> and loads those as widgets
        loadPageWidgets: function() {
            // parse page for object role="svidget"
            var that = this;
            var svidgetEles = this.findAllWidgetElements();
            svidgetEles.each(function(item) {
                that.loadPageWidget(item);
            });
        },
        // Loads a widget based on its <object> element.
        // objEle = <object role="svidget" data="(url)">
        // paramValues: passed in when adding widget dynamically via load()
        loadPageWidget: function(objEle, paramValues) {
            var widget = this.createWidgetReference(objEle, paramValues);
            this.addWidget(widget);
            //if (!Svidget.DOM.isElementDocumentReady(objEle)) {
            this.readyWidgetReference(widget, objEle);
            return widget;
        },
        createWidgetReference: function(objEle, paramValues) {
            var paramObj;
            // parse <params> if not provided (provided for dynamic loading)
            if (paramValues === undefined) paramObj = this.parseParamElements(objEle); else paramObj = paramValues;
            // check for forced values
            var connected = objEle.getAttribute("data-connected") != "false";
            //todo: allow case-insensitive
            var crossdomain = objEle.getAttribute("data-crossdomain") == "true";
            //todo: allow case-insensitive
            // generate ID
            // tests: test an element with same id before and test with one after declared element
            var widgetID = this.getWidgetIDForElement(objEle);
            //(objEle.id == null) ? this.generateWidgetID() : objEle.id;
            // resolve core element, if widget DOM not ready this will return null
            var coreEle = this.resolveCoreWidgetElement(objEle, null, crossdomain);
            // create WidgetReference
            var wRef = new Svidget.WidgetReference(widgetID, paramObj, objEle, coreEle, connected, crossdomain);
            return wRef;
        },
        readyWidgetReference: function(widget, objEle) {
            //if (true || !widget.hasElement() || !Svidget.DOM.isElementDocumentReady(widget.element())) {
            //	// widget hasn't finished loading yet, so defer until it is loaded
            //	this.addWidgetLoadEvents(objEle, widget);
            //}
            //else {
            //	// widget dom is ready, so finish processing it now
            //	this.finishPageWidget(widget);
            //}
            // if <iframe> already loaded due to data-crossdomain
            var ele = widget.element() || objEle;
            this.addWidgetLoadEvents(ele, widget);
        },
        addWidgetLoadEvents: function(objEle, widget) {
            Svidget.log("page: addWidgetLoadEvents: id = " + objEle.id + ", tag = " + objEle.tagName);
            var handler = Svidget.wrap(this.finishPageWidget, this);
            var wrapper = function() {
                handler(widget);
            };
            widget._waitingForDOM = true;
            Svidget.DOM.on(objEle, "load", wrapper);
        },
        // Finishes page widget:
        //   Makes sure widget element is loaded
        //   Makes sure widget is started
        finishPageWidget: function(widget) {
            //objEle) {
            Svidget.log("page: finishPageWidget: id = " + widget.id());
            //var widget = objEle.widgetReference; // this.createPageWidget(objEle);
            widget._waitingForDOM = false;
            // if <object> replaced with <iframe>
            var finalEle = this.ensureCoreElementResolved(widget);
            if (finalEle != null && finalEle != widget.declaringElement()) this.readyWidgetReference(widget, widget.element()); else this.ensureWidgetStarted(widget);
        },
        ensureCoreElementResolved: function(widget) {
            if (widget.hasElement()) return null;
            var coreEle = this.resolveCoreWidgetElement(widget.declaringElement(), widget, widget.crossdomain());
            // objEle);
            if (coreEle != null) {
                Svidget.log("page: CoreElementCreated: " + coreEle.tagName + " id:" + widget.id());
                widget.setElement(coreEle);
                return coreEle;
            }
            return null;
        },
        ensureWidgetStarted: function(widget) {
            // if core element hasn't been defined yet, then return and try again later
            if (!widget.hasElement()) return;
            if (!widget.started() && Svidget.DOM.isElementDocumentReady(widget.element())) {
                this.signalStart(widget, widget.paramValues());
            }
        },
        // if DOM not yet laoded, returns null
        // if <object> is determined to be cross-domain, disables it and returns an alternate <iframe>
        // else returns declaring <object>
        resolveCoreWidgetElement: function(objEle, widget, crossdomain) {
            // try to get widget contentDocument
            var widgetDoc = Svidget.DOM.getDocument(objEle);
            // widget is not ready, so return null, we'll try again later
            // but if crossDomain flag is set, then we use iframe uncondtionally
            if (widgetDoc === null && !crossdomain) return null;
            var ifmEle = null;
            var coreEle = objEle;
            // if undefined, it means access was denied making it cross domain widget
            // so we disable and hide <object> and replace with <iframe>
            if (widgetDoc === undefined || crossdomain) {
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
            // loops through each widget references with missing element
            // and checks if its document is ready
            // called from handle widget initialized
            // var unfinalWidgets = 
            if (this.allWidgetsStarted) return;
            Svidget.log("page: checkUnfinishedWidgetReferences");
            var that = this;
            var count = 0;
            this.widgets().where(function(w) {
                return that.needsFinishing(w);
            }).each(function(w) {
                //	return !w.hasElement() && Svidget.DOM.isElementDocumentReady(w.declaringElement()); 
                //}).each(function (w) { 
                count++;
                that.finishPageWidget(w);
            });
            // set flag so that we stop checking for unfinalized widgets
            //if (count == 0) this.allWidgetsFinalized = true;
            this.waitForWidgets();
        },
        needsFinishing: function(widget) {
            if (widget._waitingForDOM) return false;
            // if widget element hasn't been finalized or started, and declaring element is ready, then it needs finalizing
            if ((!widget.hasElement() || !widget.started()) && Svidget.DOM.isElementDocumentReady(widget.declaringElement())) return true;
            // if widget element is an <iframe> due to being cross domain, and the DOM for that <iframe> is ready, but it hasn't been started, it needs finalizing
            if (widget.hasElement() && widget.isCrossDomain() && !widget.started() && Svidget.DOM.isElementDocumentReady(widget.element())) return true;
            // doesn't need finalizing
            return false;
        },
        areAllWidgetsStarted: function() {
            return this.widgets().all(function(w) {
                return w.started();
            });
        },
        disableAndHide: function(ele) {
            ele.data = "";
            //todo: confirm this works
            Svidget.DOM.disable(ele);
            Svidget.DOM.hide(ele);
        },
        getWidgetIDForElement: function(objEle) {
            var id = objEle.id;
            //(objEle.id == null) ? this.generateWidgetID() : objEle.id;
            // if id points to element (no duplicates, then just use that)
            if (id != null && document.getElementById(id) == objEle) return id;
            return this.newWidgetID();
        },
        newWidgetID: function() {
            var prefix = "_svidget_";
            if (this.idCounter === undefined) this.idCounter = 1;
            var idNum = this.idCounter;
            var id;
            while (true) {
                var id = prefix + idNum;
                idNum++;
                if (document.getElementById(id) == null) break;
            }
            this.idCounter = idNum;
            return id;
        },
        buildIFrameElement: function(objEle) {
            var iframe = document.createElement("iframe");
            var objItem = Svidget.DOM.wrap(objEle);
            objItem.attributes().each(function(a) {
                if (a.name() == "data") iframe.setAttribute("src", a.value()); else if (a.name() == "id") iframe.setAttribute("id", a.value() + "_frame"); else iframe.setAttribute(a.name(), a.value());
            });
            return iframe;
        },
        buildObjectElement: function(options, paramObj) {
            var objEle = document.createElement("object");
            objEle.setAttribute("role", "svidget");
            objEle.setAttribute("data", options.url);
            if (options.id) objEle.setAttribute("id", options.id);
            if (options.width) objEle.setAttribute("width", options.width);
            if (options.height) objEle.setAttribute("height", options.height);
            // yes, if these values are false we dont want to write them out
            if (options.standalone) objEle.setAttribute("data-standalone", options.standalone);
            if (options.crossdomain) objEle.setAttribute("data-crossdomain", options.crossdomain);
            // params
            for (var key in paramObj) {
                var paramEle = document.createElement("param");
                paramEle.setAttribute("name", key);
            }
            return objEle;
        },
        createObjectElement: function(container, options, paramObj) {
            var objEle = this.buildObjectElement(options, paramObj);
            container.appendChild(objEle);
            return objEle;
        },
        // this is called once the params/actions and widget data are sent from the widget
        populateWidgetReference: function(widgetRef, widgetTransport) {
            Svidget.log("page: populateWidgetReference");
            if (!widgetRef.populated()) {
                widgetRef.populate(widgetTransport);
            }
        },
        findAllWidgetElements: function() {
            var objectEles = Svidget.DOM.getByName("object", true);
            //document.getElementsByTagName("object");
            var svidgetEles = objectEles.where(function(item) {
                return Svidget.DOM.attrValue(item, "role") == "svidget";
            });
            return svidgetEles;
        },
        // Parses the <param> elements inside of the <object> element for the widget.
        parseParamElements: function(objEle) {
            var paramEles = Svidget.DOM.getChildrenByName(objEle, "param", true);
            //Svidget.array(objEle.getElementsByTagName("param")));
            // return object with name/value (string/string)
            var obj = {};
            for (var i = 0; i < paramEles.length; i++) {
                var name = paramEles[i].getAttribute("name");
                if (name != null && name.length > 0) obj[name] = paramEles[i].getAttribute("value");
            }
            return obj;
        },
        // RETURNS
        // A  WidgetReference object by that ID
        getWidget: function(id) {
            if (id == null) return null;
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
        // ***********************************
        // REGION: Public Methods
        // public
        // sel: element or selector to element for container
        // url: url to widget
        // options: options for the widget { standalone: true, crossdomain: false }
        // paramobj: param object to initialize widget
        // callback: a callback to invoke when widget is done fully loading (widget downloaded and initialized) or error
        // RETURNS
        // A reference to the svidget
        load: function(sel, urlOrOptions, paramObj, callback) {
            // should we allow multiple sel and create a Widget for each? (hint test a jquery plugin) also: we can have a loadAll (named like queryselectorAll)
            // resolve container
            var container = Svidget.DOM.selectElement(sel);
            if (container == null) return null;
            // resolve urlOrOptions
            var options = null;
            if (typeof urlOrOptions === "string") options = {
                url: urlOrOptions
            }; else if (urlOrOptions == null) return null; else options = urlOrOptions;
            if (options.url == null) return;
            // clear state
            this.allWidgetsStarted = false;
            // build out <object> element
            var widgetEle = this.createObjectElement(container, options, paramObj);
            var widget = this.loadPageWidget(widgetEle, paramObj);
            // note: if this is called before ready, then it is queued
            // returns the WidgetReference object
            // if callback defined, call it
            if (callback && typeof callback === "function") callback(widget);
            //this.waitForWidgets();
            // return widget
            return widget;
        },
        // ***********************************
        // REGION: Public Properties
        widgets: function(selector) {
            var col = this.getWidgets();
            return this.select(col, selector);
        },
        widget: function(selector) {
            var col = this.getWidgets();
            var item = this.selectFirst(col, selector);
            return item;
        },
        getWidgets: function() {
            var col = this.getset("widgets");
            if (col == null) {
                col = new Svidget.ObjectCollection(null, Svidget.WidgetReference);
                this.getset("widgets", col);
            }
            return col;
        },
        triggerWidgetEvent: function(widgetRef, eventName, data) {
            var ev = widgetRef.event(eventName);
            if (ev == null) return;
            ev.triggerFromWidget(data);
        },
        // ***********************************
        // REGION: Communication
        receiveFromWidget: function(name, payload, widgetID) {
            Svidget.log("page: receiveFromWidget {name: " + name + ", widgetID: " + widgetID + "}");
            var widget = this.getWidget(widgetID);
            //if (widget == null && name != "initialized") return; // widgetID may be null if widget hasn't been assigned an ID
            // invoke handler for message
            switch (name) {
              // lifecycle handlers
                // payload == widget transport { id: "", enabled: true, params: [], actions: [] } 
                //case "initialized": this.handleReceiveWidgetInitialized(); break; //widget, payload); break;
                //case "loaded": this.handleReceiveWidgetLoaded(widget, payload); break;
                // params handlers 
                // payload == param transport { name: "background", type: "", value: 3 }
                case "paramadded":
                this.handleReceiveWidgetParamAdded(widget, payload);
                break;

              case "paramremoved":
                this.handleReceiveWidgetParamRemoved(widget, payload);
                break;

              case "paramchanged":
                this.handleReceiveWidgetParamChanged(widget, payload);
                break;

              case "paramvaluechanged":
                this.handleReceiveWidgetParamValueChanged(widget, payload);
                break;

              // actions handlers
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

              // events handlers
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

              // acks
                case "startack":
                this.handleReceiveWidgetStartAck(widget, payload);
                break;
            }
        },
        // signal widget to start, effectively establishing a connection from parent to it
        signalStart: function(widgetRef, paramValues) {
            Svidget.log("page: signalStart {id: " + widgetRef.id() + ", url: " + widgetRef.url() + ", tag: " + widgetRef.element().tagName + "}");
            //var paramValues = {};
            var payload = {
                id: widgetRef.id(),
                params: paramValues,
                connected: widgetRef.connected()
            };
            this.comm().signalWidget(widgetRef, "start", payload);
        },
        signalPropertyChange: function(widgetRef, obj, objType, propName, propValue) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log("page: signalPropertyChange {id: " + widgetRef.id() + ", type: " + objType + "}");
            var payload = {
                type: objType,
                name: obj.name(),
                propertyName: propName,
                value: propValue
            };
            this.comm().signalWidget(widgetRef, "propertychange", payload);
        },
        signalActionInvoke: function(widgetRef, actionProxy, argList) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log("page: signalActionInvoke {id: " + widgetRef.id() + ", url: " + widgetRef.url() + "}");
            //var paramValues = {};
            var payload = {
                action: actionProxy.name(),
                args: argList
            };
            this.comm().signalWidget(widgetRef, "actioninvoke", payload);
        },
        signalEventTrigger: function(widgetRef, eventDescProxy, data) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log("page: signalEventTrigger {id: " + widgetRef.id() + "}");
            var payload = {
                event: eventDescProxy.name(),
                data: data
            };
            this.comm().signalWidget(widgetRef, "eventtrigger", payload);
        },
        // invoked by widget to notify parent that it has been instantiated
        handleReceiveWidgetInitialized: function() {
            //widgetRef, widgetTransport) {
            Svidget.log("page: handleReceiveWidgetInitialized");
        },
        // invoked by widget to notify parent that it is loaded and ready
        handleReceiveWidgetLoaded: function(widgetRef, widgetTransport) {
            //this.signalStart(widgetProxy); // moved to initialized
            // in most cases, widget should be finalized, but call one more time just in case
            // commented out because it no longer makes sense because if widgetRef is not null then it means that start was already called
            // this.finalizePageWidget(widgetRef.declaringElement());
            // trigger load widget event
            // if null, it means that widget DOM loaded before start was called, so defer
            if (widgetRef == null) {
                this.checkUnfinishedWidgetReferences();
                return;
            }
            this.populateWidgetReference(widgetRef, widgetTransport);
        },
        // invoked by widget to notify parent that it received start message
        // if the widget is to be in standalone mode then this will not be invoked
        handleReceiveWidgetStartAck: function(widgetRef, widgetTransport) {
            Svidget.log("page: handleReceiveWidgetStartAck {widget: " + widgetRef.id() + "}");
            // ignore subsequent acks
            if (widgetRef.started()) return;
            widgetRef.start();
            this.populateWidgetReference(widgetRef, widgetTransport);
            this.triggerWidgetLoaded(widgetRef.id());
            // check if all widgets loaded, if so fire loaded
            // note: this is probably a bit inefficient, but we'll optimize later
            if (this.areAllWidgetsStarted()) {
                this.allWidgetsStarted = true;
                this.markLoaded();
            }
        },
        // Handle: Params
        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetParamAdded: function(widgetRef, paramPayload) {
            Svidget.log("page: handleReceiveWidgetParamAdded {param: " + paramPayload.name + "}");
            // paramPayload == param transport
            // add the paramProxy from param transport, this will trigger any events associated with the add
            widgetRef.addParamProxy(paramPayload.name, paramPayload);
        },
        // invoked by widget to notify parent that a param was removed
        handleReceiveWidgetParamRemoved: function(widgetRef, paramName) {
            Svidget.log("page: handleReceiveWidgetParamRemoved {param: " + paramName + "}");
            // remove the paramProxy, this will trigger any events associated with the add
            widgetRef.removeParamProxy(paramName);
        },
        // changeData: { name: actionName, property: "enabled", value: val }
        handleReceiveWidgetParamChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetParamChanged {param: " + changePayload.name + "}");
            var param = widgetRef.param(changePayload.name);
            if (param == null) return;
            param.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        // valueData: { name: actionName, value: val }
        handleReceiveWidgetParamValueChanged: function(widgetRef, valueChangePayload) {
            Svidget.log("page: handleReceiveWidgetParamChanged {param: " + valueChangePayload.name + "}");
            var param = widgetRef.param(valueChangePayload.name);
            if (param == null) return;
            param.notifyValueChange("value", valueChangePayload.value);
        },
        // Handle: Actions
        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetActionAdded: function(widgetRef, actionPayload) {
            Svidget.log("page: handleReceiveWidgetActionAdded {action: " + actionPayload.name + "}");
            // actionPayload == action transport
            // add the actionProxy from action transport, this will trigger any events associated with the add
            widgetRef.addActionProxy(actionPayload.name, actionPayload);
        },
        // invoked by widget to notify parent that a param was removed
        handleReceiveWidgetActionRemoved: function(widgetRef, actionName) {
            Svidget.log("page: handleReceiveWidgetActionRemoved {action: " + actionName + "}");
            // remove the paramProxy, this will trigger any events associated with the add
            widgetRef.removeActionProxy(actionName);
        },
        // changeData: { name: actionName, property: "enabled", value: val }
        handleReceiveWidgetActionChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetActionChanged {action: " + changePayload.name + "}");
            var action = widgetRef.action(changePayload.name);
            if (action == null) return;
            action.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        // actionReturnPayload = { name: actionName, returnValue: "value returned from action" }
        handleReceiveWidgetActionInvoked: function(widgetRef, actionReturnPayload) {
            Svidget.log("page: handleReceiveWidgetActionInvoked {action: " + actionReturnPayload.name + "}");
            var action = widgetRef.action(actionReturnPayload.name);
            if (action == null) return;
            action.invokeFromWidget(actionReturnPayload.returnValue);
        },
        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetActionParamAdded: function(widgetRef, actionParamPayload) {
            Svidget.log("page: handleReceiveWidgetActionParamAdded {actionparam: " + actionParamPayload.name + "}");
            // actionPayload == action transport
            // add the actionProxy from action transport, this will trigger any events associated with the add
            var action = widgetRef.action(actionParamPayload.actionName);
            if (action == null) return;
            action.addParam(actionParamPayload.name, actionParamPayload);
        },
        // invoked by widget to notify parent that a param was removed
        // { name: actionParamName, actionName: actionName }
        handleReceiveWidgetActionParamRemoved: function(widgetRef, actionParamNamePayload) {
            Svidget.log("page: handleReceiveWidgetActionParamRemoved {actionparam: " + actionParamNamePayload + "}");
            // remove the paramProxy, this will trigger any events associated with the add
            var action = widgetRef.action(actionParamNamePayload.actionName);
            if (action == null) return;
            action.removeParam(actionParamNamePayload.name);
        },
        // changeData: { name: actionParamName, actionName: actionName, property: "enabled", value: val }
        handleReceiveWidgetActionParamChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetActionParamChanged {actionparam: " + changePayload.name + "}");
            var action = widgetRef.action(changePayload.actionName);
            if (action == null) return;
            var actionParam = action.param(changePayload.name);
            if (actionParam == null) return;
            actionParam.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        // Handle: Events
        handleReceiveWidgetEventAdded: function(widgetRef, eventDescPayload) {
            Svidget.log("page: handleReceiveWidgetEventAdded {event: " + eventDescPayload.name + "}");
            // eventPayload == eventDesc transport
            // add the eventDescProxy from eventDesc transport, this will trigger any events associated with the add
            widgetRef.addEventProxy(eventDescPayload.name, eventDescPayload);
        },
        handleReceiveWidgetEventRemoved: function(widgetRef, eventDescName) {
            Svidget.log("page: handleReceiveWidgetEventRemoved {event: " + eventDescName + "}");
            // eventPayload == eventDesc.name
            // remove the eventDescProxy by its name, this will trigger any events associated with the remove
            widgetRef.removeEventProxy(eventDescName);
        },
        // changeData: { name: eventName, property: "enabled", value: val }
        handleReceiveWidgetEventChanged: function(widgetRef, changePayload) {
            Svidget.log("page: handleReceiveWidgetEventChanged {event: " + changePayload.name + "}");
            var ev = widgetRef.event(changePayload.name);
            if (ev == null) return;
            ev.notifyPropertyChange(changePayload.property, changePayload.value);
        },
        // invoked by widget to notify parent that an event was triggered
        handleReceiveWidgetEventTriggered: function(widgetRef, eventDataPayload) {
            Svidget.log("page: handleReceiveWidgetEventTriggered {event: " + eventDataPayload.name + "}");
            //{ "name": eventDesc.name(), "value": value };
            var ev = widgetRef.event(eventDataPayload.name);
            if (ev == null) return;
            ev.triggerEventFromWidget(eventDataPayload.value);
        }
    };
    Svidget.Root.WidgetPrototype = {
        // ***********************************
        // REGION: Initializing
        initInternal: function() {
            // init widget object
            this.loadCurrent();
            // notify parent that widget is initialized and ready to be started
            // update: moved to sviget.start because we don't want to signal until svidget object created
            //this.signalInitialized();
            window._svidget = "widget";
        },
        readyWidget: function() {
            Svidget.log("widget: readyWidget");
            //alert("widget");
            //this.loadCurrent();
            // start widget
            this.startWidget();
        },
        // ***********************************
        // REGION: Widget Element Loading
        // widget object should be instantiated before ready
        loadCurrent: function() {
            // load widget object
            var widget = new Svidget.Widget();
            this.setCurrent(widget);
            this.setCurrent = null;
        },
        startWidget: function() {
            var widget = this.current();
            // populate objects
            this.populateObjects();
            // set up widget as either standalone or connected
            if (!this.connected()) this.startWidgetStandalone(widget); else this.startWidgetConnected(widget);
        },
        startWidgetStandalone: function(widget) {
            // read values from query string and populate params
            var paramValues = this.getParamValuesFromQueryString();
            this.setParamValues(widget, paramValues, true);
            widget.start();
        },
        startWidgetConnected: function(widget) {
            if (this.paramValues != null) {
                this.setParamValues(this.paramValues);
                this.paramValues = null;
            }
            widget.start();
        },
        populateObjects: function() {
            // get <svidget:params> xml element
            var paramsElement = this.getParamsElement();
            // populate params
            this.populateParams(paramsElement);
            // get <svidget:actions> xml element
            var actionsElement = this.getActionsElement();
            // populate actions
            this.populateActions(actionsElement);
            // get <svidget:events> xml element
            var eventsElement = this.getEventsElement();
            // populate events
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
            if (eles.length == 0) return null;
            return eles[0];
        },
        // Populates Params into the widget based on the 
        // xele == <svidget:params> element
        populateParams: function(xele) {
            var that = this;
            this.populateElementObjects(xele, function(nextEle, widget) {
                var param = that.buildParam(nextEle, widget);
                if (param != null) widget.addParam(param);
            });
        },
        buildParam: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "param")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            //xele.attributes["name"];
            if (name == null) return null;
            // don't allow a param without a name
            var value = Svidget.DOM.attrValue(xele, "value");
            //xele.attributes["value"];
            var options = this.buildOptions(xele, Svidget.Param.optionProperties);
            var param = new Svidget.Param(name, value, options, widget);
            return param;
        },
        populateActions: function(xele) {
            var that = this;
            this.populateElementObjects(xele, function(nextEle, widget) {
                var action = that.buildAction(nextEle, widget);
                if (action != null) {
                    widget.addAction(action);
                    that.populateActionParams(nextEle, action);
                }
            });
        },
        // Populates action params into the action
        // actionEle == <svidget:action> element
        populateActionParams: function(actionEle, action) {
            var that = this;
            this.populateElementObjects(actionEle, function(nextEle, widget) {
                var param = that.buildActionParam(nextEle, action);
                if (param != null) action.addParam(param);
            });
        },
        buildAction: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "action")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            //xele.attributes["name"];
            if (name == null) return null;
            // don't allow a param without a name
            var options = this.buildOptions(xele, Svidget.Action.optionProperties);
            var action = new Svidget.Action(name, options, widget);
            return action;
        },
        buildActionParam: function(xele, action) {
            if (!this.isValidSvidgetElement(xele, "actionparam")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            //xele.attributes["name"];
            if (name == null) return null;
            // don't allow a param without a name
            var options = this.buildOptions(xele, Svidget.ActionParam.optionProperties);
            var param = new Svidget.ActionParam(name, options, action);
            return param;
        },
        // Populates Params into the widget based on the 
        // xele == <svidget:events> element
        populateEvents: function(xele) {
            var that = this;
            this.populateElementObjects(xele, function(nextEle, widget) {
                var ev = that.buildEvent(nextEle, widget);
                if (ev != null) widget.addEvent(ev);
            });
        },
        buildEvent: function(xele, widget) {
            if (!this.isValidSvidgetElement(xele, "event")) return null;
            var name = Svidget.DOM.attrValue(xele, "name");
            //xele.attributes["name"];
            if (name == null) return null;
            // don't allow a param without a name
            var options = this.buildOptions(xele, Svidget.EventDesc.optionProperties);
            var ev = new Svidget.EventDesc(name, options, widget);
            return ev;
        },
        populateElementObjects: function(xele, eachAction) {
            if (xele == null || xele.childNodes == null) return;
            var widget = this.current();
            var nextEle = xele.firstElementChild;
            while (nextEle != null) {
                if (eachAction) eachAction(nextEle, widget);
                nextEle = nextEle.nextElementSibling;
            }
        },
        buildOptions: function(xele, optionProps) {
            var options = {};
            if (optionProps == null || !Svidget.isArray(optionProps)) return options;
            for (var i = 0; i < optionProps.length; i++) {
                var optName = optionProps[i];
                var optVal = Svidget.DOM.attrValue(xele, optName);
                if (optVal != null) options[optName] = optVal;
            }
            return options;
        },
        // Called by parent (via global object) to signal that is has established its relationship with the parent page.
        // Params:
        //   id: the ID assigned to this widget
        //   paramValues: the param values as they were declared on the page, or provided if widget declared programmatically
        //   connected: whether the widget is connected to its parent, if false it will remain in standalone mode and cease any further communication with the parent
        // Remarks:
        //   start() may be called at any point during the DOM lifecycle for this widget, i.e. while DOM is still parsing or when completed
        connectWidget: function(id, paramValues, connected) {
            var widget = this.current();
            if (widget.connected()) return;
            // connect, setting id
            if (connected) {
                Svidget.log("widget: connect {id: " + id + "}");
                widget.connect(id);
                this.getset("connected", true);
            } else {
                Svidget.log("widget: standalone {id: " + id + "}");
            }
            //Svidget.log("widget: connect {id: " + id + "}");
            //widget.connect(id);
            //this.getset("connected", true);
            // set params
            //this.setParamValues(paramValues);
            this.paramValues = paramValues || {};
        },
        startWidgetWithPageParams: function() {
            var widget = this.current();
            if (widget.started()) {
                this.setParamValues(widget, this.paramValues);
            }
        },
        // Gets the param values from the query string.
        getParamValuesFromQueryString: function() {
            var qs = Svidget.Util.queryString();
            return qs;
        },
        // SUMMARY
        // Sets the param values for every param using the values from the specified object. This object can be from the query string or parent.
        // Params initialized with a value will be skipped if there is no matching entry in the values object.
        setParamValues: function(widget, paramValues, qsMode) {
            // note: can only be called internally
            // loop through all params, if value in paramValues then overwrite, if value not yet populated on param then use default value, otherwise skip
            //var widget = this.current();
            var col = widget.params();
            if (col == null) return;
            col.each(function(p) {
                var key = qsMode ? p.shortname() || p.name() : p.name();
                if (key == null) return;
                var val = paramValues[key];
                p.value(val);
            });
        },
        isValidSvidgetElement: function(xele, name) {
            return xele != null && xele.localName == name && xele.namespaceURI == Svidget.Namespaces.svidget;
        },
        // ***********************************
        // REGION: Public Properties
        current: function() {
            return this.getset("current");
        },
        connected: function() {
            return this.getset("connected");
        },
        // ***********************************
        // REGION: Communications
        receiveFromParent: function(name, payload) {
            Svidget.log("widget: receiveFromParent {name: " + name + "}");
            if (name == "start") this.handleReceiveParentStart(payload); else if (name == "actioninvoke") this.handleReceiveParentActionInvoke(payload); else if (name == "eventtrigger") this.handleReceiveParentEventTrigger(payload); else if (name == "propertychange") this.handleReceiveParentPropertyChange(payload);
        },
        // NOTE: Except for initialized and loaded, if widget is standalone don't not signal
        //signalInitialized: function () {
        //	Svidget.log("widget: signalInitialized");
        //	// at this stage we don't know our ID yet nor do we have any payload
        //	this.comm().signalParent("initialized", null, null); //this.current().toTransport());
        //},
        //signalLoaded: function () {
        //	// note: id can be null, it means it hasn't been assigned yet (widget DOM loaded before start called)
        //	Svidget.log("widget: signalLoaded {id: " + this.current().id() + "}");
        //	this.comm().signalParent("loaded", this.current().toTransport(), this.current().id());
        //},
        signalStartAck: function() {
            Svidget.log("widget: signalStartAck {id: " + this.current().id() + "}");
            var t = this.current().toTransport();
            this.comm().signalParent("startack", t, this.current().id());
        },
        // for any other signals, if widget isn't connected then don't signal
        // Params
        signalParamAdded: function(param) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalParamAdded {id: " + this.current().id() + "}");
            var transport = param.toTransport();
            this.comm().signalParent("paramadded", transport, this.current().id());
        },
        signalParamRemoved: function(paramName) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalParamRemoved {id: " + this.current().id() + "}");
            //var transport = param.name();
            this.comm().signalParent("paramremoved", paramName, this.current().id());
        },
        signalParamChanged: function(param, changeData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalParamChanged {id: " + this.current().id() + "}");
            changeData.name = param.name();
            // add param name
            this.comm().signalParent("paramchanged", changeData, this.current().id());
        },
        signalParamValueChanged: function(param, changeData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalParamValueChanged {id: " + this.current().id() + "}");
            changeData.name = param.name();
            // add param name
            this.comm().signalParent("paramvaluechanged", changeData, this.current().id());
        },
        // Actions/Action Params
        signalActionAdded: function(action) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionAdded {id: " + this.current().id() + "}");
            var transport = action.toTransport();
            this.comm().signalParent("actionadded", transport, this.current().id());
        },
        signalActionRemoved: function(actionName) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionRemoved {id: " + this.current().id() + "}");
            //var t = action.name();
            this.comm().signalParent("actionremoved", actionName, this.current().id());
        },
        // changeData: { name: actionName, property: "enabled", value: val }
        signalActionChanged: function(action, changeData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionChanged {id: " + this.current().id() + "}");
            changeData.name = action.name();
            // add action name
            this.comm().signalParent("actionchanged", changeData, this.current().id());
        },
        // returnData: { name: actionName, returnValue: "enabled", value: val }
        signalActionInvoked: function(action, returnData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionInvoked {id: " + this.current().id() + "}");
            //var transport = { name: action.name(), retu: argObj };
            returnData.name = action.name();
            this.comm().signalParent("actioninvoked", returnData, this.current().id());
        },
        signalActionParamAdded: function(actionParam, actionName) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionParamAdded {id: " + this.current().id() + "}");
            var transport = actionParam.toTransport();
            transport.actionName = actionName;
            this.comm().signalParent("actionparamadded", transport, this.current().id());
        },
        signalActionParamRemoved: function(actionParamName, actionName) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionParamRemoved {id: " + this.current().id() + "}");
            //var t = action.name();
            var transport = {
                name: actionParamName,
                actionName: actionName
            };
            this.comm().signalParent("actionparamremoved", transport, this.current().id());
        },
        signalActionParamChanged: function(actionParam, action, changeData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalActionParamChanged {id: " + this.current().id() + "}");
            changeData.name = actionParam.name();
            // add actionparam name
            changeData.actionName = action.name();
            // add actionparam name
            this.comm().signalParent("actionparamchanged", changeData, this.current().id());
        },
        // Events
        signalEventAdded: function(eventDesc) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalEventAdded {id: " + this.current().id() + "}");
            var transport = eventDesc.toTransport();
            this.comm().signalParent("eventadded", transport, this.current().id());
        },
        signalEventRemoved: function(eventDescName) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalEventRemoved {id: " + this.current().id() + "}");
            //var transport = eventDesc.name();
            this.comm().signalParent("eventremoved", eventDescName, this.current().id());
        },
        signalEventChanged: function(eventDesc, changeData) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalEventChanged {id: " + this.current().id() + "}");
            changeData.name = eventDesc.name();
            // add event name
            this.comm().signalParent("eventchanged", changeData, this.current().id());
        },
        signalEventTriggered: function(eventDesc, value) {
            if (!this.connected()) return;
            // no signaling if not connected
            Svidget.log("widget: signalEventTriggered {id: " + this.current().id() + "}");
            var transport = {
                name: eventDesc.name(),
                value: value
            };
            this.comm().signalParent("eventtriggered", transport, this.current().id());
        },
        // payload == { id: widgetRef.id(), params: paramValues };
        handleReceiveParentStart: function(payload) {
            payload = payload || {};
            //this.current().start(payload.id, payload.params);
            // wire up data from parent
            var connected = payload.connected !== false;
            this.connectWidget(payload.id, payload.params, connected);
            // we default to connected, so if undefined then true
            // tell the parent that we got the start signal -  before we set anything on widget from parent
            if (connected) this.signalStartAck();
            // if widget already started, update param values with ones passed from page
            this.startWidgetWithPageParams();
        },
        handleReceiveParentPropertyChange: function(payload) {
            payload = payload || {};
            var objType = payload.type;
            // only support param.value for now
            if (payload.type == "param" && payload.propertyName == "value" && payload.name != null) {
                var param = this.current().param(payload.name);
                if (param != null) {
                    param.value(payload.value);
                }
            }
        },
        // payload == { action: actionProxy.name(), args: argList }
        handleReceiveParentActionInvoke: function(payload) {
            payload = payload || {};
            var actionName = payload.action;
            var action = this.current().action(actionName);
            if (action == null || !action.external()) return;
            // todo: maybe send some fail message?
            action.invokeApply(payload.args);
        },
        handleReceiveParentEventTrigger: function(payload) {
            payload = payload || {};
            var eventName = payload.event;
            var ev = this.current().event(eventName);
            if (ev == null || !ev.external()) return;
            // todo: maybe send some fail message?
            ev.trigger(payload.data);
        }
    };
    this.svidget = new Svidget.Root(this);
}).call(this);