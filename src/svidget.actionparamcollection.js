/*****************************************
svidget.actionparamcollection.js

Defines a collection for ActionParam objects.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectCollection
Svidget.ActionParam


******************************************/

/* Namespaces */

Svidget.ActionParamCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ActionParam]);
	this.__type = "Svidget.ActionParamCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionParamCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionParamCollection, {

	create: function (name, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ActionParam(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

