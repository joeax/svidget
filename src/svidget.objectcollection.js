/*****************************************
svidget.objectcollection.js

Encapsulates a generic collection inherited by a complex collection.

Dependencies:
Svidget.Collection


******************************************/

/* Namespaces */

Svidget.ObjectCollection = function (array, type) {
	// todo: filter input array by type specified
	Svidget.Collection.apply(this, [array]);
	this.__type = "Svidget.ObjectCollection";

	// private fields
	var privates = new (function () {
		this.writable = ["addedFunc", "removedFunc"];
		this.type = type;
		this.addedFunc = null;
		this.removedFunc = null;
	})();
	// private accessors
	this.setup(privates);

}

var base = new Svidget.Collection;
Svidget.ObjectCollection.prototype = base;
Svidget.ObjectCollection.prototype.base_add = base.add;
Svidget.ObjectCollection.prototype.base_remove = base.remove;
Svidget.extend(Svidget.ObjectCollection, {

	// gets an item in the collection by its index (if number passed) or id/name (if string passed)
	get: function (selector) {
		if (typeof selector === "number") return col.getByIndex(selector);
		return col.getByName(selector);
	},

	getByIndex: function (index) {
		if (index == null || isNaN(index)) return null;
		index = parseInt(index);
		return this[index];
	},

	getByName: function (name) {
		return this.first(function (p) {
			return p.name() == name;
		});
	},

	type: function() {
		return this.getset("type");
	},

	// this returns the newly created object, or null
	add: function () {
		if (arguments.length == 0) return null;
		// call add overload
		var item;
		var arg0;
		var success;
		if (arguments.length >= 1) arg0 = arguments[0];
		if (typeof arg0 === "string") {
			item = this.create.apply(this, arguments);
			//success = item != null;
		}
		else {
			item = arg0;
			//success = this.addObject(arg0);
		}
		if (item == null) return null;
		success = this.addObject(item);
		if (!success) return null;
		// if succeeded, notify widget
		this.triggerAdded(item);

		return item;
	},

	addObject: function (obj) {
		// ensure obj is a valid Param
		if (obj == null || !obj instanceof this.type()) return false;
		// ensure no other parameter exists in the collection by that name
		if (obj.name !== undefined && this.getByName(obj.name()) != null) return false;
		// add to collection
		this.push(obj);
		return obj;
	},

	// returns the object added if successful, otherwise null
	create: function () {
		// override me
		return null;
	},

//		addCreate: function (name, value, options) {
//			// create param
//			// call addObject
//			if (name == null || !typeof name === "string") return false;
//			// ensure no other parameter exists in the collection by that name
//			if (this.getByName(name) != null) return false;
//			// create obj
//			var obj = new Svidget.Param(name, value, options);
//			this.push(obj);
//			return true;
//		},

	remove: function (name) {
		var item = this.getByName(name)
		if (item == null) return false;
		var success = this.base_remove(item);
		if (!success) return false;
		// if succeeded, notify widget
		this.triggerRemoved(item);
	},

	wrap: function (item) {
		var items = [item];
		if (item == null || !item instanceof this.type()) items = [];
		var col = new this.constructor(items, this.parent);
		return col;
	},

	// EVENTS

	// internal
	// wires up an internal handler when an item is added to the collection
	onAdded: function (func) {
		this.getset("addedFunc", func);
	},

	// internal
	// wires up an internal handler when an item is removed from the collection
	onRemoved: function (func) {
		this.getset("removedFunc", func);
	},

	// private
	triggerAdded: function (item) {
		var func = this.getset("addedFunc");
		if (func) func(item);
	},

	// private
	triggerRemoved: function (item) {
		var func = this.getset("removedFunc");
		if (func) func(item);
	},

}, true);   // overwrite base methods, copied above

Svidget.extend(Svidget.Collection, Svidget.ObjectPrototype);

//var base = new Svidget.Collection;
//Svidget.ParamCollection.prototype.base_add = base.add;
//Svidget.ParamCollection.prototype.base_remove = base.remove;

//Svidget.extend(Svidget.ParamCollection, base);


// tasks:
// - finish add() methods
// -


// prototype inheritance:
// http://dailyjs.com/2010/03/04/framework-part-2-oo/