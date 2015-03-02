/*****************************************
svidget.core.js

Contains the core framework elements.

 * todo: move browser support and prerequisites to main library header
Browser Support:
IE9+, FF?+, Chrome?+

Prerequisites:

Dependencies:
(none)

******************************************/

var VERSION = "0.2.3";

/* Global Namespace */

/**
 * Namespace for all Svidget library classes.
 * @namspace
 */
var Svidget = {};

// define window and document if needed
// note: global declared by closure
var window = global;
var document = window.document || {};


/* REGION Common Properties */

Svidget.root = window; // In server side environments may be global or jsdom-like window
Svidget.document = document; // In server side environments may be global.document or jsdom-like document
Svidget.version = VERSION;
Svidget.declaredHandlerName = "_declared";
Svidget.emptyArray = [];


/* REGION Special Shortcut Methods */

/** @function Svidget.array
    Builds an array from any collection, be it another array, HTMLCollection, etc. */
Svidget.array = function (anyCollection) {
	// oops, we need a collection with a length property
	if (!anyCollection || !anyCollection.length) return null;
	try {
		// this may blow up for IE8 and below and other less than modern browsers
		return Svidget.emptyArray.slice.call(anyCollection, 0);
	}
	catch (e) {
		// iterate the old fashioned way and push items onto array
		var res = [];
		for (var i = 0; i < anyCollection.length; i++) {
			res.push(anyCollection[i]);
		}
		return res;
	}
}

/** @function Svidget.isArray
    Determines if passed in object is actually an array. 
    This is a more relaxed check and handles the case when array is a Svidget.Collection and/or across frame boundaries */
Svidget.isArray = function (array) {
	return array != null && (Array.isArray(array) || Array.prototype.isPrototypeOf(array) || (array.length && array.push));
}

Svidget.isFunction = function (func) {
	return (typeof func === "function");
}

Svidget.isString = function (str) {
	return (typeof str === "string" || (str.length && str.trim && str.charAt));
}

Svidget.isColor = function (color) {
	// todo
	return false;
}

Svidget.convert = function (val, type, subtype, typedata) {
	return Svidget.Conversion.to(val, type, subtype, typedata);
}

/*
// SUMMARY
// Extends a class with members in the prototype object.
// REMARKS
// This is handle in a multiple prototype inheritance scenario. This function can be called for multiple prototypes.
// This is useful for extending native object prototypes as well.
*/
Svidget.extend = function (objtype, prototype, overwrite) {
	for (var methodName in prototype) {
		// do we check for hasOwnProperty here? 
		if (overwrite || objtype.prototype[methodName] === undefined) {
			objtype.prototype[methodName] = prototype[methodName];
		}
	}
}

Svidget.wrap = function (func, context) {
	// todo: use function.bind() if available
	// ensure func is function, return undefined if not
	if (func == null || (typeof func !== "function")) return undefined;
	// return a wrapper function
	var p = function () {
		return func.apply(context, arguments);
	};
	return p;
}

// Find the function by name in the specified scope, or just return it if is already a function
// By default scope == global scope
Svidget.findFunction = function (funcNameOrInstance, scope) {
	if (typeof funcNameOrInstance === "function") {
		return funcNameOrInstance;
	}
	if (scope == null) scope = Svidget.root; // global scope
	if (funcNameOrInstance != null) {
		var bind = funcNameOrInstance + ""; //coerce to string
		var func = scope[bind];
		if (func == null) return null;
		if (typeof func === "function") return func;
		// bind is an expression, so just wrap it in a function
		if (bind.substr(0, 7) != "return ")
			return new Function("return " + bind);
		else
			return new Function(bind);
	}
	return null;
}

Svidget.log = function (msg) {
	if (!Svidget.Settings.enableLogging) return;
	console.log(msg);
}

Svidget.readOnlyProperty = function (value) {
	return {
		enumerable: true,
		configurable: false,
		writable: false,
		value: value
	};
}

Svidget.fixedProperty = function (value) {
	return {
		enumerable: true,
		configurable: false,
		writable: true,
		value: value
	};
}

Svidget.getPrivateAccessor = function (privates) {
	return function (p) {
		return privates[p];
	};
}

Svidget.setPrivateAccessor = function (privates) {
	return function (p, val) {
		if (!privates.writable.contains(p)) return false;
		privates[p] = val;
		return true;
	};
}

Svidget.returnFalse = function () { return false; };
Svidget.returnTrue = function () { return true; };


/* REGION Settings */

Svidget.Settings = {};
Svidget.Settings.showPrivates = true; //show private members of objects, useful for debugging
Svidget.Settings.enableLogging = false; // whether console.logging is enabled, turn on for troubleshooting


/* REGION Prototypal Overrides */

if (!Array.prototype.contains) {
	Array.prototype.contains = function (obj) {
		var i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	}
};

// a note about "bla instanceof Array" checks, they don't work across frame boundaries
// so we use isArray
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

