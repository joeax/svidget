;(function (global, factory) {
	
	if (typeof define === "function" && define.amd) {
		define(['svidget'], factory);//(global));
	}
	else if (typeof module === "object" && module.exports) {
		module.exports = factory;//(global);
	}
	else {
		// don't defer, instantiate svidget immediately
		// global === window
		global.svidget = factory(global);
	}
	
}(this, function(global, createOptions) {
//BODY//
}));