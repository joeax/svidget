/*****************************************
svidget.eventdesccollection.js

Defines a collection for ParamProxy objects.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.ObjectCollection
Svidget.ParamProxy


******************************************/

/**
 * Represents a collection of EventDescProxy objects.
 * @constructor
 * @augments ObjectCollection
 * @memberof Svidget
 * @param {array} array - An array of EventDescProxy objects.
 * @param {Svidget.WidgetReference} parent - The WidgetReference instance that is the parent for this EventDescProxy collection.
 */
Svidget.EventDescProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.EventDescProxy]);
	this.__type = "Svidget.EventDescProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.EventDescProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.EventDescProxyCollection, {

	create: function (name, options, parent) {
		if (name == null || !typeof name === "string") return null;
		// ensure no other parameter exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.EventDescProxy(name, options, parent);
		return obj;
	}

}, true); // overwrite base methods


