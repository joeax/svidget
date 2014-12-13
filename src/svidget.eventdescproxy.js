/*****************************************
svidget.eventdescproxy.js

Represents a wrapper to an actual param contained within a widget. Contains a cache of the properties of the param,
and maintains a constant sync between itself and its underlying param.

Extends: Svidget.Proxy

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.Param
Svidget.Proxy

******************************************/

/**
 * Represents a proxy to an EventDesc object.
 * @class
 * @augments Svidget.Proxy
 * @memberof Svidget
 * @param {string} name - The name of the event.
 * @param {object} options - The options for the event. Example: { enabled: true, description: "An event" }
 * @param {Svidget.WidgetReference} parent - The widget reference instance that is the parent for this event proxy.
 */
Svidget.EventDescProxy = function (name, options, parent) {
	var eventName = "trigger";
	var that = this;
	var valueObj = {
		name: name,
		eventName: eventName
		//eventContainer: new Svidget.EventContainer([eventName], that) // moved to Svidget.Proxy
	};
	options = options || {};
	// copy property values to privates
	for (var p in options) {
		if (valueObj[p] === undefined) valueObj[p] = options[p];
	}
	if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null; // parent can only be a WidgetReference
	Svidget.Proxy.apply(this, [parent, valueObj, Svidget.EventDesc.allProxyProperties, Svidget.EventDesc.writableProxyProperties]);
	this.__type = "Svidget.EventDescProxy";

	// register callback from action to widget, for event bubbles
	this.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventProxyBubble);
}


Svidget.EventDescProxy.prototype = new Svidget.Proxy;
Svidget.extend(Svidget.EventDescProxy, {

	triggerEventName: function () {
		return this.getPrivate("eventName");
	},

	/**
	 * Registers an event handler for the EventDescProxy object.
	 * @method
	 * @param {string} [type] - The event type i.e. "change". If not specified it is assumed it is for the event itself.
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	on: function (type, data, name, handler) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handler = type;
			type = this.triggerEventName();
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

	/**
	 * Unregisters an event handler for the EventDescProxy object.
	 * @method
	 * @param {string} [type] - The event type i.e. "change", "paramremove". If not specified it is assumed it is for the event itself.
	 * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	 * @returns {boolean} - True if the event handler was successfully removed.
	*/
	off: function (type, handlerOrName) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handlerOrName = type;
			type = this.triggerEventName();
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
	 * Triggers the event for the EventDesc object. Event must be external.
	 * @method
	 * @param {object} value - The value to set to the Event.value property.
	*/
	trigger: function (value) {
		// generally an event wouldn't be triggerable from outside, but we leave in the ability for testing purposes
		if (!this.canTrigger()) return false;
		svidget.signalEventTrigger(this.parent(), this, value);
		return true;
	},

	canTrigger: function () {
		return this.getset("external");
	},

	// overwrites: Svidget.Proxy.triggerFromWidget
	// this is invoked from the widget to signal that the event was triggered
	triggerEventFromWidget: function (value) {
		this.eventContainer().trigger(this.triggerEventName(), value);
	},

	// overrides

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.EventDescProxy { name: \"" + this.name + "\" }]";
	}

}, true);


