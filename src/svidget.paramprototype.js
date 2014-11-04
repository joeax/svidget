/*****************************************
svidget.paramprototype.js

Contains common functionality for param-based classes, namely Param and ActionParam.

Dependencies:
Svidget.EventPrototype
Svidget.ObjectPrototype
Svidget.Enums


******************************************/

/**
 * Encapsulates common functionality for a Param and ActionParam.
 * @class
 * @abstract
 * @memberof Svidget
 */
Svidget.ParamPrototype = {

	/**
	 * Gets the param name.
	 * @method
	 * @returns {string}
	*/
	/*
	// Note: name is immutable after creation
	*/
	name: function () {
		var res = this.getPrivate("name");
		return res;
	},

	/**
	 * Gets or sets the description.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	description: function (val) {
		var res = this.getset("description", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "description", value: val });

		return true;
	},

	/**
	 * Gets or sets the param type. This can be "string", "number", etc. See the Svidget.ParamTypes enum.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	type: function (val) {
		var res = this.getset("type", val, this.validateType);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "type", value: val });

		return true;
	},

	/**
	 * Gets or sets the param subtype. This can be on of the values from the Svidget.ParamSubTypes enum.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
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


