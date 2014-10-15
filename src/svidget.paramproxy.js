/*****************************************
svidget.paramproxy.js

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

// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value

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

	toString: function () {
		return "[Svidget.ParamProxy { name: \"" + this.name + "\" }]";
	}

}, true);

