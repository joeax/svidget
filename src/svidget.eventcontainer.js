/*****************************************
svidget.eventcontainer.js

Acts as a container for event handlers.

Dependencies:
Svidget.EventPrototype

******************************************/


// Implements EventPrototype as a standalone object.

Svidget.EventContainer = function (typelist, target) {
	this.__type = "Svidget.EventContainer";
	Svidget.EventPrototype.apply(this, [typelist]);
	this.target = target;
}

Svidget.EventContainer.prototype = new Svidget.EventPrototype();
Svidget.extend(Svidget.EventContainer, {

	getTarget: function () {
		return this.target;
	}

}, true);

	