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
	name: function (val) {
		if (val !== undefined) return false; // they are trying to set, it should fail
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
		var res = this.getset("description", val, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("description"); // get converted value
		if (this.trigger) this.trigger("change", { property: "description", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the param type. This can be "string", "number", etc. See the Svidget.ParamTypes enum.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	type: function (val) {
		if (val === null) val = Svidget.resolveType(null); // rturns default type
		if (val == "bool") val = "boolean";
		var res = this.getset("type", val, "string", this.validateType);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("type"); // get converted value
		if (this.trigger) this.trigger("change", { property: "type", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the param subtype. This can be on of the values from the Svidget.ParamSubTypes enum.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	subtype: function (val) {
		var res = this.getset("subtype", val, "string", this.validateSubtype);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("subtype"); // get converted value
		if (this.trigger) this.trigger("change", { property: "subtype", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the type data associated with the subtype. This can be a regex pattern or choice string, among other things. 
	 * @method
	 * @param {string} [val] - Sets the typedata when specified.
	 * @returns {string} - The typedata when nothing is passed, or true/false if succeeded or failed when setting.
	*/
	typedata: function (val) {
		var res = this.getset("typedata", val, "string");
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		val = this.getPrivate("typedata"); // get converted value
		if (this.trigger) this.trigger("change", { property: "typedata", value: val });
		// set was successful
		return true;
	},

	/**
	 * Gets or sets the param defvalue. This is the default value if nothing (or undefined) is set.
	 * @method
	 * @param {string} [val] - Sets the value when specified.
	 * @returns {string} - The value for a get, or true/false if succeeded or failed for a set.
	*/
	defvalue: function (val) {
		var res = this.getset("defvalue", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "change" event
		if (this.trigger) this.trigger("change", { property: "defvalue", value: val });

		return true;
	},

	validateType: function (t) {
		if (!typeof t === "string") return false;
		return (Svidget.ParamTypes[t] !== undefined);
	},

	validateSubtype: function (t) {
		return true;
		// as of 0.3.0, no longer enforcing subtype
		/*
		//if (!typeof t === "string") return false;
		//return (Svidget.ParamSubTypes[t] !== undefined);
		*/
	},

	_resolveType: function(type, value, defvalue) {
		// infer the type from the value or defvalue
		value = value != null ? value : defvalue;
		if (type == null)
			type = Svidget.getType(value);
		else
			type = Svidget.resolveType(type); // normalize type to a valid type
		return type;
	}

};


