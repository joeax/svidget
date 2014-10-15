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

Svidget.ActionParamProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ActionParamProxy]);
	this.__type = "Svidget.ActionParamProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionParamProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionParamProxyCollection, {

	create: function (name, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ActionParamProxy(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

