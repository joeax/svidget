/*****************************************
svidget.actionproxy.js

Represents a wrapper to an actual action contained within a widget. Contains a cache of the properties of the action,
and maintains a constant sync between itself and its underlying action.

Extends: Svidget.Proxy

Dependencies:
svidget.core.js
svidget.collection.js
svidget.objectprototype.js
svidget.action.js
svidget.proxy.js

******************************************/

/**
 * Represents a proxy to an Action object.
 * @class
 * @augments Svidget.Proxy
 * @memberof Svidget.Svidget
 * @param {string} name - The name of the action.
 * @param {object} options - The options for the action. Example: { enabled: true, description: "An action" }
 * @param {Svidget.WidgetReference} parent - The widget reference instance that is the parent for this action proxy.
 */
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

	/**
	 * Invokes the action. The params passes in will be passed to the action params in order.
	 * @method
	 * @param {...object} args - The arguments that correspond to action params.
	 * @returns {boolean} - True if invoke succeeds.
	*/
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

	/**
	 * Gets a collection of all ActionParamProxy objects, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * params(0)
	 * params("color")
	 * @method
	 * @param {(string|number)} [selector] - The selector string or integer.
	 * @returns {Svidget.ActionParamProxyCollection} - A collection based on the selector, or the entire collection.
	*/
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	/**
	 * Gets the ActionParamProxy based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * param(0)
	 * param("color")
	 * @method
	 * @param {(string|number)} selector - The index or ID of the param.
	 * @returns {Svidget.ActionParam} - The ActionParamProxy based on the selector. If selector is invalid, null is returned.
	*/
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
	* Adds an event handler for the "invoke" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	oninvoke: function (data, name, handler) {
		return this.on("invoke", data, name, handler);
	},

	/**
	* Removes an event handler for the "invoke" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offinvoke: function (handlerOrName) {
		return this.off("invoke", handlerOrName);
	},

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.ActionProxy { name: \"" + this.name + "\" }]";
	}

}, true);


