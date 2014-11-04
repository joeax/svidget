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
	// private fields
	var privates = new (function () {
		this.writable = ["binding", "enabled", "external", "description"];
		this.params = new Svidget.ActionParamCollection([], that);
		this.name = name;
		this.description = options.description;
		this.enabled = options.enabled !== false;
		this.binding = options.binding || null;
		this.external = options.external !== false;
		this.widget = parent;
		this.bindingFunc = null;
	})();
	// private accessors
	this.setup(privates);

	// todo: move to core or util
	this.buildBindingFunc = function (bind) {
		if (typeof bind === "function") {
			return bind;
		}
		else if (bind != null) {
			bind = bind + ""; //coerce to string
			var func = Svidget.root[bind];
			if (func == null) return null;
			if (typeof func === "function") return func;
			// bind is an expression, so just wrap it in a function
			if (bind.substr(0, 7) != "return ")
				return new Function("return " + bind);
			else 
				return new Function(bind);
			/*//try {
			//	return eval(options.binding);
			//}
			//catch (ex) {
			//	return undefined;
			//}*/
		}
		return null;
	}

	// create bindingFunc from binding
	// binding can be string or function
	privates.bindingFunc = this.buildBindingFunc(privates.binding);

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionBubble);

	// add/remove event handlers for params
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);

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
	name: function () {
		var res = this.getPrivate("name");
		return res;
	},

	/**
	 * Gets whether the action is attached to the widget.
	 * @method
	 * @returns {boolean}
	*/
	attached: function () {
		var widget = this.getset("widget");
		return this.widget != null && this.widget instanceof Svidget.Widget;
	},

	/**
	 * Gets or sets whether the action is enabled. 
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	enabled: function (val) {
		var res = this.getset("enabled", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "enabled", value: val });

		return true;
	},

	/**
	 * Gets or sets the description.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	description: function (val) {
		var res = this.getset("description", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "description", value: val });

		return true;
	},

	/**
	 * Gets or sets whether the action is external and can be invoked from the page. 
	 * @method
	 * @param {boolean} [val] - Sets the value when specified.
	 * @returns {boolean} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	external: function (val) {
		var res = this.getset("external", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "external", value: val });

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
			if (typeof (bind) !== "function") bind = bind + ""; // coerce to string
			// update bindingFunc
			var func = this.buildBindingFunc(bind);
			this.getset("bindingFunc", func);
		}
		var res = this.getset("binding", bind);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "binding", value: val });

		return true;
	},

	bindingFunc: function () {
		var bind = this.getset("binding");
		var func = this.buildBindingFunc(bind);
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
		var returnVal = func.apply(null, arguments); //Svidget.root, arguments);
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

	// build an object based on the action params, and values from arguments on invoke
	toArgumentObject: function (args) {
		var argsObj = {};
		var col = this.params();
		for (var i = 0; i < args.length; i++) {
			if (i >= col.length) break;
			var p = col[i];
			argsObj[p.name()] = args[i];
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
	 * @param {(string|number)} [selector] - The selector string or integer.
	 * @returns {Svidget.ActionParamCollection} - A collection based on the selector, or the entire collection.
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
	 * @param {(string|number)} selector - The index or ID of the param.
	 * @returns {Svidget.ActionParam} - The ActionParam based on the selector. If selector is invalid, null is returned.
	*/
	param: function (selector) {
		//var item = this.params(selector).first();
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
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
			//binding: this.binding(), 
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

