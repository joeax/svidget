/*****************************************
svidget.actionparamproxy.js

Represents a wrapper to an actual action param contained within a widget action. Contains a cache of the properties of the action param.

Extends: Svidget.Proxy

Dependencies:
svidget.core
svidget.collection
svidget.objectprototype
svidget.action
svidget.proxy

******************************************/


/**
 * Represents a proxy to an ActionParam object.
 * @class
 * @augments Svidget.Proxy
 * @memberof Svidget
 * @param {string} name - The name of the action param.
 * @param {object} options - The options for the action param. Example: { type: "string", subtype: "regex", description: "An action param" }
 * @param {Svidget.WidgetReference} parent - The widget reference instance that is the parent for this action param proxy.
 */
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

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.ActionParamProxy { name: \"" + this.name + "\" }]";
	}

}, true);


