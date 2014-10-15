/*****************************************
svidget.enums.js

Contains enum objects.

Dependencies:
(none)


******************************************/

// Enums

Svidget.DocType = {
	html: 0,
	svg: 1
};

// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#document
Svidget.DocReadyState = {
	loading: 0, //'loading',
	interactive: 1, //'interactive',
	complete: 2 //'complete'
};

Svidget.ElementReadyState = {
	uninitialized: 0,
	loading: 1, 
	loaded: 2, 
	interactive: 3,
	complete: 4 
};

Svidget.ParamTypes = {
	object: 0,
	string: 1,
	number: 2,
	bool: 3
};

Svidget.ParamSubTypes = {
	none: 0,
	color: 1,
	integer: 2,
	regex: 3
};

Svidget.NodeType = {
	element: 0,
	attribute: 1
};

Svidget.Namespaces = {
	html: "http://www.w3.org/1999/xhtml", // also used for HTML5
	svidget: "http://www.svidget.org/svidget", //todo: should be change to 2014? maybe not, just keep simple
	svg: "http://www.w3.org/2000/svg",
	xlink: "http://www.w3.org/1999/xlink"
};

