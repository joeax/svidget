/*****************************************
svidget.eventprototype.js

Contains common event functionality wrapped as a prototype.

Dependencies:
svidget.core.js
svidget.collection.js

******************************************/

/**
 * Encapsulates a set of prototype methods for managing events.
 * @class
 * @memberof Svidget
 * @param {array} typelist - A list of event types.
 */
Svidget.EventPrototype = function (typelist) {
	// todo: validate typelist
	// these are the event types that the base object supports, like "invoke" for action.
	this.eventTypes = new Svidget.Collection(typelist);
	//this.handlers = {}; // collection
	//this.bubbleParents = {}; // collection
}

Svidget.EventPrototype.prototype = {

	/*
	// follows jQuery convention of (type, data, handler)
	// with a twist, we allow them to specify a name for the handler, for easier removal with off
	// if the name or handler already was added, then nothing happens and false is returned
	// required: type, handler
	// allowed signatures
	//   (type, handler)
	//   (type, data, handler)
	//   (type, data, name, handler)
	*/
	on: function (type, data, name, handler) {
		// resolve handler from whether name, data passed
		handler = handler || (Svidget.isFunction(name) ? name : (Svidget.isFunction(data) ? data : null));
		data = (arguments.length > 2) ? data : null;
		name = (name !== undefined && handler !== name) ? name : null;
		return this.addHandler(type, handler, name, data);
	},

	/*
	// allowed signatures
	//   (type, handler)
	//   (type, name)
	*/
	off: function (type, handlerOrName) {
		// separate handlerOrName into handler, name
		var handler = Svidget.isFunction(handlerOrName) ? handlerOrName : null;
		var name = (handler != null) ? null : handlerOrName;
		return this.removeHandler(type, handler, name);
	},

	trigger: function (type, value, originalTarget) {
		if (type == null) return; // nothing to do
		// get event object from handlers
		var e = this.triggerHandlers(type, value, originalTarget);
		Svidget.log('trigger: ' + type);
		// if not stopPropagation call bubble
		if (!e.isPropagationStopped()) {
			this.bubble(type, e);
		}
		//alert('trigger: ' + type);
	},

	triggerHandlers: function (type, value, originalTarget) {
		// generate event object
		var e = new Svidget.Event(null, type, null, this.getTarget(), originalTarget, value);
		if (type == null || this.handlers == null || this.handlers[type] == null) return e; // nothing to do
		var handlers = this.handlers[type];
		// loop through each handler (make sure it is a function)
		// h == { handler: handler, name: name, data: data }
		handlers.each(function (h) {
			if (e.isImmediatePropagationStopped()) return false; // if stopImmediatePropagation, then exit loop by returning false
			if (h == null || h.handler == null || typeof h.handler !== "function") return; // handler is not a function
			// set name/data
			e.name = h.name;
			e.data = h.data;
			// invoke handler
			h.handler.call(null, e);
		});

		return e;
	},

	bubble: function (type, sourceEvent) {
		// invoked from child
		this.ensureBubbleParents();
		sourceEvent.name = null;
		sourceEvent.data = null;
		if (this.bubbleParents[type]) this.bubbleParents[type](type, sourceEvent, this.getTarget());
	},

	addHandler: function (type, handler, name, data) {
		this.ensureHandlersByType(type);
		// todo: get handler function name, we will use to off() handlers by name
		//if (this.handlers[type].contains(handler)) return false;
		if (this.handlerExists(type, handler, name)) return false;
		var obj = this.toHandlerObject(handler, name, data);
		this.handlers[type].push(obj);
		return true;
	},

	removeHandler: function (type, handler, name) {
		this.ensureHandlers();
		if (!this.handlers[type]) return false;
		//return this.handlers[type].removeAll(handler);
		var that = this;
		return this.handlers[type].removeWhere(function (item) {
			return that.handlerMatch(item, handler, name);
		});
	},

	handlerExists: function (type, handler, name) {
		var that = this;
		var any = this.handlers[type].any(function (item) {
			return that.handlerMatch(item, handler, name);
		}); 
		return any;
	},

	handlerMatch: function (handlerObj, handler, name) {
		if (name != null && handlerObj.name === name) return true;
		if (handler === handlerObj.handler) return true;
		return false;
	},

	setBubbleParent: function (type, callback) {
		this.ensureBubbleParents();
		this.bubbleParents[type] = callback;
	},

	// private, called by the object to register a single callback for all its event types
	// bubbleTarget: usually a parent object
	registerBubbleCallback: function (types, bubbleTarget, callback) {
		if (bubbleTarget && callback) {
			for (var i = 0; i < types.length; i++) {
				this.setBubbleParent(types[i], Svidget.wrap(callback, bubbleTarget));
			}
		}
	},

	toHandlerObject: function (handler, name, data) {
		var handlerFunc = (typeof handler !== "function") ? null : handlerFunc;
		var res = { handler: handler, name: name, data: data };
		return res;
	},

	bubbleFuncs: function (objectType) {
		// override me
	},

	ensureHandlers: function () {
		if (!this.handlers) this.handlers = {};
	},

	ensureHandlersByType: function (type) {
		this.ensureHandlers();
		if (!this.handlers[type]) {
			this.handlers[type] = new Svidget.Collection();
		}
	},

	ensureBubbleParents: function () {
		if (!this.bubbleParents) this.bubbleParents = {};
	},

	// internal
	// returns the target object to use for the event object
	// override in eventContainer
	getTarget: function () {
		return this;
	}
}


