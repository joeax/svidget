/*****************************************
svidget.paramproxycollection.js

Defines a collection for ParamProxy objects.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.ObjectCollection
Svidget.ParamProxy


******************************************/

/**
 * Represents a collection of ParamProxy objects.
 * @constructor
 * @augments ObjectCollection
 * @memberof Svidget
 * @param {array} array - An array of ParamProxy objects.
 * @param {Svidget.WidgetReference} parent - The WidgetReference instance that is the parent for this ParamProxy collection.
 */
Svidget.ParamProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ParamProxy]);
	this.__type = "Svidget.ParamProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ParamProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ParamProxyCollection, {

	create: function (name, value, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other parameter exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ParamProxy(name, value, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

