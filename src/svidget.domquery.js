/*****************************************
svidget.domquery.js

Contains the definition of the DOMQuery object, which acts as a container of one or more attributes or elements returned from a select query.

Dependencies:
Svidget.Core
Svidget.DOM
Svidget.DOMItem
Svidget.ObjectPrototype


******************************************/


/**
 * Represents the result of a DOM query. Chainable. Behaves similar to a jQuery object.
 * @class
 * @param {Array} domItemCollection - An array or array-like collection of DOMItem objects.
 * @param {string} selector - The selector used to get the items for this query.
 */
Svidget.DOMQuery = function (domItemCollection, selector) {
	this.__type = "Svidget.DOMQuery";
	var items = new Svidget.Collection(domItemCollection); // if domItemCollection not valid its ok, will just initialize an empty collection

	var privates = new (function () {
		this.writable = [];
		this.items = items;
		this.selector = selector;
	})();
	// private accessors
	this.getPrivate = Svidget.getPrivateAccessor(privates);
	this.setPrivate = Svidget.setPrivateAccessor(privates);

	// define length readonly property
	Object.defineProperty(this, "length", {
		enumerable: true,
		configurable: false,
		writable: false,
		value: items.length || 0
	});
}

Svidget.DOMQuery.prototype = {

	/**
	 * Gets the collection of items that are the result of the query.
	 * @method
	 * @returns {Svidget.Collection}
	*/
	items: function () {
		return this.getset("items");
	},

	/**
	 * Gets the item in the collection at the specified index.
	 * @method
	 * @param {number} index - The index
	 * @returns {Svidget.Collection}
	*/
	item: function (index) {
		var items = this.items();
		if (items == null) return null;
		return items[index];
	},

	/**
	 * Gets whether the collection has any items.
	 * @method
	 * @returns {boolean}
	*/
	hasItems: function () {
		//return this.items().length > 0;
		return this.length > 0;
	},

	/**
	 * Gets the selector string used for this query.
	 * @method
	 * @returns {string}
	*/
	selector: function () {
		return this.getset("selector");
	},

	/**
	 * Sets the value of each item in the collection.
	 * @method
	 * @returns {string}
	*/
	setValue: function (val) {
		this.items().each(function (i) {
			i.value(val);
		});
	},

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.DOMQuery { selector: \"" + this.selector() + "\", items: " + this.items().length + "}]";
	}

}

// note: down the road we may make this more like a jquery object
Svidget.extend(Svidget.DOMQuery, Svidget.ObjectPrototype);
