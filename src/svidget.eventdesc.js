/*****************************************
svidget.eventdesc.js

Represents a user-defined object for the widget.

Dependencies:
svidget.core.js
svidget.eventprototype.js
svidget.objectprototype.js

******************************************/

/**
 * Represents an user-defined event for a widget, defined by <svidget:event>
 * @constructor
 * @mixes ObjectPrototype
 * @augments EventPrototype
 * @memberof Svidget
 * @param {string} name - The name of the event.
 * @param {object} options - The options for the event. Example: { enabled: true, description: "An event" }
 * @param {Svidget.Widget} parent - The widget instance that is the parent for this action.
 */
Svidget.EventDesc = function (name, options, parent) {
	this.__type = "Svidget.EventDesc";
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	var that = this;
	// private fields
	var privates = new (function () {
		this.writable = ["description", "enabled", "external"];
		this.name = name;
		this.description = options.description;
		this.external = options.external !== false;
		this.enabled = options.enabled !== false;
		this.eventName = "trigger"; // this is the internal name we use for the event
		this.eventContainer = new Svidget.EventContainer([this.eventName], that);
	})();
	// private accessors
	this.setup(privates);

	// wire up event bubble parent
	privates.eventContainer.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventBubble);
}

Svidget.EventDesc.prototype = {

	/**
	 * Gets the event name.
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
	 * Gets whether the event is attached to the widget.
	 * @method
	 * @returns {boolean}
	*/
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
	 * Gets or sets whether the event is external and can be triggered from the page. 
	 * @method
	 * @param {boolean} [val] - Sets the value when specified.
	 * @returns {boolean} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	external: function (val) {
		var res = this.getset("external", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "public", value: val });

		return true;
	},

	/* REGION Events */

	// private: used internally for a default event name for the container
	eventName: function() {
		return this.getPrivate("eventName");
	},

	eventContainer: function() {
		return this.getset("eventContainer");
	},

	/**
	 * Registers an event handler for the EventDesc object.
	 * @method
	 * @param {string} [type] - The event type i.e. "change". If not specified it is assumed it is for the event itself.
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	/*
	// type, data, name, handler
	// type, data, handler
	// type, handler
	*/
	on: function (type, data, name, handler) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handler = type;
			type = this.eventName();
		}
		this.eventContainer().on(type, data, name, handler);
	},


	/**
	* Adds an event handler for the "trigger" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	ontrigger: function (data, name, handler) {
		this.eventContainer().on(this.eventName(), data, name, handler);
	},

	ondeclaredtrigger: function (handler) {
		return this.ontrigger(null, Svidget.declaredHandlerName, handler);
	},

	/**
	 * Unregisters an event handler for the EventDesc object.
	 * @method
	 * @param {string} [type] - The event type i.e. "change", "paramremove". If not specified it is assumed it is for the event itself.
	 * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	 * @returns {boolean} - True if the event handler was successfully removed.
	*/
	off: function (type, handlerOrName) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handlerOrName = type;
			type = this.eventName();
		}
		this.eventContainer().off(type, handlerOrName);
	},

	/**
	* Removes an event handler for the "trigger" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offtrigger: function (handlerOrName) {
		this.eventContainer().off(this.eventName(), handlerOrName);
	},

	offdeclaredtrigger: function () {
		return this.offtrigger(Svidget.declaredHandlerName);
	},

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
	* Triggers the event for the EventDesc object.
	* @method
	* @param {object} value - The value to set to the Event.value property.
	*/
	// Note: The use of type as a param is undocumented here. For public use we only want them passing value as a param.
	trigger: function (type, value) {
		if (!this.enabled()) return;
		if (value === undefined) {
			value = type;
			type = this.eventName();
		}
		this.eventContainer().trigger(type, value);
	},

	triggerEvent: function (value) {
		this.trigger(this.eventName(), value);
	},

	// helpers

	/**
	* Serializes the EventDesc object for transport across a window boundary.
	* @method
	* @returns {boolean} - A generic serialized object representing the EventDesc object.
	*/
	toTransport: function () {
		var transport = {
			name: this.name(),
			description: this.description(),
			external: this.external(),
			enabled: this.enabled(),
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
		return "[Svidget.EventDesc { name: \"" + this.name + "\" }]";
	}

}

Svidget.EventDesc.eventTypes = ["trigger", "change"];
Svidget.EventDesc.optionProperties = ["external", "enabled", "description"];
Svidget.EventDesc.allProxyProperties = ["name", "external", "enabled", "description", "eventContainer"];
Svidget.EventDesc.writableProxyProperties = [];

Svidget.extend(Svidget.EventDesc, Svidget.ObjectPrototype);

