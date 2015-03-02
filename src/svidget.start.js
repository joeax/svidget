/*****************************************
svidget.start.js

The library entry point. 
Initializes svidget as a standalone browser module, or an AMD or Node/CommonJS module as needed.

******************************************/

// return a factory that actually creates the svidget instance
// this gives non-browser environments a chance to create the instance with their own window/DOM implementation
return function (root) {
	return new Svidget.Root(root);
}
//this.svidget = svidget;
//return svidget;