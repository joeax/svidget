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

Svidget.ActionProxy = function (name, options, parent) {
	var that = this;
	var valueObj = {
		name: name,
		params: new Svidget.ActionParamProxyCollection([], that)
	};
	options = options || {};
	// copy property values to privates
	for (var p in options) {
		if (valueObj[p] === undefined) valueObj[p] = options[p];
	}
	if (parent) parent = parent instanceof Svidget.WidgetReference ? parent : null; // parent can only be a WidgetReference
	Svidget.Proxy.apply(this, [parent, valueObj, Svidget.Action.allProxyProperties, Svidget.Action.writableProxyProperties]);
	this.__type = "Svidget.ActionProxy";

	// register callback from action to widget, for event bubbles
	this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionProxyBubble);

	// add/remove event handlers for params
	this.wireCollectionAddRemoveHandlers(valueObj.params, that.paramAdded, that.paramRemoved);
}


Svidget.ActionProxy.prototype = new Svidget.Proxy;
Svidget.extend(Svidget.ActionProxy, {

	invoke: function () {
		// build args obj from arguments
		if (!this.canInvoke()) return false;
		var args = Svidget.array(arguments);
		svidget.signalActionInvoke(this.parent(), this, args);
		return true;
	},

	canInvoke: function () {
		return this.getset("external");
	},

	invokeFromWidget: function (returnVal) {
		this.triggerFromWidget("invoke", { returnValue: returnVal }, this);
	},

	// action params
	// select by index: params(0)
	// select by name: params("color")
	// return read-only collection: params()
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	param: function (selector) {
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// internal
	addParam: function (nameOrObject, options) {
		return this.params().add(nameOrObject, options, this);
	},

	// internal
	removeParam: function (name) {
		return this.params().remove(name);
	},

	paramProxyBubble: function (type, event, param) {
		if (type == "change") this.paramChanged(param, event.value);
	},

	// private
	// eventValue ex = { property: "binding" }
	paramChanged: function (param, eventValue) {
		this.triggerFromWidget("paramchange", eventValue, param);
	},

	// handle param added
	paramAdded: function (param) {
		this.triggerFromWidget("paramadd", param);
	},

	// private
	// handle param removed
	paramRemoved: function (param) {
		this.triggerFromWidget("paramremove", param.name());
	},

	toString: function () {
		return "[Svidget.ActionProxy { name: \"" + this.name + "\" }]";
	}

}, true);


