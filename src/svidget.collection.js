/*****************************************
svidget.collection.js

Defines a generic collection that extends JavaScript Array.

Last Updated: 03-Sep-2014

Dependencies:
svidget.core.js


******************************************/

/**
 * Represents a structured collection. Extends array by providing additional methods to select, tranverse, and modify an array.s
 * @constructor
 * @augments Array
 * @param {Array} array - The initial elements of the collection.
 */
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

	/**
	 * Returns true if any of the items satisfies the specified predicate function.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {boolean}
	*/
	any: function (predicate) {
		if (predicate == null) return this.length > 0;
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) return true;
		}
		return false;
	},

	/**
	 * Returns true if all of the items satisfies the specified predicate function.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {boolean}
	*/
	all: function (predicate) {
		if (predicate == null) return false;
		for (var i = 0; i < this.length; i++) {
			if (!predicate(this[i])) return false;
		}
		return true;
	},

	/**
	 * Returns true if the item is contained in the collection.
	 * @method
	 * @param {object} obj - The object to look for.
	 * @returns {boolean}
	*/
	contains: function (obj) {
		return this.indexOf(obj) >= 0;
	},

	/**
	 * Iterates on each item in the collection and performs the operation.
	 * @method
	 * @param {Function} operation - A function that accepts an item as input.
	*/
	each: function (operation) {
		for (var i = 0; i < this.length; i++) {
			var res = operation(this[i]);
			if (res === false) break; // if function returns false, it is requesting a break
		}
	},

	/**
	 * Returns the first item in the collection that satisfies the condition in the specified predicate function.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {object} - The item in the collection.
	*/
	first: function (predicate) {
		if (this.length == 0) return null;
		if (predicate == null || !typeof predicate === "function") return this[0];
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) return this[i];
		}
		return null;
	},

	/**
	 * Returns the last item in the collection that satisfies the condition in the specified predicate function.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {object} - The item in the collection.
	*/
	last: function (predicate) {
		if (this.length == 0) return null;
		if (predicate == null || !typeof predicate === "function") return this[0];
		for (var i = this.length-1; i >= 0; i--) {
			if (predicate(this[i])) return this[i];
		}
		return null;
	},

	/**
	 * Iterates on the collection calling the specified selector function and returns a new collection. Chainable.
	 * @method
	 * @param {Function} selector - A function that accepts an item as input and returns a value based on it.
	 * @returns {Svidget.Collection} - The result collection.
	*/
	select: function (selector) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			result.push(selector(this[i]));
		}
		return new Svidget.Collection(result);
	},

	/**
	 * Iterates on the collection calling the specified predicate filter function and returns a new collection. Chainable.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {Svidget.Collection} - The result collection.
	*/
	where: function (predicate) {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) result.push(this[i]);
		}
		return new Svidget.Collection(result);
	},

	/*
	// others, if needed:
	// average
	// min
	// max
	// sum
	// agg (generic aggregate function)
	// concat
	// union
	// intersect
	// zip
	*/

	// modifiers

	/**
	 * Adds an item to the collection.
	 * @method
	 * @param {object} obj - The item to add.
	 * @returns {boolean} - True if add succeeds.
	*/
	add: function (obj) {
		var pos = this.indexOf(obj);
		if (pos >= 0) return false;
		this.push(obj);
		return true;
	},

	/**
	 * Adds an array of items to the collection.
	 * @method
	 * @param {Array} array - The items to add.
	 * @returns {boolean} - True if add succeeds.
	*/
	addRange: function (array) {
		if (!Svidget.isArray(array)) return false;
		this.push.apply(this, array);
		return true;
	},

	/**
	 * Inserts an item to the collection at the specified index.
	 * @method
	 * @param {object} obj - The item to add.
	 * @param {number} index - The items to add.
	 * @returns {boolean} - True if add succeeds.
	*/
	insert: function (obj, index) {
		index = parseInt(index);
		if (!isNaN(index) && (index < 0 || index > this.length)) return false;
		this.splice(index, 0, obj);
		return true;
	},

	/**
	 * Removes an item from the collection. Only removes the first instance of the item found.
	 * @method
	 * @param {object} obj - The item to remove.
	 * @returns {boolean} - True if remove succeeds.
	*/
	remove: function (obj) {
		var pos = this.indexOf(obj);
		if (pos < 0) return false;
		this.splice(pos, 1);
		return true;
	},

	/**
	 * Removes an item from the collection. Removes all instances of the item.
	 * @method
	 * @param {object} obj - The item to remove.
	 * @returns {boolean} - True if remove succeeds.
	*/
	removeAll: function (obj) {
		var removed = false;
		while (this.remove(obj)) {
			removed = true;
		}
		return removed;
	},
	
	/**
	 * Clears all items in the collection.
	 * @method
	 * @returns {boolean} - True after collection cleared.
	*/
	clear: function () {
		this.splice(0, this.length);
		return true;
	},

	/**
	 * Removes an item from the collection based on the specified predicate function.
	 * @method
	 * @param {Function} predicate - A function that accepts an item as input and returns true/false.
	 * @returns {boolean} - True if remove succeeds.
	*/
	removeWhere: function (predicate) {
		var result = [];
		var removed = false;
		for (var i = 0; i < this.length; i++) {
			if (predicate(this[i])) result.push(this[i]);
		}
		for (var i = 0; i < result.length; i++) {
			removed = this.remove(result[i]) || removed;
		}
		return removed;
	},

	// misc

	/**
	 * Returns a new array based on items in the collection.
	 * @method
	 * @returns {Array}
	*/
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
