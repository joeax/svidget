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
 * Represents a collection of EventDesc objects.
 * @constructor
 * @augments ObjectCollection
 * @memberof Svidget
 * @param {Svidget.EventDesc[]} array - An array of EventDesc objects.
 * @param {Svidget.Widget} parent - The Widget instance that is the parent for this EventDesc collection.
 */
Svidget.EventDescCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.EventDesc]);
	this.__type = "Svidget.EventDescCollection";
	
	var that = this;
	this.parent = parent;
	this._ctor = Svidget.EventDescCollection;
}

Svidget.EventDescCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.EventDescCollection, {

	create: function (name, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.EventDesc(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

