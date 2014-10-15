/*****************************************
svidget.domquery.js

Contains the definition of the DOMQuery object, which acts as a container of one or more attributes or elements returned from a select query.

Dependencies:
Svidget.Core
Svidget.DOM
Svidget.ObjectPrototype


******************************************/


// SUMMARY
// Represents the result of a DOM query. Chainable.
// REMARKS
// Similar to a jQuery object
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

	items: function () {
		return this.getset("items");
	},

	item: function (index) {
		var items = this.items();
		if (items == null) return null;
		return items[index];
	},

	hasItems: function () {
		//return this.items().length > 0;
		return this.length > 0;
	},

	// returns the selector string used for this query
	selector: function () {
		return this.getset("selector");
	},

	setValue: function (val) {
		this.items().each(function (i) {
			i.value(val);
		});
	},

	toString: function () {
		return "[Svidget.DOMQuery { selector: \"" + this.selector() + "\", items: " + this.items().length + "}]";
	}

}
// extend Svidget.Collection?

// note: down the road we may make this more like a jquery object
Svidget.extend(Svidget.DOMQuery, Svidget.ObjectPrototype);
