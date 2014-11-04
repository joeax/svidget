/*****************************************
svidget.actionparamproxycollection.js

Defines a collection for ActionParamProxy objects.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.ObjectCollection
Svidget.ParamProxy


******************************************/

/**
 * Represents a collection of ActionParamProxy objects.
 * @class
 * @augments Svidget.ObjectCollection
 * @memberof Svidget.Svidget
 * @param {array} array - An array of ActionParamProxy objects.
 * @param {Svidget.ActionProxy} parent - The ActionProxy instance that is the parent for this ActionParamProxy collection.
 */
Svidget.ActionParamProxyCollection = function (array, parent) {
	Svidget.ObjectCollection.apply(this, [array, Svidget.ActionParamProxy]);
	this.__type = "Svidget.ActionParamProxyCollection";
	
	var that = this;
	this.parent = parent;
}

Svidget.ActionParamProxyCollection.prototype = new Svidget.ObjectCollection;
Svidget.extend(Svidget.ActionParamProxyCollection, {

	create: function (name, options, parent) {
		if (name == null || !typeof name === "string") return null;
		// ensure no duplicates with same name, return null if true
		if (this.getByName(name) != null) return null;
		// create obj
		var obj = new Svidget.ActionParamProxy(name, options, parent);
		return obj;
	}

}, true); // overwrite base methods

