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

Svidget.ActionProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ActionProxy]);
	this.__type = "Svidget.ActionProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionProxyCollection, {

	create: function (name, options, parent) {
		// create param
		// call addObject
		if (name == null || !typeof name === "string") return null;
		// ensure no other action exists in the collection by that name
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ActionProxy(name, options, parent);
		//this.push(obj);
		return obj;
	}

}, true); // overwrite base methods

