/*****************************************
svidget.event.js

Contains common event functionality.

Dependencies:
(none)

******************************************/




// delegation example:
// page with multiple widgets
// widget1 has finished loading, and triggers is loaded event
// parent


// note: this will not wrap browser events like jQuery so no need for original event object
// we may also create a DOMEvent object
// we will stick to Kinetic model for now

Svidget.Event = function (name, type, data, target, origTarget, value) {
	//this.data = data; 
	//this.name = name; // the name of the handler specified at bind time
	//this.target = target; 
	//this.timeStamp = +new Date();
	//this.type = type; 
	//this.value = null; 
	//this.widget = null; // not needed, they can infer from target

	// target: current object (param, action, etc) that currently triggered event (either original or current bubble target)
	Object.defineProperty(this, "currentTarget", Svidget.readOnlyProperty(target));
	// data: this is data that was passed at bind time (writable)
	Object.defineProperty(this, "data", Svidget.fixedProperty(data));
	// name: the name of the handler specified at bind time (writable)
	Object.defineProperty(this, "name", Svidget.fixedProperty(name));
	Object.defineProperty(this, "timeStamp", Svidget.readOnlyProperty(+new Date()));
	// target: object (param, action, etc) that triggered event
	Object.defineProperty(this, "target", Svidget.readOnlyProperty(origTarget == null ? target : origTarget));
	// type: i.e. "invoke", "change", "actioninvoke", "eventtrigger" etc
	Object.defineProperty(this, "type", Svidget.readOnlyProperty(type));
	// value: this is the value specified at trigger time
	Object.defineProperty(this, "value", Svidget.readOnlyProperty(value));
}

Svidget.Event.prototype = {

	isPropagationStopped: Svidget.returnFalse,

	isImmediatePropagationStopped: Svidget.returnFalse,

	stopPropagation: function () {
		this.isPropagationStopped = Svidget.returnTrue;
	},

	stopImmediatePropagation: function () {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}

};



