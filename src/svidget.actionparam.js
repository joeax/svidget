/*****************************************
svidget.actionparam.js

Defines a param for an action. This is similar to a param that acts as a method argument.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.ObjectPrototype
Svidget.EventPrototype
Svidget.Action

******************************************/


Svidget.ActionParam = function (name, options, parent) {
	this.__type = "Svidget.ActionParam";
	// validate:
	// name is not null
	options = options || {};

	// parent must be Action
	// todo: enforce

	// private fields
	var privates = new (function () {
		this.writable = ["type", "subtype", "description"];
		this.name = name;
		this.type = options.type || "string";
		this.subtype = options.subtype || null;
		this.description = options.description;
		this.parent = parent;
	})();
	// private accessors
	this.setup(privates);

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.ActionParam.eventTypes, parent, parent.paramBubble);
}

Svidget.ActionParam.prototype = {

	toTransport: function () {
		var transport = {
			name: this.name(),
			type: this.type(),
			subtype: this.subtype(),
			description: this.description()
		};
		return transport;
	},

	// overrides

	toString: function () {
		return "[Svidget.ActionParam { name: \"" + this.name + "\" }]";
	}

}

Svidget.ActionParam.eventTypes = ["change"];
Svidget.ActionParam.optionProperties = ["type", "subtype", "description"];
Svidget.ActionParam.allProxyProperties = ["name", "type", "subtype", "description"];
Svidget.ActionParam.writableProxyProperties = [];

Svidget.extend(Svidget.ActionParam, Svidget.ObjectPrototype);
Svidget.extend(Svidget.ActionParam, Svidget.ParamPrototype);
Svidget.extend(Svidget.ActionParam, new Svidget.EventPrototype(Svidget.ActionParam.eventTypes));

