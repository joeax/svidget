/*****************************************
svidget.actionproxycollection.js

Defines a collection for ActionProxy objects.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.ObjectCollection
Svidget.Proxy

******************************************/

/**
 * Represents a collection of ActionProxy objects.
 * @class
 * @augments Svidget.ObjectCollection
 * @memberof Svidget.Svidget
 * @param {array} array - An array of ActionProxy objects.
 * @param {Svidget.WidgetReference} parent - The WidgetReference instance that is the parent for this ActionParamProxy collection.
 */
Svidget.ActionProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ActionProxy]);
	this.__type = "Svidget.ActionProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionProxyCollection, {

	create: function (name, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ActionProxy(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

