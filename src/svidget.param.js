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
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	// private fields
	var privates = new (function () {
		this.writable = ["binding", "enabled", "type", "subtype", "value", "description", "defvalue", "typedata", "coerce"];
		this.name = name;
		this.shortname = options.shortname;
		this.description = options.description;
		this.enabled = options.enabled !== false;
		this.type = options.type || "string";
		this.subtype = options.subtype || null;
		this.typedata = options.typedata || null;
		this.value = value;
		this.defvalue = options.defvalue; //todo: convert to type
		this.sanitizer = options.sanitizer || null;
		this.coerce = !!options.coerce; // todo: unit test
		this.widget = parent;
		this.binding = options.binding || null;
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

	//this.isProxy;
	// maybe we do need a separate ParameterProxy class

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramBubble);
}

Svidget.Param.prototype = {

	/**
	 * Gets the shortname value. This is used for params passed from the query string.
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	shortname: function () {
		var res = this.getPrivate("shortname");
		return res;
	},

	// public
	// attached is a state property
	// gets whether the param is attached to the widget
	// todo: do we need for action and event too?
	attached: function () {
		var widget = this.getset("widget");
		return this.widget != null && this.widget instanceof Svidget.Widget;
	},

	/**
	 * Gets or sets whether the event is enabled. 
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
	 * Gets or sets the param value.
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	value: function (val) {
		var res = this.getset("value", val, this.validateValue);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// check enabled
		if (!this.enabled()) return false;
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
		var res = this.getset("coerce", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "coerce", value: val });

		return true;
	},

	/**
	 * Gets or sets the param binding. This is a CSS+Attributes selector.
	 * @method
	 * @param {boolean} [val] - Sets the enabled state when specified.
	 * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	binding: function (bind) {
		bind = bind !== undefined ? bind + "" : undefined; // coerce to string
		var res = this.getset("binding", bind);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// todo: construct bindingQuery object
		this.getset("bindingQuery", Svidget.DOM.select(bind));
		// fire "changed" event
		this.trigger("change", { property: "binding", value: bind });

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
		var transport = {
			name: this.name(),
			shortname: this.shortname(),
			enabled: this.enabled(),
			type: this.type(),
			subtype: this.subtype(),
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
		return "[Svidget.Param { name: \"" + this.name + "\" }]";
	}

	// todo: reactive version valueR returns function that always returns its live value

}

// todo: convert these to functions so that users can't manipulate
Svidget.Param.eventTypes = ["valuechange", "change"];
Svidget.Param.optionProperties = ["type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce"];
Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce"]; // 0.1.3: removed "binding", 
Svidget.Param.writableProxyProperties = ["value"];

Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));




/*


widget1.param("backgroundColor").value();

widget1.params["backgroundColor"].value();


*/