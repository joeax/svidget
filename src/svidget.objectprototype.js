/*****************************************
svidget.objectprototype.js

Contains common prototype functionality for all common Svidget objects.

Dependencies:
svidget.core.js


******************************************/


Svidget.ObjectPrototype = {

	setup: function (privates) {
		this.getPrivate = Svidget.getPrivateAccessor(privates);
		this.setPrivate = Svidget.setPrivateAccessor(privates);
		if (Svidget.Settings.showPrivates) this.privates = privates;
	},

	getset: function (prop, val, validator) {
		// ** get mode
		var curProp = this.getPrivate(prop);
		if (val === undefined) return curProp;
		// ** set mode
		if (validator && !validator(val)) return false; // throw error?
		var oldProp = curProp;
		var success = this.setPrivate(prop, val);

		return success;
	},

	// should always return a collection
	select: function (col, selector) {
		if (typeof selector === "number") {
			selector = parseInt(selector); // coerce to integer
			return col.wrap(col.getByIndex(selector));
		}
		if (selector !== undefined) return col.wrap(col.getByName(selector + ""));
		// todo: should we clone collection?
		return col;
	},

	// should always return a single item
	selectFirst: function (col, selector) {
		if (typeof selector === "number") {
			selector = parseInt(selector); // coerce to integer
			return col.getByIndex(selector);
		}
		if (selector !== undefined) return col.getByName(selector + "");
		return col.first();
	},

	// protected
	wireCollectionAddRemoveHandlers: function(col, addFunc, removeFunc) {
		if (col == null) return;
		col.onAdded(Svidget.wrap(addFunc, this));
		col.onRemoved(Svidget.wrap(removeFunc, this));
		//col.onAdded(Svidget.wrap(function (i) {
		//	addFunc(i);
		//}, this));
		//col.onRemoved(Svidget.wrap(function (i) {
		//	removeFunc(i);
		//}, this));
	}

}


// prototype inheritance:
// http://dailyjs.com/2010/03/04/framework-part-2-oo/