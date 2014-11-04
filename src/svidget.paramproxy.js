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
		this.triggerFromWidget("valuechange", { value: val }, this);
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

