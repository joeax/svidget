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

Svidget.ActionCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.Action]);
	this.__type = "Svidget.ActionCollection";
	
	var that = this;
	this.parent = parent;
	// handled in Widget now
	//if (parent != null) {
	//	this.onAdded(function (a) {
	//		that.parent.actionAdded(a);
	//	});
	//	this.onRemoved(function (a) {
	//		that.parent.actionRemoved(a);
	//	});
	//}
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

