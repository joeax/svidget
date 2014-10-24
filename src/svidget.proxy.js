/*****************************************
svidget.proxy.js

Provides a base class for a proxy object, one that provides a lightweight facade to an original object across a processing boundary.

Extends: Svidget.ObjectPrototype

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype

******************************************/


Svidget.Proxy = function (parent, valueObj, propList, writePropList, eventList) {
	this.__type = "Svidget.Proxy";
	var that = this;
	valueObj = valueObj || {};

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
		connected: valueObj.connected == null ? true : !!valueObj.connected // default to true
	};
	// private accessors
	this.setup(privates);

	// copy property values to privates
	for (var p in valueObj) {
		if (privates[p] === undefined) {
			privates[p] = valueObj[p];
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

	parent: function () {
		var res = this.getPrivate("parent");
		return res;
	},

	propertyChangeFuncs: function () {
		return this.getPrivate("propertyChangeFuncs");
	},

	// gets whether the proxy is connected to its underlying widget counterpart
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

	// sets the proxy object as connected to the widget
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

	on: function (type, data, name, handler) {
		this.eventContainer().on(type, data, name, handler);
	},

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
