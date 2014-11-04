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
		this.writable = ["binding", "enabled", "type", "subtype", "value", "description"];
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
	})();
	// private accessors
	this.setup(privates);

	// target or binding
	privates.bindingQuery = Svidget.DOM.select(privates.binding);

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
		// todo: validate val using param.validate
		// apply to binding
		this.applyBinding(val);
		// fire "valuechange" event
		this.trigger("valuechange", { value: val });

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

	validateValue: function (val) {
		return true;
	},

	// helpers

	applyBinding: function (val) {
		var bind = this.bindingQuery();
		if (bind == null) return;
		bind.setValue(val);
	},

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
			binding: this.binding()
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
Svidget.Param.optionProperties = ["type", "subtype", "binding", "enabled", "shortname"];
Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "binding", "enabled", "shortname"];
Svidget.Param.writableProxyProperties = ["value"];

Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));




/*


widget1.param("backgroundColor").value();

widget1.params["backgroundColor"].value();


*/