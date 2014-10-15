/*****************************************
svidget.actionproxy.js

Represents a wrapper to an actual action contained within a widget. Contains a cache of the properties of the action,
and maintains a constant sync between itself and its underlying action.

Extends: Svidget.Proxy

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.Action
Svidget.Proxy

******************************************/

// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value

Svidget.ActionParamProxy = function (name, options, parent) {
	var that = this;
	var valueObj = {
		name: name
	};
	options = options || {};
	// copy property values to privates
	for (var p in options) {
		if (valueObj[p] === undefined) valueObj[p] = options[p];
	}
	if (parent) parent = parent instanceof Svidget.ActionProxy ? parent : null; // parent can only be a WidgetReference
	Svidget.Proxy.apply(this, [parent, valueObj, Svidget.ActionParam.allProxyProperties, Svidget.ActionParam.writableProxyProperties]);
	this.__type = "Svidget.ActionParamProxy";

	// register callback from action to widget, for event bubbles
	this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramProxyBubble);
}


Svidget.ActionParamProxy.prototype = new Svidget.Proxy;
Svidget.extend(Svidget.ActionParamProxy, {

	toString: function () {
		return "[Svidget.ActionParamProxy { name: \"" + this.name + "\" }]";
	}

}, true);


