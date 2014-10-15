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

/* Namespaces */

Svidget.ParamProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ParamProxy]);
	this.__type = "Svidget.ParamProxyCollection";
	
	var that = this;
	this.parent = parent;
	// handled in WidgetReference now
	//if (parent != null) {
	//	this.onAdded(function (p) {
	//		that.parent.paramProxyAdded(p);
	//	});
	//	this.onRemoved(function (p) {
	//		that.parent.paramProxyRemoved(p);
	//	});
	//}
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

