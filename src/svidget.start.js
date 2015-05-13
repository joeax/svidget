/*****************************************
svidget.start.js

The library entry point. 
Initializes svidget as a standalone browser module, or an AMD or Node/CommonJS module as needed.

******************************************/

// return a factory that actually creates the svidget instance
// this gives non-browser environments a chance to create the instance with their own window/DOM implementation
return function (window, options) {
	// note: svidget requires root to define window-like behavior like window.parent and window.addEventListener
	// svidget also requires a document property to be defined on root object
	// i.e. global.document
	// this can be jsdom or any DOM document implementation
	if (!window.document) {
		console.warn("svidget requires a global windowy object with window.document to work correctly.");
	}
	return new Svidget.Root(window, options);
}
