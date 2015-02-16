/*****************************************
svidget.conversion.js

Contains conversion methods to convert objects to different types.

******************************************/


/**
 * Handles conversion to/from different types.
 * @static
 * @memberof Svidget
 */
Svidget.Conversion = {};


// type == string type i.e. "string", "number"
Svidget.Conversion.to = function (val, type, subtype, typedata) {
	var t = Svidget.ParamTypes[type] || Svidget.ParamTypes.object;
	var st = Svidget.ParamSubTypes[subtype] || Svidget.ParamSubTypes.none;
	switch (t) {
		case Svidget.ParamTypes.string: return Svidget.Conversion.toString(val, st, typedata); // todo: coerce when subtype choice, default to first one
		case Svidget.ParamTypes.number: return Svidget.Conversion.toNumber(val, st == Svidget.ParamSubTypes.integer);
		case Svidget.ParamTypes.bool: return Svidget.Conversion.toBool(val);
		case Svidget.ParamTypes.array: return Svidget.Conversion.toArray(val);
		default: return Svidget.Conversion.toObject(val);
	}
}

/**
 * Converts any value to a string.
 * @static
 */
Svidget.Conversion.toString = function (val, subtype, typedata) {
	if (subtype == Svidget.ParamSubTypes.choice) return Svidget.Conversion.toChoiceString(val, typedata);
	if (Svidget.isArray(val) || typeof val === "object") return JSON.stringify(val);
	return val + "";
}

/**
 * Converts any value to a string.
 * @static
 */
Svidget.Conversion.toChoiceString = function (val, typedata) {
	if (!typedata) return null;
	var choices = typedata.split("|");
	if (choices == null || choices.length == 0) return null;
	if (choices.indexOf(val) >= 0) return val; // it's in the choice list so return it
	return choices[0]; //return default choice
}

/**
 * Converts any value to a number.
 * @static
 */
Svidget.Conversion.toNumber = function (val, isInt) {
	if (!val) return 0; // null, undefined, false all convert to 0
	if (val === true) return 1; // true converts to 1
	if (isInt) return parseInt(val + "");
	return +val;
}

/**
 * Converts any value to a bool.
 * @static
 */
Svidget.Conversion.toBool = function (val) {
	var strval = val + "";
	if (strval.toLowerCase() == "false") return false;
	if (+val === 0) return false;
	return !!val;
}

/**
 * Converts any value to a array.
 * @static
 */
Svidget.Conversion.toArray = function (val) {
	if (val == null) return val;
	// if val is array just return it
	if (Svidget.isArray(val)) return val;
	// if val is stringified array, JSON parse and return array
	if (Svidget.Conversion.isArrayString(val)) {
		var a = Svidget.Conversion.parseArray(val);
		if (a != null) return a;
	}
	// else wrap as an array
	return [val];
}

/**
 * Converts any value to a object.
 * @static
 */
Svidget.Conversion.toObject = function (val) {
	if (val == null) return val;
	// if val is valid JSON string, JSON parse and return array
	if (Svidget.Conversion.isJSONString(val)) {
		val = Svidget.Conversion.jsonifyString(val); // convert single to double chars or else parser chokes
		try {
			return JSON.parse(val);
		}
		catch (ex) {
			// oops, no JSON, no worries just return original value below
		}
	}
	// else return original val
	return val;
}

Svidget.Conversion.isJSONString = function (val) {
	// note: this doesn't check if its strictly JSON, just does a sanity check before attempting to convert
	if (!val) return false;
	val = val.trim();
	return (val.length > 0 && Svidget.isString(val) && val.charAt(0) == "{" && val.charAt(val.length - 1) == "}")
}

Svidget.Conversion.isArrayString = function (val) {
	if (!val) return false;
	val = val.trim();
	return (val.length > 0 && Svidget.isString(val) && val.charAt(0) == "[" && val.charAt(val.length - 1) == "]")
}

Svidget.Conversion.isQuotedString = function (val) {
	if (!val) return false;
	val = val.trim();
	return (val.length > 0 && Svidget.isString(val) &&
		((val.charAt(0) == "'" && val.charAt(val.length - 1) == "'") || (val.charAt(0) == "\"" && val.charAt(val.length - 1) == "\"")));
}

Svidget.Conversion.parseArray = function (val) {
	val = Svidget.Conversion.jsonifyString(val); // convert single to double chars or else parser chokes
	var wrap = "{\"d\":" + val + "}"; // note, this fails when the array uses single quotes
	try {
		var result = JSON.parse(wrap);
		if (result && result.d) return result.d;
		return null;
	}
	catch (ex) {
		// not an array after all
		return null;
	}
}

// ['hello', 'world']
// ['hello', 'world"it"']
// ['hello', ['world"it"']]
// ['he\'ll\'o', ['world"it"']]
// try this if below doesn't work: https://gist.github.com/thejsj/aad9c0392a59a7d87d9c
Svidget.Conversion.jsonifyString = function (val) {
	if (val == null || val.indexOf("'") < 0) return val;
	var SQ = "'";
	var DQ = "\"";
	var BS = "\\";
	var result = "";
	var inQuotes = false;
	var quoteChar = null;
	var escaped = false;
	var innerStr = null;

	for (var i = 0; i < val.length; i++) {
		var char = val[i];
		var newchar = char;
		// 'he\'ll\'o' => "he'll'o"
		// 'world"it"' => "world\"it\""
		if (char == SQ || char == DQ) {
			if (escaped) {
				if (quoteChar == SQ && char == SQ)
					result = result.substr(0, result.length - 1); // remove backslash for single quote escape
				else if (quoteChar == SQ && char == DQ) // add a backslash because one was there before for double quote i.e. 'hello\"there' => "hello\\\"there"
					newchar = BS + BS + DQ;
				escaped = false;
			}
			else {
				if (inQuotes && char == quoteChar) {
					inQuotes = false;
					quoteChar = null;
					newchar = DQ;
				}
				else if (inQuotes && char == DQ) {
					// handle case of 'world"it"' => "world\"it\"" need to add backslashes
					newchar = BS + DQ; // escape double quote
				}
				else if (!inQuotes) {
					quoteChar = char;
					inQuotes = true;
					newchar = DQ;
				}
			}
		}
		else if (char == BS) {
			escaped = true;
		}

		result += newchar;
	}

	return result;
}
