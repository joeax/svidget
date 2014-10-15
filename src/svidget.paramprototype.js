/*****************************************
svidget.paramprototype.js

Contains common functionality for param-based classes.

Dependencies:
Svidget.EventPrototype

WidgetGraph.ParamPrototype

$WG.load()

******************************************/


Svidget.ParamPrototype = {

	// name is immutable after creation
	name: function () {
		var res = this.getPrivate("name");
		return res;
	},

	description: function (val) {
		var res = this.getset("description", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "description", value: val });

		return true;
	},

	type: function (val) {
		var res = this.getset("type", val, this.validateType);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "type", value: val });

		return true;
	},

	subtype: function (val) {
		var res = this.getset("subtype", val, this.validateSubtype);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "subtype", value: val });

		return true;
	},

	validateType: function (t) {
		if (!typeof t === "string") return false;
		return (Svidget.ParamTypes[t] != undefined);
	},

	validateSubtype: function (t) {
		if (!typeof t === "string") return false;
		return (Svidget.ParamSubTypes[t] != undefined);
	},

};


