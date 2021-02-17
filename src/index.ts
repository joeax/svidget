/*****************************************
index.ts

The library entry point. 
Initializes svidget as the root library object.

******************************************/

// return the svidget root instance
// note: svidget requires root to define window-like behavior like window.parent and window.addEventListener
// svidget also requires a document property to be defined on root object
// i.e. global.document
// this can be jsdom or any DOM document implementation
if (!window.document) {
	console.warn("svidget requires a global windowy object with window.document to work correctly.");
}

export const svidget = Svidget.Root(window); //, createOptions);
