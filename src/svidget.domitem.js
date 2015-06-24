/*****************************************
svidget.domitem.js

Wraps a DOM element or attribute.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype

******************************************/

/**
 * Encapsulates a single DOM element or attribute.
 * @class
 * @param {object} source - A DOM element or attribute. Can be null
 */
/*
// An actual DOM element need not be provided.
// source can be an actual DOM element or attribute, or a object describing one. Object properties must match names.
*/
Svidget.DOMItem = function (source) {
	this.__type = "Svidget.DOMItem";
	source = source || {}; // default source to empty object
	// privates
	var privates = new (function () {
		this.writable = ["value"];
		this.type = null;
		this.typeCode = null;
		this.name = null;
		this.value = null;
		this.namespace = null;
		this.source = source;
		this.sourceDOM = Svidget.DOM.isDOMNode(source); // ? source : null;
	})();
	// private accessors
	this.setup(privates);

	/*function isSourceDOM(source) {
		if (source == null) return false;
		return (true && source.namespaceURI && source.localName && source.nodeType && (source.value || source.textContent) && (source.nodeType == 1 || source.nodeType == 2)); //!source.attributes || 
	}*/

	function getType(typeCode) {
		if (typeCode == Svidget.NodeType.element) return "element";
		if (typeCode == Svidget.NodeType.attribute) return "attribute";
		return null;
	}

	function getNamespaceType(namespace) {
		for (var n in Svidget.Namespaces) {
			if (namespace === Svidget.Namespaces[n]) return n;
		}
	}

	if (privates.sourceDOM) {
		privates.typeCode = source.nodeType == 1 ? Svidget.NodeType.element : source.nodeType == 2 ? Svidget.NodeType.attribute : null;
		privates.name = source.localName;
		privates.namespace = source.namespaceURI;
	}
	else {
		privates.typeCode = source.type;
		privates.name = source.name;
		privates.namespace = source.namespace;
	}
	privates.value = source.value || source.textContent;
	privates.type = getType(privates.typeCode);
	privates.namespaceType = getNamespaceType(privates.namespace);

	// build attributes
	this.cachedAttributes = null;
	// build child elements
	this.cachedElements = null;

}

Svidget.DOMItem.prototype = {

	typeCode: function () {
		return this.getset("type");
	},

	//	type: function () {
	//		var type = this.typeCode();
	//		if (type == Svidget.NodeType.element) return "element";
	//		if (type == Svidget.NodeType.attribute) return "attribute";
	//		return null;
	//	},

	/**
	 * Gets the element or attribute name of the item.
	 * @method
	 * @returns {string}
	*/
	name: function () {
		return this.getset("name");
	},

	/**
	 * Gets the element text content or the attribute value.
	 * @method
	 * @returns {string}
	*/
	value: function (val) {
		var source = this.source();
		if (val === undefined) return source.value || source.textContent;
		var strval = val + "";
		if (source.value)
			source.value = strval;
		else
			source.textContent = strval;
	},

	/**
	 * Gets the namespace URI for the element or attribute item.
	 * @method
	 * @returns {string}
	*/
	namespace: function () {
		return this.getset("namespace");
	},

	/**
	 * Gets the namespace type i.e. html, svg, xlink, svidget, etc.
	 * @method
	 * @returns {string}
	*/
	namespaceType: function () {
		return this.getset("namespaceType");
	},

	//	namespaceType: function () {
	//		var ns = this.namespace();
	//		for (var n in Svidget.Namespaces) {
	//			if (ns === Svidget.Namespaces[n]) return n;
	//		}
	//	},

	/**
	 * Gets whether the item has child elements.
	 * @method
	 * @returns {boolean}
	*/
	hasElements: function () {
		if (this.isAttribute()) return false;
		var source = this.source();
		if (this.isAttached() || (source.children && source.children.length)) {
			return source.children.length > 0;
		}
		return false;
	},

	/**
	 * Gets whether the item has attributes. False when the item is an attribute.
	 * @method
	 * @returns {boolean}
	*/
	hasAttributes: function () {
		if (this.isAttribute()) return false;
		var source = this.source();
		if (this.isAttached() || (source.attributes && source.attributes.length)) {
			return source.attributes.length > 0;
		}
		return false;
	},

	/**
	 * Gets whether the item is an attribute.
	 * @method
	 * @returns {boolean}
	*/
	isAttribute: function () {
		return this.type() == Svidget.NodeType.attribute;
	},

	/**
	 * Returns a collection of DOMItem objects representing child elements. Returns null if item is an attribute.
	 * @method
	 * @returns {Svidget.Collection} - the collection of DOMItems
	*/
	elements: function () {
		// lazy load
		if (this.cachedElements != null && Svidget.isArray(this.cachedElements)) return this.cachedElements;
		var isDOM = this.isAttached();
		var source = this.source();
		if (!isDOM && (!source.elements || !source.elements.length)) return null;
		var origcol = isDOM ? source.children : source.elements;
		var eles = new Svidget.Collection(Svidget.array(origcol));
		eles = eles.select(function (e) { return new Svidget.DOMItem(e); });
		this.cachedElements = eles;
		return this.cachedElements;
	},

	/**
	 * Returns a collection of DOMItem objects representing attributes. Returns null if item is an attribute.
	 * @method
	 * @returns {Svidget.Collection} - the collection of DOMItems
	*/
	attributes: function () {
		// lazy load
		if (this.cachedAttributes != null && Svidget.isArray(this.cachedAttributes)) return this.cachedAttributes;
		var isDOM = this.isAttached();
		var source = this.source();
		if (!isDOM && (!source.attributes || !source.attributes.length)) return null;
		var origcol = source.attributes;
		var attrs = new Svidget.Collection(Svidget.array(origcol));
		attrs = attrs.select(function (a) { return new Svidget.DOMItem(a); });
		this.cachedAttributes = attrs;
		return this.cachedAttributes;
	},

	/**
	 * Gets the underlying DOM object that this DOMItem instance wraps.
	 * @method
	 * @returns {(HTMLElement|HTMLAttribute)} - the underlying DOM object
	*/
	source: function () {
		return this.getset("source");
	},

	/**
	 * Returns whether the DOMItem actually wraps an underlying DOM object.
	 * @method
	 * @returns {Svidget.Collection} - the collection of DOMItems
	*/
	isAttached: function () {
		return this.getset("sourceDOM");
	}

}

// future item: extend EventPrototype when adding events to DOMItem.
Svidget.extend(Svidget.DOMItem, Svidget.ObjectPrototype);



