/*****************************************
svidget.paramproxy.js

Represents a wrapper to an actual param contained within a widget. Contains a cache of the properties of the param,
and maintains a constant sync between itself and its underlying param.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.Param
Svidget.Proxy

******************************************/


/**
 * Represents a proxy to an Param object.
 * @class
 * @augments Svidget.Proxy
 * @memberof Svidget
 * @param {string} name - The name of the param proxy.
 * @param {object} value - The value for the param proxy.
 * @param {object} options - The options for the param proxy. Example: { enabled: true, description: "An event" }
 * @param {Svidget.WidgetReference} parent - The widget reference that is the parent for this param.
 */
Svidget.ParamProxy = function (name, value, options, parent) {
	var valueObj = {
		name: name,
		value: value,
	};
	options = options || {};
	// copy property values to privates
	for (var p in options) {
		valueObj[p] = options[p];
	}
	if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null; // parent can only be a WidgetReference
	Svidget.Proxy.apply(this, [parent, valueObj, Svidget.Param.allProxyProperties, Svidget.Param.writableProxyProperties]);
	this.__type = "Svidget.ParamProxy";

	// register callback from action to widget, for event bubbles
	this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramProxyBubble);
}


Svidget.ParamProxy.prototype = new Svidget.Proxy;
Svidget.extend(Svidget.ParamProxy, {

	// overrides
	handlePropertyChange: function (name, val) {
		if (name == "value") {
			this.parent().updateParamValue(this.name(), val);
			svidget.signalPropertyChange(this.parent(), this, "param", name, val);
		}
	},

	// private
	// this is invoked when the widget communicates that a property was changed
	notifyValueChange: function (val) {
		// notifies this proxy that property changed on widget
		// update value to match source
		this.getset("value", val);
		// trigger change event
		this.triggerFromWidget("valuechange", { value: val }, this); // deprecated: set is the official event
		this.triggerFromWidget("set", { value: val }, this);
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

	/**
	* Removes an event handler for the "change" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offchange: function (handlerOrName) {
		this.off("change", handlerOrName);
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

	/**
	* Removes an event handler for the "set" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offset: function (handlerOrName) {
		return this.off("set", handlerOrName);
	},

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.ParamProxy { name: \"" + this.name + "\" }]";
	}

}, true);

