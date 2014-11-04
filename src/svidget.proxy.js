/*****************************************
svidget.proxy.js

Provides a base class for a proxy object, one that provides a lightweight facade to an original object across a processing boundary.

Extends: Svidget.ObjectPrototype

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype

******************************************/


/**
 * Encapsulates logic for a proxy object that is meant to shadow a concrete one.
 * @class
 * @abstract
 * @mixes ObjectPrototype
 * @memberof Svidget.Svidget
 * @param {object} parent - The parent to this object. Usually a Svidget.WidgetReference instance.
 * @param {object} options - An object containing values to initialize properties. Example: { enabled: true, description: "An event" }
 * @param {Array} propList - An array of all properties that the underlying object exposes to the proxy.
 * @param {Array} writePropList - An array of all writable properties that the underlying object exposes to the proxy. A subset of propList.
 * @param {Array} eventList - An array of all event types that this proxy listens for and/or response to based on the underlying object.
 */
/*
// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value
*/
Svidget.Proxy = function (parent, options, propList, writePropList, eventList) {
	this.__type = "Svidget.Proxy";
	var that = this;
	options = options || {};

	// convert to collections
	var propCol = new Svidget.Collection(Svidget.isArray(propList) ? propList : null);
	var writePropCol = new Svidget.Collection(Svidget.isArray(writePropList) ? writePropList : null);
	// filter so that writable properties are also contained in all properties
	writePropCol = writePropCol.where(function (i) { return propCol.contains(i); });

	// private fields
	var privates = {
		writable: writePropCol.toArray(),
		propertyChangeFuncs: new Svidget.Collection(),
		eventContainer: new Svidget.EventContainer(eventList, that),
		parent: parent,
		connected: options.connected == null ? true : !!options.connected // default to true
	};
	// private accessors
	this.setup(privates);

	// copy property values to privates
	for (var p in options) {
		if (privates[p] === undefined) {
			privates[p] = options[p];
		}
	}

	// load functions for each property onto this object
	for (var i=0; i<propCol.length; i++) {
		var prop = propCol[i] + "";
		if (prop.length > 0) {
			this[prop] = buildPropFunc(prop);
/*			this[prop] = function(val) { 
//				return this.getsetProp(prop+"", val); // the +""isn't for casting to string, but to not reference prop var directly
//			}; */
		}
	}

	function buildPropFunc(prop) {
		return function(val) { 
			return this.getsetProp(prop, val);
		};
	}

}

Svidget.Proxy.prototype = {

	/**
	 * Gets the parent object.
	 * @method
	 * @returns {Svidget.WidgetReference}
	*/
	parent: function () {
		var res = this.getPrivate("parent");
		return res;
	},

	propertyChangeFuncs: function () {
		return this.getPrivate("propertyChangeFuncs");
	},

	/**
	 * Gets whether the proxy is connected to its underlying widget counterpart.
	 * @method
	 * @returns {boolean}
	*/
	/*
	// Note: used by ParamProxy to determine if params from <params> elements or from Widget
	*/
	connected: function (val) {
		return this.getPrivate("connected");
	},

	// private
	// this is invoked when attempting to set a property value on the proxy itself
	// this in turn notifies the parent, which in turn notifies the widget
	getsetProp: function (prop, val) {
		var res = this.getset(prop, val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire propertyChange event
		// this.triggerPropertyChange(prop, val); // obsolete
		this.handlePropertyChange(prop, val);
		return true;
	},


	/**
	 * @abstract
	*/
	handlePropertyChange: function (name, val) {
		// override me
	},

	triggerPropertyChange: function (name, val) {
		// notifies root that property change, sends it to widget
		// invoke func(this, name, val)
		var funcList = this.propertyChangeFuncs();
		var that = this;
		funcList.each(function (func) { func(that, name, val); });
	},

	// private
	// this is invoked when the widget communicates that a property was changed
	notifyPropertyChange: function (name, val) {
		// notifies this proxy that property changed on widget
		if (name == null) return;
		// update value to match source
		this.getset(name, val);
		// trigger change event
		this.triggerFromWidget("change", { property: name, value: val }, this);
	},

	// internal
	// refreshes the proxy object with values from the widget
	refreshProperties: function (propObj) {
		for (var name in propObj) {
			var item = this.getPrivate(name);
			if (item != null) {
				this.setPrivate(name, propObj[name]);
			}
		}
	},

	/**
	 * Gets whether the proxy object is connected to its underlying object.
	 * @method
	 * @returns {boolean}
	*/
	connect: function () {
		this.setPrivate("connected", true);
	},

	// obsolete (9/1/2014)
	// use regular events ("change", "paramchange")
	onPropertyChange: function (func) {
		var funcList = this.propertyChangeFuncs();
		if (!typeof func === "function") return false;
		funcList.add(func);
		return true;
	},

	// obsolete (9/1/2014)
	// use regular events ("change", "paramchange")
	offPropertyChange: function (func) {
		var funcList = this.propertyChangeFuncs();
		return funcList.remove(func);
	},

	/* Proxy Events */

	eventContainer: function () {
		return this.getPrivate("eventContainer");
	},

	/**
	 * Registers an event handler for the proxy object.
	 * @method
	 * @param {string} type - The event type i.e. "change".
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	on: function (type, data, name, handler) {
		this.eventContainer().on(type, data, name, handler);
	},

	/**
	 * Unregisters an event handler for the proxy object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {string} type - The event type i.e. "change".
	 * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	 * @returns {boolean} - True if the event handler was successfully removed.
	*/
	off: function (type, handlerOrName) {
		this.eventContainer().off(type, handlerOrName);
	},

	// Note: no access to trigger() object events here, only from widget
	// this is invoked from the widget to signal that the event was triggered
	triggerFromWidget: function (type, value, originalTarget) {
		this.eventContainer().trigger(type, value, originalTarget);
	},

	registerBubbleCallback: function (types, bubbleTarget, callback) {
		this.eventContainer().registerBubbleCallback(types, bubbleTarget, callback);
	}
}

Svidget.extend(Svidget.Proxy, Svidget.ObjectPrototype);
