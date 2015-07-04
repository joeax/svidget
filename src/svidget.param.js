/*****************************************
svidget.param.js

Defines a param for the widget.

Dependencies:
Svidget.Core
Svidget.EventPrototype
Svidget.ObjectPrototype
Svidget.ParamPrototype


******************************************/

/**
 * Represents param for a widget, defined by <svidget:param>
 * @constructor
 * @mixes ObjectPrototype
 * @mixes ParamPrototype
 * @augments EventPrototype
 * @memberof Svidget
 * @param {string} name - The name of the param.
 * @param {object} value - The value for the param.
 * @param {object} options - The options for the param. Example: { enabled: true, description: "An event" }
 * @param {Svidget.Widget} parent - The widget that is the parent for this param.
 */
// example usage: widget1.param("backgroundColor").value();
Svidget.Param = function (name, value, options, parent) {
	this.__type = "Svidget.Param";
	// todo: if name is not null, generate
	//if (name == null) 
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget
	var c = Svidget.Conversion;
	// private fields
	var privates = new (function () {
		this.writable = ["shortname", "binding", "enabled", "type", "subtype", "value", "description", "defvalue", "typedata", "coerce", "group"];
		this.name = c.toString(name);
		this.shortname = c.toString(options.shortname);
		this.description = c.toString(options.description);
		this.enabled = options.enabled != null ? c.toBool(options.enabled) : true;
		this.type = resolveType(options.type, value, options.defvalue); // infer type from value/defvalue if type is null/undefined
		this.subtype = c.toString(options.subtype); // resolveSubtype(this.type, options.subtype);
		this.typedata = c.toString(options.typedata);
		this.coerce = c.toBool(options.coerce); // default is false
		this.group = c.toString(options.group);
		this.value = this.coerce ? resolveValue(value, this.type, this.subtype, this.typedata) : value;
		this.defvalue = options.defvalue; // note: only coerced to type when used as a value
		this.sanitizer = (!Svidget.isFunction(options.sanitizer) ? c.toString(options.sanitizer) : options.sanitizer) || null;
		this.parent = parent;
		this.binding = c.toString(options.binding);
		this.bindingQuery = null;
	})();
	// private accessors
	this.setup(privates);

	// target or binding
	privates.bindingQuery = Svidget.DOM.select(privates.binding);
	// create sanitizerFunc from sanitizer
	// sanitizer can be string or function
	privates.sanitizerFunc = Svidget.findFunction(privates.sanitizer);
	
	this.valuePopulated = false; // flipped to true once a value has been assigned or the default value is applied

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramBubble);

	function resolveType(type, value, defvalue) {
		// infer the type from the value or defvalue
		value = value != null ? value : defvalue;
		if (type == null)
			type = Svidget.getType(value);
		else
			type = Svidget.resolveType(type); // normalize type to a valid type
		return type;
	}

	/*function resolveSubtype(type, subtype) {
		return Svidget.resolveSubtype(type, subtype);
	}*/

	function resolveValue(val, type, subtype, typedata) {
		return Svidget.convert(val, type, subtype, typedata);
	}
}

Svidget.Param.prototype = {
	
	/**
	 * Gets whether the param is attached to the widget.
	 * @method
	 * @returns {boolean}
	*/
	attached: function () {
		var parent = this.parent();
		return this.parent != null && this.parent instanceof Svidget.Widget;
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
	 * Gets or sets the shortname value. This is used for params passed from the query string.
	 * @method
	 * @param {boolean} [val] - Sets the shortname when specified.
	 * @returns {boolean} - The shortname when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	shortname: function (val) {
		var res = this.getset("shortname", val, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("shortname"); // get converted value
		this.trigger("change", { property: "shortname", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the group value. This is used to group/categorize params into groups.
	 * @method
	 * @param {boolean} [val] - Sets the group when specified.
	 * @returns {boolean} - The group when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	group: function (val) {
		var res = this.getset("group", val, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("group"); // get converted value
		this.trigger("change", { property: "group", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets whether the event is enabled. 
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
	 * Gets or sets the param value.
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	value: function (val) {
		if (!this.enabled() && val !== undefined) return false;
		var res = this.getset("value", val, null, this.validateValue);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// check enabled
		var finalVal = val;
		// coerce val if coerce === true
		if (this.getset("coerce") === true) {
			finalVal = this.coerceValue(finalVal);
		}
		// sanitize val using param.sanitizer
		finalVal = this.applySanitizer(finalVal);
		this.setPrivate("value", finalVal); //update actual value to final value
		//if (sanVal === undefined) return false; // if sanitizer fails to returns a value, assume it has failed
		// apply to binding
		this.applyBinding(finalVal);
		// fire "set" event
		this.trigger("valuechange", { value: finalVal }); // for backwards compatibility
		this.trigger("set", { value: finalVal }); // 0.1.3: replaces "valuechange"

		return true;
	},

	/**
	 * Gets the serialized param value.
	 * @method
	 * @returns {string} - The serialized/stringified value.
	*/
	serializedValue: function () {
		var val = this.value();
		return Svidget.Conversion.toString(val);
	},

	/**
	 * Gets or sets whether the event is enabled. 
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	coerce: function (val) {
		var res = this.getset("coerce", val, "bool");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getset("coerce"); // get converted value
		this.trigger("change", { property: "coerce", value: val });
		// set was successful
		return true;
	},
	
	/**
	 * Coerces the value currently set on the param. Call this after changing the type to change the type of the value.
	 * @method
	*/
	//coerceValue: function () {
	//	// just set the value to itself, it will coerce and also fire events
	//	this.value(this.value());
	//},

	/**
	 * Gets or sets the param binding. This is a CSS+Attributes selector.
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	binding: function (bind) {
		//bind = bind !== undefined ? bind + "" : undefined; // coerce to string
		var res = this.getset("binding", bind, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// construct bindingQuery object
		bind = this.getset("binding"); // get converted value
		this.getset("bindingQuery", Svidget.DOM.select(bind));
		// fire "changed" event
		this.trigger("change", { property: "binding", value: bind });
		// set was successful
		return true;
	},

	bindingQuery: function () {
		return this.getset("bindingQuery");
	},

	/**
	* Gets or sets the sanitizer function for the param. The sanitizer function is called on set. 
	* The sanitizer function takes a param and value (param, value) and returns the result value.
	* This can be a global function name, or a function.
	* @method
	* @param {Boolean} [val] - Sets the value when specified.
	* @returns {Boolean} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	sanitizer: function (funcName) {
		// bind can be string or function, so check for both, enforce
		if (funcName !== undefined) {
			if (typeof (funcName) !== "function") funcName = funcName + ""; // coerce to string
			// update bindingFunc
			var func = Svidget.findFunction(funcName);
			this.getset("sanitizerFunc", func);
		}
		var res = this.getset("sanitizer", funcName);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "sanitizer", value: val });

		return true;
	},

	sanitizerFunc: function () {
		var bind = this.getset("sanitizer");
		var func = Svidget.findFunction(bind);
		return func;
	},

	applySanitizer: function (val) {
		var func = this.sanitizerFunc();
		if (!func) return val;
		var returnVal = func.call(null, this, val);
		if (returnVal === undefined) return val; // if they didn't specify a return value, then just revert back to original val
		return returnVal;
	},

	validateValue: function (val) {
		return true;
	},

	coerceValue: function (val) {
		return Svidget.convert(val, this.type(), this.subtype(), this.typedata());
	},

	// helpers

	applyBinding: function (val) {
		var bind = this.bindingQuery();
		if (bind == null) return;
		bind.setValue(val);
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
	* Adds an event handler for the "set" event. 
	* @method
	* @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	* @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	* @param {Function} handler - The event handler.
	* @returns {boolean} - True if the event handler was successfully added.
	*/
	onset: function (data, name, handler) {
		return this.on("set", data, name, handler);
	},

	ondeclaredset: function (handler) {
		return this.onset(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "set" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offset: function (handlerOrName) {
		return this.off("set", handlerOrName);
	},

	offdeclaredset: function () {
		return this.offset(Svidget.declaredHandlerName);
	},
	

	/* REGION Misc */

	/**
	 * Serializes the Param object for transport across a window boundary.
	 * @method
	 * @returns {boolean} - A generic serialized object representing the Param object.
	*/
	toTransport: function () {
		// todo: use allProxyProperties and automate this
		var transport = {
			name: this.name(),
			shortname: this.shortname(),
			enabled: this.enabled(),
			type: this.type(),
			subtype: this.subtype(),
			typedata: this.typedata(),
			coerce: this.coerce(),
			defvalue: this.defvalue(),
			value: this.value(),
			// binding: this.binding() // not accessible by proxy
		};
		return transport;
	},

	// overrides

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.Param { name: \"" + this.name() + "\" }]";
	}

	// todo: reactive version valueR returns function that always returns its live value

}

// todo: convert these to functions so that users can't manipulate
Svidget.Param.eventTypes = ["change", "set"];
Svidget.Param.optionProperties = ["type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"];
Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"]; // 0.1.3: removed "binding", 
Svidget.Param.writableProxyProperties = ["value"];

Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));
