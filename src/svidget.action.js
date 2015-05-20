/*****************************************
svidget.action.js

Defines an action entity for a widget.

Last Updated: 03-Sep-2014

Dependencies:
svidget.core.js
svidget.collection.js
svidget.eventprototype.js
svidget.objectprototype.js
svidget.actionparam.js
svidget.actionparamcollection.js
svidget.widget.js

******************************************/


/**
 * Represents an widget action, defined by <svidget:action>.
 * @class
 * @mixes Svidget.ObjectPrototype
 * @augments Svidget.EventPrototype
 * @memberof Svidget
 * @param {string} name - The name of the action.
 * @param {object} options - The options for the action param. Example: { enabled: true, description: "An action" }
 * @param {Svidget.Widget} parent - The widget instance that is the parent for this action.
 */
Svidget.Action = function (name, options, parent) {
	this.__type = "Svidget.Action";
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	var that = this;
	var c = Svidget.Conversion;
	// private fields
	var privates = new (function () {
		this.writable = ["binding", "bindingFunc", "enabled", "external", "description"];
		this.params = new Svidget.ActionParamCollection([], that);
		this.name = c.toString(name);
		this.description = c.toString(options.description);
		this.enabled = options.enabled != null ? c.toBool(options.enabled) : true;
		this.binding = resolveBinding(options.binding);
		this.external = options.external != null ? c.toBool(options.external) : true;
		this.parent = parent;
		this.bindingFunc = null;
	})();
	// private accessors
	this.setup(privates);

	// create bindingFunc from binding
	// binding can be string or function
	privates.bindingFunc = Svidget.findFunction(privates.binding);

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionBubble);

	// add/remove event handlers for params
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);
	
	// load the params into the ActionParamCollection instance
	loadParams(options.params);
	
	function resolveBinding(binding) {
		if (binding == null) return null;
		if (typeof binding !== "function") binding = c.toString(binding);
		return binding;
	}

	function loadParams(params) {
		if (params == null || !Svidget.isArray(params)) return;
		for (var i = 0; i < params.length; i++) {
			var p = params[i];
			// note: failures to add will be skipped/ignored
			if (p.name != null) {
				that.addParam(p.name, p);
			}
		}
	}
}

Svidget.Action.prototype = {

	/* REGION Public Properties */

	/**
	 * Gets the action name.
	 * @method
	 * @returns {string}
	*/
	/*
	// Note: name is immutable after creation
	*/
	name: function (val) {
		if (val !== undefined) return false; // they are trying to set, it should fail
		var res = this.getPrivate("name");
		return res;
	},

	/**
	 * Gets the parent widget.
	 * @method
	 * @returns {Svidget.Widget}
	*/
	parent: function () {
		var res = this.getPrivate("parent");
		return res;
	},
	
	/**
	 * Gets whether the action is attached to the widget.
	 * @method
	 * @returns {boolean}
	*/
	attached: function () {
		var widget = this.parent();
		return widget != null && widget instanceof Svidget.Widget;
	},

	/**
	 * Gets or sets whether the action is enabled. 
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	enabled: function (val) {
		if (val === null) val = true;
		var res = this.getset("enabled", val, "bool");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getset("enabled"); // get converted value
		this.trigger("change", { property: "enabled", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the description.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	description: function (val) {
		var res = this.getset("description", val, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("description"); // get converted value
		this.trigger("change", { property: "description", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets whether the action is external and can be invoked from the page. 
	 * @method
	 * @param {boolean} [val] - Sets the value when specified.
	 * @returns {boolean} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	external: function (val) {
		if (val === null) val = true;
		var res = this.getset("external", val, "bool");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("external"); // get converted value
		this.trigger("change", { property: "external", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the binding for the action. This can be a global function name, or a function.
	 * @method
	 * @param {Boolean} [val] - Sets the value when specified.
	 * @returns {Boolean} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	binding: function (bind) {
		// bind can be string or function, so check for both, enforce
		if (bind !== undefined) {
			if (typeof bind !== "function" && bind !== null) bind = bind + ""; // coerce to string
			// update bindingFunc
			var func = Svidget.findFunction(bind);
			this.getset("bindingFunc", func);
		}
		var res = this.getset("binding", bind);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "binding", value: bind });
		// set was successful
		return true;
	},

	/**
	 * Gets the binding function for the action.
	 * @method
	 * @returns {Function} - The binding function.
	*/
	bindingFunc: function () {
		// bindingFunc is set in constructor, no need to re-lookup here
		var func = this.getset("bindingFunc");
		return func;
	},

	/* REGION Invocation */

	/**
	 * Invokes the action. The params passes in will be passed to the action params in order.
	 * @method
	 * @param {...object} args - The arguments that correspond to action params.
	 * @returns {boolean} - True if invoke succeeds.
	*/
	invoke: function () {
		if (!this.enabled()) return false;
		var func = this.invocableBindingFunc();
		if (!func) return false;
		var argArray = this.buildArgumentArray(Svidget.array(arguments));
		var returnVal = func.apply(null, argArray); //Svidget.root, arguments);
		//var argObj = this.toArgumentObject(Svidget.array(arguments));
		this.trigger("invoke", { returnValue: returnVal });
		return true;
	},

	invokeApply: function (args) {
		this.invoke.apply(this, args);
	},

	invocableBindingFunc: function () {
		var func = this.bindingFunc();
		if (func == null || typeof func !== "function") return null;
		return func;
	},

	// builds an array of argument to use in invoke() based on the action params
	buildArgumentArray: function (args) {
		var argsArray = [];
		args = args == null ? [] : args;
		var col = this.params();
		// loop through action params
		for (var i = 0; i < col.length; i++) {
			var p = col[i];
			var arg = undefined;
			if (i < args.length) arg = args[i];
			if (arg === undefined) arg = p.defvalue(); // an arg wasn't supplied by caller, so use default value from action param if provided
			argsArray.push(arg);
		}
		return argsArray;
	},

	// build an object based on the action params, and values from arguments on invoke
	// update: not currently used
	toArgumentObject: function (args) {
		var argsObj = {};
		var col = this.params();
		// loop through action params
		for (var i = 0; i < col.length; i++) {
			var p = col[i];
			var arg = undefined;
			if (i < args.length) arg = args[i];
			if (arg === undefined) arg = p.defvalue(); // an arg wasn't supplied by caller, so use default value from action param if provided
			argsObj[p.name()] = arg;
		}
		return argsObj;
	},



	/* REGION Params */

	/**
	 * Gets a collection of all ActionParam objects, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * params(0)
	 * params("color")
	 * @method
	 * @param {(string|number|function)} [selector] - The param name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.Collection} - A collection based on the selector, or the entire collection.
	*/
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	/**
	 * Gets the ActionParam based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * param(0)
	 * param("color")
	 * @method
	 * @param {(string|number|function)} selector - The param name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.ActionParam} - The ActionParam based on the selector. If selector is invalid, null is returned.
	*/
	param: function (selector) {
		//var item = this.params(selector).first();
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},
	
	/**
	 * Creates a new ActionParam but does not add to the Action.
	 * Examples:
	 * newParam("backColor")
	 * newParam("backColor", { description: "Background color."})
	 * @method
	 * @param {string} name - The name of the ActionParam.
	 * @param {object} [options] - The options used to contruct the ActionParam. Example: { enabled: true, description: "A param" }
	 * @returns {Svidget.ActionParam} - The ActionParam that was added, or null if ActionParam failed to add.
	*/
	newParam: function (name, options) {
		return new Svidget.ActionParam(name, options, this);
	},

	/**
	 * Adds a ActionParam to the action. If a duplicate name is supplied the ActionParam will fail to add.
	 * Examples:
	 * addParam("backColor")
	 * addParam("backColor", { description: "Background color."})
	 * @method
	 * @param {string} name - The name of the ActionParam to add.
	 * @param {object} [options] - The options used to contruct the ActionParam. Example: { description: "A param" }
	 * @returns {Svidget.ActionParam} - The ActionParam that was added, or null if ActionParam failed to add.
	*/
	/*
	Adding an previously constructed Param object reserved for internal use.
	*/
	addParam: function (name, options) {
		return this.params().add(name, options, this);
	},

	/**
	 * Removes an ActionParam from the action. 
	 * Examples:
	 * removeParam("color")
	 * @method
	 * @param {string} name - The name of the ActionParam to remove.
	 * @returns {boolean} - True if the Param was successfully removed, false otherwise.
	*/
	removeParam: function (name) {
		return this.params().remove(name);
	},

	paramBubble: function (type, event, param) {
		if (type == "change") this.paramChanged(param, event.value);
	},

	// handle param added
	paramChanged: function (param, eventValue) {
		Svidget.log('action: param changed: ' + param.name());
		this.trigger("paramchange", eventValue, param);
	},

	// handle param added
	paramAdded: function (param) {
		Svidget.log('action: param added: ' + param.name());
		this.trigger("paramadd", param);
	},

	// private
	// handle param removed
	paramRemoved: function (param) {
		Svidget.log('action: param removed: ' + param.name());
		this.trigger("paramremove", param.name());
	},

	/* REGION Events */

	/**
	* Adds an event handler for the "change" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onchange: function (data, name, handler) {
		return this.on("change", data, name, handler);
	},

	ondeclaredchange: function (handler) {
		return this.onchange(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "change" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offchange: function (handlerOrName) {
		this.off("change", handlerOrName);
	},

	offdeclaredchange: function () {
		return this.offchange(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "invoke" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	oninvoke: function (data, name, handler) {
		return this.on("invoke", data, name, handler);
	},

	ondeclaredinvoke: function (handler) {
		return this.oninvoke(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "invoke" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offinvoke: function (handlerOrName) {
		return this.off("invoke", handlerOrName);
	},

	offdeclaredinvoke: function () {
		return this.offinvoke(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "paramadd" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onparamadd: function (data, name, handler) {
		return this.on("paramadd", data, name, handler);
	},

	ondeclaredparamadd: function (handler) {
		return this.onparamadd(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "paramadd" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offparamadd: function (handlerOrName) {
		return this.off("paramadd", handlerOrName);
	},

	offdeclaredparamadd: function () {
		return this.offparamadd(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "paramremove" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onparamremove: function (data, name, handler) {
		return this.on("paramremove", data, name, handler);
	},

	ondeclaredparamremove: function (handler) {
		return this.onparamremove(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "paramremove" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offparamremove: function (handlerOrName) {
		return this.off("paramremove", handlerOrName);
	},

	offdeclaredparamremove: function () {
		return this.offparamremove(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "paramremove" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onparamchange: function (data, name, handler) {
		return this.on("paramchange", data, name, handler);
	},

	ondeclaredparamchange: function (handler) {
		return this.onparamchange(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "paramremove" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offparamchange: function (handlerOrName) {
		return this.off("paramchange", handlerOrName);
	},

	offdeclaredparamchange: function () {
		return this.offparamchange(Svidget.declaredHandlerName);
	},

	// helpers

	/**
	 * Serializes the Action object for transport across a window boundary.
	 * @method
	 * @returns {boolean} - A generic serialized object representing the Action.
	*/
	toTransport: function () {
		var transport = {
			name: this.name(),
			description: this.description(),
			external: this.external(),
			enabled: this.enabled(),
			//binding: this.binding(), // not accessible by proxy
			params: this.toParamsTransport()
		};
		return transport;
	},

	toParamsTransport: function () {
		var col = this.params();
		var ps = col.select(function (p) { return p.toTransport(); }).toArray();
		return ps;
	},

	// overrides

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.Action { name: \"" + this.name() + "\" }]";
	}

}

Svidget.Action.eventTypes = ["invoke", "change", "paramchange", "paramadd", "paramremove"];
Svidget.Action.optionProperties = ["external", "binding", "enabled", "description"];
Svidget.Action.allProxyProperties = ["name", "external", "enabled", "description"];
Svidget.Action.writableProxyProperties = [];

Svidget.extend(Svidget.Action, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Action, new Svidget.EventPrototype(Svidget.Action.eventTypes));

