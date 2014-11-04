/*****************************************
svidget.domevent.js

Contains common event functionality.

Dependencies:
(none)

Note: This is a future item, and is not being used at this time.

******************************************/


Svidget.DOMEvent = function (name, type, data) {
	this.altKey = false;
	this.button = false;
	this.ctrlKey = false;
	this.data = data;
	this.name = name;
	this.target = null;
	this.timeStamp = +new Date();
	this.type = type;
	this.value = null;
	this.which = null;
	this.x = null;
	this.y = null;
}

// ???
Svidget.DOMEvent.prototype = eventPrototype;

// should we even have a DOMEvent
// or should we have user trigger an action, and pass pertinent event data to action?
// if jquery 2.0 supports being embedded in svg files, then we will defer to jquery for dom event management
// and be compatible with their objects


