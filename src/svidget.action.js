/*****************************************
svidget.action.js

Defines an action entity for a widget.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.EventPrototype
Svidget.ObjectPrototype
Svidget.ActionParam
Svidget.ActionParamCollection
Svidget.Widget

******************************************/



Svidget.Action = function (name, options, parent) {
	this.__type = "Svidget.Action";
	// validate:
	// name is not null
	options = options || {};
	parent = parent instanceof Svidget.Widget ? parent : null; // parent can only be a Widget

	var that = this;
	// private fields
	var privates = new (function () {
		this.writable = ["binding", "enabled", "external", "description"];
		this.params = new Svidget.ActionParamCollection([], that);
		this.name = name;
		this.description = options.description;
		this.enabled = options.enabled !== false;
		this.binding = options.binding || null;
		this.external = options.external !== false;
		this.widget = parent;
		this.bindingFunc = null;
	})();
	// private accessors
	this.setup(privates);

	// todo: move to core or util
	this.buildBindingFunc = function (bind) {
		if (typeof bind === "function") {
			return bind;
		}
		else if (bind != null) {
			bind = bind + ""; //coerce to string
			var func = Svidget.root[bind];
			if (func == null) return null;
			if (typeof func === "function") return func;
			// bind is an expression, so just wrap it in a function
			if (bind.substr(0, 7) != "return ")
				return new Function("return " + bind);
			else 
				return new Function(bind);
			//try {
			//	return eval(options.binding);
			//}
			//catch (ex) {
			//	return undefined;
			//}
		}
		return null;
	}

	// create bindingFunc from binding
	// binding can be string or function
	privates.bindingFunc = this.buildBindingFunc(privates.binding);

	// wire up event bubble parent
	//if (parent && parent.actionBubble) {
	//	for (var i = 0; i < Svidget.Action.eventTypes.length; i++) {
	//		this.setBubbleParent(Svidget.Action.eventTypes[i], Svidget.wrap(parent.actionBubble, parent));
	//	}
	//}
	this.registerBubbleCallback(Svidget.Action.eventTypes, parent, parent.actionBubble);

	// add/remove event handlers for params
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);

}

Svidget.Action.prototype = {

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

	external: function (val) {
		var res = this.getset("external", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "external", value: val });

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

	binding: function (bind) {
		// todo: bind can be string or function, so check for both, enforce
		//bind = bind !== undefined ? bind + "" : undefined; // coerce to string
		var res = this.getset("binding", bind);
		// if undefined its a get so return value, if res is false then set failed
		if (bind === undefined || !!!res) return res;
		// fire "changed" event
		this.trigger("change", { property: "binding", value: val });

		return true;
	},

	bindingFunc: function () {
		var bind = this.binding();
		var func = this.buildBindingFunc(bind);
		return func;
	},

	// invocation

	invoke: function () {
		if (!this.enabled()) return false;
		var func = this.invocableBindingFunc();
		if (!func) return;
		var returnVal = func.apply(null, arguments); //Svidget.root, arguments);
		//var argObj = this.toArgumentObject(Svidget.array(arguments));
		this.trigger("invoke", { returnValue: returnVal });
		return true;
	},

	invokeApply: function (args) {
		this.invoke.apply(this, args);
	},

	invocableBindingFunc: function () {
		var func = this.bindingFunc();
		if (func == null || typeof func !== "function") return null;
		return func;
	},

	// build an object based on the action params, and values from arguments on invoke
	toArgumentObject: function (args) {
		var argsObj = {};
		var col = this.params();
		for (var i = 0; i < args.length; i++) {
			if (i >= col.length) break;
			var p = col[i];
			argsObj[p.name()] = args[i];
		}
		return argsObj;
	},

	// select by index: params(0)
	// select by name: params("color")
	// return read-only collection: params()
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	param: function (selector) {
		//var item = this.params(selector).first();
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// public
	addParam: function (name, options) {
		return this.params().add(name, options, this);
	},

	// public
	removeParam: function (name) {
		return this.params().remove(name);
	},

	paramBubble: function (type, event, param) {
		if (type == "change") this.paramChanged(param, event.value);
	},

	// handle param added
	paramChanged: function (param, eventValue) {
		Svidget.log('action: param changed: ' + param.name());
		this.trigger("paramchange", eventValue, param);
	},

	// handle param added
	paramAdded: function (param) {
		Svidget.log('action: param added: ' + param.name());
		this.trigger("paramadd", param);
	},

	// private
	// handle param removed
	paramRemoved: function (param) {
		Svidget.log('action: param removed: ' + param.name());
		this.trigger("paramremove", param.name());
	},

	// helpers

	toTransport: function () {
		var transport = {
			name: this.name(),
			description: this.description(),
			external: this.external(),
			enabled: this.enabled(),
			//binding: this.binding(), 
			params: this.toParamsTransport()
		};
		return transport;
	},

	toParamsTransport: function () {
		var col = this.params();
		var ps = col.select(function (p) { return p.toTransport(); }).toArray();
		return ps;
	},

	// overrides

	toString: function () {
		return "[Svidget.Action { name: \"" + this.name + "\" }]";
	}

}

Svidget.Action.eventTypes = ["invoke", "change", "paramchange", "paramadd", "paramremove"];
Svidget.Action.optionProperties = ["external", "binding", "enabled", "description"];
Svidget.Action.allProxyProperties = ["name", "external", "enabled", "description"];
Svidget.Action.writableProxyProperties = [];

Svidget.extend(Svidget.Action, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Action, new Svidget.EventPrototype(Svidget.Action.eventTypes));

