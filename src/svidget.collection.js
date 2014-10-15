/*****************************************
svidget.collection.js

Defines a generic collection that extends JavaScript Array.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core


******************************************/


Svidget.Collection = function (array) {
	this.__type = "Svidget.Collection";
	this.source = array;
	//this.baseType = Svidget.Collection;
	//	this.items = [];
	// append items from source to this instance
	if (array && (Svidget.isArray(array) || Array.prototype.isPrototypeOf(array))) {
		this.push.apply(this, array);
	}
}

Svidget.Collection.prototype = new Array;
Svidget.extend(Svidget.Collection, {

	any: function (predicate) {
		if (predicate == null) return this.length > 0;
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) return true;
		}
		return false;
	},

	all: function (predicate) {
		if (predicate == null) return false;
		for (var i = 0; i < this.length; i++) {
			if (!predicate(this[i])) return false;
		}
		return true;
	},

	contains: function (obj) {
		return this.indexOf(obj) >= 0;
	},

	each: function (operation) {
		for (var i = 0; i < this.length; i++) {
			var res = operation(this[i]);
			if (res === false) break; // if function returns false, it is requesting a break
		}
	},

	first: function (predicate) {
		if (this.length == 0) return null;
		if (predicate == null || !typeof predicate === "function") return this[0];
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) return this[i];
		}
		return null;
	},

	// Chainable
	select: function (selector) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			result.push(selector(this[i]));
		}
		return new Svidget.Collection(result);
	},

	// Chainable
	where: function (predicate) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) result.push(this[i]);
		}
		return new Svidget.Collection(result);
	},

	// others, if needed:
	// average
	// min
	// max
	// sum
	// agg (generic aggregate function)
	// concat
	// first
	// last
	// union
	// intersect
	// zip

	// modifiers

	add: function (obj) {
		var pos = this.indexOf(obj);
		if (pos >= 0) return false;
		this.push(obj);
		return true;
	},

	addRange: function (array) {
		if (!Svidget.isArray(array)) return false;
		this.push.apply(this, array);
		return true;
	},

	insert: function (obj, index) {
		if (index < 0 || index > this.length) return false;
		this.splice(index, 0, obj);
		return true;
	},

	remove: function (obj) {
		var pos = this.indexOf(obj);
		if (pos < 0) return false;
		this.splice(pos, 1);
		return true;
	},

	removeAll: function (obj) {
		var removed = false;
		while (this.remove(obj)) {
			removed = true;
		}
		return removed;
	},

	removeWhere: function (predicate) {
		var result = [];
		var removed = false;
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) result.push(this[i]);
		}
		for (var i = 0; i < result.length; i++) {
			removed = this.remove(result) || removed;
		}
		return removed;
	},

	// misc

	toArray: function () {
		var arr = [];
		for (var i = 0; i < this.length; i++) {
			arr.push(this[i]);
		}
		//var check = arr instanceof Array;
		//Svidget.log('is it array: ' + check);
		return arr;
	}

});
