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

// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value

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

	// overwrites: Svidget.Proxy.on
	on: function (type, data, name, handler) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handler = type;
			type = this.triggerEventName();
		}
		this.eventContainer().on(type, data, name, handler);
	},


	// todo: rename to on() adapt args
	// data, name, handler
	// data, handler
	// handler
	onTrigger: function (data, name, handler) {
		this.eventContainer().on(this.triggerEventName(), data, name, handler);
	},

	// overwrites: Svidget.Proxy.off
	off: function (type, handlerOrName) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handlerOrName = type;
			type = this.triggerEventName();
		}
		this.eventContainer().off(type, handlerOrName);
	},

	// todo: rename to off() adapt args
	offTrigger: function (handlerOrName) {
		this.eventContainer().off(this.triggerEventName(), handlerOrName);
	},

	// this is called at page level, to trigger the event (if external) on the widget
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

	toString: function () {
		return "[Svidget.EventDescProxy { name: \"" + this.name + "\" }]";
	}

}, true);


