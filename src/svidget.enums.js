/*****************************************
svidget.enums.js

Contains enum objects.

Dependencies:
(none)


******************************************/

// Enums

/**
 * Represents the DOM document type.
 * @enum
 * @readonly
 */
Svidget.DocType = {
	html: 0,
	svg: 1
};

/**
 * Represents the ready state for a document.
 * @enum
 * @readonly
 */
/*
// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#document
*/
Svidget.DocReadyState = {
	loading: 0, //'loading',
	interactive: 1, //'interactive',
	complete: 2 //'complete'
};

/**
 * Represents the ready state for an element.
 * @enum
 * @readonly
 */
Svidget.ElementReadyState = {
	uninitialized: 0,
	loading: 1, 
	loaded: 2, 
	interactive: 3,
	complete: 4 
};

/**
 * Represents the core types for a Param object.
 * @enum
 * @readonly
 */
Svidget.ParamTypes = {
	object: 0,
	string: 1,
	number: 2,
	bool: 3
};

/**
 * Represents the core subtypes for a Param object.
 * @enum
 * @readonly
 */
Svidget.ParamSubTypes = {
	none: 0,
	color: 1,
	integer: 2,
	regex: 3
};

/**
 * Represents the item type for an xml node.
 * @enum
 * @readonly
 */
Svidget.NodeType = {
	element: 0,
	attribute: 1
};

/**
 * Represents xml namespaces used by this framework.
 * @enum
 * @readonly
 */
Svidget.Namespaces = {
	html: "http://www.w3.org/1999/xhtml", // also used for HTML5
	svidget: "http://www.svidget.org/svidget",
	svg: "http://www.w3.org/2000/svg",
	xlink: "http://www.w3.org/1999/xlink"
};

