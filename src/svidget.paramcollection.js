/*****************************************
svidget.paramcollection.js

Defines a collection for Param objects.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectCollection
Svidget.Action

******************************************/

/**
 * Represents a collection of Param objects.
 * @constructor
 * @augments ObjectCollection
 * @memberof Svidget
 * @param {array} array - An array of Param objects.
 * @param {Svidget.Widget} parent - The Widget instance that is the parent for this Param collection.
 */
Svidget.ParamCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.Param]);
	this.__type = "Svidget.ParamCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ParamCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ParamCollection, {

	create: function (name, value, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other parameter exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.Param(name, value, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods



