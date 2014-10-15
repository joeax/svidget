/*****************************************
svidget.paramcollection.js

Contains the core framework elements.

Dependencies:
(none)

Browser Support:
IE9+, FF?+, Chrome?+

Prerequisites:


******************************************/

/* Namespaces */

Svidget.ParamCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.Param]);
	this.__type = "Svidget.ParamCollection";
	
	var that = this;
	this.parent = parent;
	// handled in Widget now
	//if (parent != null) {
	//	this.onAdded(function (p) {
	//		that.parent.paramAdded(p);
	//	});
	//	this.onRemoved(function (p) {
	//		that.parent.paramRemoved(p);
	//	});
	//}
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



