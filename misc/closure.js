;(function (global, factory) {
	// note: svidget requires root to define window-like behavior like window.parent and window.addEventListener
	// svidget also requires a document property to be defined on root object
	// i.e. global.document
	// this can be jsdom or any DOM document implementation
	if (!global.document) {
		console.warn("svidget requires a global windowy object with window.document to work correctly.");
	}
	
	if (typeof define === "function" && define.amd) {
		define(['svidget'], factory(global));
	}
	else if (typeof module === "object" && module.exports) {
		module.exports = factory(global);
	}
	else {
		global.svidget = factory(global)(global); //don't defer, instantiate svidget immediately
	}
	
}(this, function(global) {
//BODY//
}));