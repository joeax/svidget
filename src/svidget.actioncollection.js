/*****************************************
svidget.actioncollection.js

Defines a collection for Action objects.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectCollection
Svidget.Action

******************************************/

/**
 * Represents a collection of Action objects.
 * @class
 * @augments Svidget.ObjectCollection
 * @memberof Svidget.Svidget
 * @param {array} array - An array of Action objects.
 * @param {Svidget.Widget} parent - The Widget instance that is the parent for this Action collection.
 */
Svidget.ActionCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.Action]);
	this.__type = "Svidget.ActionCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionCollection, {

	create: function (name, options, parent) {
		// create action
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.Action(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

