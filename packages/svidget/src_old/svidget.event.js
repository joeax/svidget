/*****************************************
svidget.event.js

Contains common event functionality.

Dependencies:
(none)

******************************************/

/**
 * Represents an event triggers by the framework.
 * @class
 * @param {string} name - The name of the event as specified when registering a handler.
 * @param {string} type - The type of the event, like "actioninvoke", "eventtrigger" etc.
 * @param {object} data - An arbitrary object passed in when registering a handler.
 * @param {object} target - The framework object that is the latest object to trigger the event, i.e. do to an event bubble.
 * @param {object} origTarget - The framework object that originally triggered the event.
 * @param {object} value - The value associated with the event. This is specific to the type of event that was triggered.
 */
Svidget.Event = function (name, type, data, target, origTarget, value) {
	/**
	 * Gets the current object (param, action, etc) that currently triggered event (either original or current bubble target).
	*/
	Object.defineProperty(this, "currentTarget", Svidget.readOnlyProperty(target));
	/**
	 * Gets the data that was passed at bind time (writable).
	*/
	Object.defineProperty(this, "data", Svidget.fixedProperty(data));
	/**
	 * Gets the name of the handler specified at bind time (writable).
	*/
	Object.defineProperty(this, "name", Svidget.fixedProperty(name));
	/**
	 * Gets the date/time timestamp when the event was triggered.
	*/
	Object.defineProperty(this, "timeStamp", Svidget.readOnlyProperty(+new Date()));
	/**
	 * Gets the object (param, action, etc) that triggered event.
	*/
	Object.defineProperty(this, "target", Svidget.readOnlyProperty(origTarget == null ? target : origTarget));
	/**
	 * Gets the event type i.e. "invoke", "change", "actioninvoke", "eventtrigger" etc
	*/
	Object.defineProperty(this, "type", Svidget.readOnlyProperty(type));
	/**
	 * Gets the value specified at trigger time.
	*/
	Object.defineProperty(this, "value", Svidget.readOnlyProperty(value));
}

Svidget.Event.prototype = {

	/**
	 * Gets whether propagation was stopped on this event. When true this event will not bubble to parent.
	 * @method
	 * @returns {boolean}
	*/
	isPropagationStopped: Svidget.returnFalse,

	/**
	 * Gets whether immediate propagation was stopped on this event. When true, no futher handlers will be invoked and this event will not bubble to parent.
	 * @method
	 * @returns {boolean}
	*/
	isImmediatePropagationStopped: Svidget.returnFalse,

	/**
	 * Stops propagation for this event.
	 * @method
	*/
	stopPropagation: function () {
		this.isPropagationStopped = Svidget.returnTrue;
	},

	/**
	 * Stops immediate propagation for this event.
	 * @method
	*/
	stopImmediatePropagation: function () {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}

};



