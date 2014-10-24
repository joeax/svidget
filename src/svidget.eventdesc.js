/*****************************************
svidget.action.js

Contains the core framework elements.

Dependencies:
Svidget.Core
Svidget.EventPrototype
Svidget.ObjectPrototype

******************************************/

// todo: rename to CustomEvent? no

Svidget.EventDesc = function (name, options, parent) {
	this.__type = "Svidget.EventDesc";
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	var that = this;
	// private fields
	var privates = new (function () {
		this.writable = ["description", "enabled", "external"];
		this.name = name;
		this.description = options.description;
		this.external = options.external !== false;
		this.enabled = options.enabled !== false;
		this.eventName = "trigger"; // this is the internal name we use for the event
		this.eventContainer = new Svidget.EventContainer([this.eventName], that);
	})();
	// private accessors
	this.setup(privates);

	// wire up event bubble parent
	privates.eventContainer.registerBubbleCallback(Svidget.EventDesc.eventTypes, parent, parent.eventBubble);
}

Svidget.EventDesc.prototype = {

	// name is immutable after creation
	name: function () {
		var res = this.getPrivate("name");
		return res;
	},

	// attached is a state property
	// gets whether the param is attached to the widget
	attached: function () {
		var widget = this.getset("widget");
		return this.widget != null && this.widget instanceof Svidget.Widget;
	},

	// in get mode: returns value
	// in set mode: returns true/false if set succeeded

	enabled: function (val) {
		var res = this.getset("enabled", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "enabled", value: val });

		return true;
	},

	description: function (val) {
		var res = this.getset("description", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "description", value: val });

		return true;
	},

	// when true, allows outside access to trigger the event, default is false
	external: function (val) {
		var res = this.getset("external", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "public", value: val });

		return true;
	},

	// actionables

	// private: used internally for a default event name for the container
	eventName: function() {
		return this.getPrivate("eventName");
	},

	eventContainer: function() {
		return this.getset("eventContainer");
	},

	// type, data, name, handler
	// type, data, handler
	// type, handler
	on: function (type, data, name, handler) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handler = type;
			type = this.eventName();
		}
		this.eventContainer().on(type, data, name, handler);
	},

	// todo: deprecate and use on(), adapt args
	// data, name, handler
	// data, handler
	// handler
	onTrigger: function (data, name, handler) {
		this.eventContainer().on(this.eventName(), data, name, handler);
	},

	off: function (type, handlerOrName) {
		// if type is function, then assume type not passes so use default event name
		if (Svidget.isFunction(type)) {
			handlerOrName = type;
			type = this.eventName();
		}
		this.eventContainer().off(type, handlerOrName);
	},

	// todo: deprecate and use off(), adapt args
	offTrigger: function (handlerOrName) {
		this.eventContainer().off(this.eventName(), handlerOrName);
	},

	// triggers the event, using the specified data as input
	trigger: function (type, value) {
		if (!this.enabled()) return;
		if (value === undefined) {
			value = type;
			type = this.eventName();
		}
		this.eventContainer().trigger(type, value);
	},

	triggerEvent: function (value) {
		this.trigger(this.eventName(), value);
	},

	// helpers

	toTransport: function () {
		var transport = {
			name: this.name(),
			description: this.description(),
			external: this.external(),
			enabled: this.enabled(),
		};
		return transport;
	},

	// overrides

	toString: function () {
		return "[Svidget.EventDesc { name: \"" + this.name + "\" }]";
	}

}

Svidget.EventDesc.eventTypes = ["trigger", "change"];
Svidget.EventDesc.optionProperties = ["external", "enabled", "description"];
Svidget.EventDesc.allProxyProperties = ["name", "external", "enabled", "description", "eventContainer"];
Svidget.EventDesc.writableProxyProperties = [];

Svidget.extend(Svidget.EventDesc, Svidget.ObjectPrototype);

