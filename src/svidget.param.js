/*****************************************
svidget.param.js

Contains the core framework elements.

Dependencies:
Svidget.Core
Svidget.EventPrototype
Svidget.ObjectPrototype

******************************************/


Svidget.Param = function (name, value, options, parent) {
	this.__type = "Svidget.Param";
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	// private fields
	var privates = new (function () {
		this.writable = ["binding", "enabled", "type", "subtype", "value", "description"];
		this.name = name;
		this.shortname = options.shortname;
		this.description = options.description;
		this.enabled = options.enabled !== false;
		this.type = options.type || "string";
		this.subtype = options.subtype || null;
		this.value = value;
		this.widget = parent;
		this.binding = options.binding || null;
		this.bindingQuery = null;
	})();
	// private accessors
	this.setup(privates);

	// target or binding
	privates.bindingQuery = Svidget.DOM.select(privates.binding);

	this.valuePopulated = false; // flipped to true once a value has been assigned or the default value is applied

	//this.isProxy;
	// maybe we do need a separate ParameterProxy class

	// wire up event bubble parent
	this.registerBubbleCallback(Svidget.Param.eventTypes, parent, parent.paramBubble);
}

Svidget.Param.prototype = {

	// moved to ParamPrototype

	// name is immutable after creation
//	name: function () {
//		var res = this.getPrivate("name");
//		return res;
	//	},

	//	type: function (val) {
	//		var res = this.getset("type", val, this.validateType);
	//		// if undefined its a get so return value, if res is false then set failed
	//		if (val === undefined || !!!res) return res;
	//		// fire "changed" event
	//		this.trigger("changed", { property: "type" });

	//		return true;
	//	},

	//	subtype: function (val) {
	//		var res = this.getset("subtype", val, this.validateSubtype);
	//		// if undefined its a get so return value, if res is false then set failed
	//		if (val === undefined || !!!res) return res;
	//		// fire "changed" event
	//		this.trigger("changed", { property: "subtype" });

	//		return true;
	//	},

	// name is immutable after creation
	shortname: function () {
		var res = this.getPrivate("shortname");
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

	value: function (val) {
		var res = this.getset("value", val, this.validateValue);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// check enabled
		if (!this.enabled()) return false;
		// todo: validate val using param.validate
		// apply to binding
		this.applyBinding(val);
		// fire "valuechange" event
		this.trigger("valuechange", { value: val });

		return true;
	},

	binding: function (bind) {
		bind = bind !== undefined ? bind + "" : undefined; // coerce to string
		var res = this.getset("binding", bind);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// todo: construct bindingQuery object
		this.getset("bindingQuery", Svidget.DOM.select(bind));
		// fire "changed" event
		this.trigger("change", { property: "binding", value: bind });

		return true;
	},

	bindingQuery: function () {
		return this.getset("bindingQuery");
	},

//	validateType: function (t) {
//		if (!typeof t === "string") return false;
//		return (Svidget.ParamTypes[t] != undefined);
//	},

//	validateSubtype: function (t) {
//		if (!typeof t === "string") return false;
//		return (Svidget.ParamSubTypes[t] != undefined);
//	},

	validateValue: function (val) {
		return true;
	},

	// helpers

	applyBinding: function (val) {
		var bind = this.bindingQuery();
		if (bind == null) return;
		bind.setValue(val);
	},

	toTransport: function () {
		var transport = {
			name: this.name(),
			shortname: this.shortname(),
			enabled: this.enabled(),
			type: this.type(),
			subtype: this.subtype(),
			value: this.value(),
			binding: this.binding()
		};
		return transport;
	},

	// overrides

	toString: function () {
		return "[Svidget.Param { name: \"" + this.name + "\" }]";
	}

	// todo: reactive version valueR returns function that always returns its live value

	/*type: function (t) {
	// ** get mode
	var curType = this.getPrivate("type");
	if (!t) curType;
	// ** set mode
	// only widget can change its parameter types
	// if (this.isProxy) throw error
	// validate t
	if (!this.validateType(t)) return false; // throw error?
	var oldType = curType;
	this.setPrivate("type", t);
	// fire "paramchanged" event
	this.trigger("changed");

	return true;
	},

	// in get mode: returns value
	// in set mode: returns true/false if set succeeded
	value: function (v) {
	// ** get mode
	var curValue = this.getPrivate("value");
	if (!v) curValue;
	// ** set mode
	// validate v
	// convert v to type
	var oldValue = curValue;
	this.setPrivate("value", v);
	// fire "populated" event
	this.trigger("populated");

	return true;
	},*/

}

// todo: convert these to functions so that users can't manipulate
Svidget.Param.eventTypes = ["valuechange", "change"];
Svidget.Param.optionProperties = ["type", "subtype", "binding", "enabled", "shortname"];
Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "binding", "enabled", "shortname"];
Svidget.Param.writableProxyProperties = ["value"];

Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));




/*


widget1.params("backgroundColor").value();

widget1.params["backgroundColor"].value();


*/