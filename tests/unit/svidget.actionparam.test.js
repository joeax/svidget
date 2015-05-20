/* Svidget.Param.Test
 * 
 * Tests the Svidget.Param class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {}, _from: "svidget.actionparam.test" }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.ActionParam tests', function () {
	
	var widget = svidget.$;
	var action = widget.addAction("action1");
	
	it('should exist', function () {
		// pre-test
		test.value(action).exists();
		test.value(action.params()).exists();
	});

	it('should be able to create an action param', function () {
		// sanity test 1
		var ap1 = action.newParam("boo", { defvalue: "hoo" });
		test.value(ap1.name()).is("boo");
		test.value(ap1.defvalue()).is("hoo");
	});
	
	it('should be able to create a complex action param', function () {
		// sanity test 2
		var options = {
			defvalue: {},
			description: "A complex boo param.",
			enabled: 1,
			type: "string",
			subtype: "choice",
			typedata: "a|b|c",
		};
		var ap1 = action.newParam("complexboo", options);
		
		// tests
		test.value(ap1.name()).is("complexboo");
		test.value(ap1.defvalue()).is({});
		test.value(ap1.description()).is("A complex boo param.");
		test.value(ap1.type()).is("string");
		test.value(ap1.subtype()).is("choice");
		test.value(ap1.typedata()).is("a|b|c");
		test.value(ap1.parent()).isIdenticalTo(action);
	});
	
	describe('Svidget.ActionParam.description() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertDescription(action.newParam("test1", { description: "this is description." }), "this is description.");
			assertDescription(action.newParam("test1", { description: 3 }), "3");
			assertDescription(action.newParam("test1", { description: false }), "false");
			assertDescription(action.newParam("test1", { description: { foo: "bar" } }), "{\"foo\":\"bar\"}");
			assertDescription(action.newParam("test1", { description: null }), null);
		});
		
		it('should be set as string when setting', function () {
			assertDescriptionSet(action.newParam("test1"), "this is description.", "this is description.");
			assertDescriptionSet(action.newParam("test1"), 3, "3");
			assertDescriptionSet(action.newParam("test1"), false, "false");
			assertDescriptionSet(action.newParam("test1"), { foo: "bar" }, "{\"foo\":\"bar\"}");
			assertDescriptionSet(action.newParam("test1"), null, null);
		});
	
	});
	
	describe('Svidget.ActionParam.name() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertName(action.newParam("test1"), "test1");
			assertName(action.newParam(3), "3");
			assertName(action.newParam(false), "false");
			assertName(action.newParam({ foo: "bar" }), "{\"foo\":\"bar\"}");
		});
		
		it('should not be modifiable', function () {
			var param = action.newParam("test1");
			var result = param.name("test1!!!");
			test.value(param.name()).is("test1");
			test.bool(result).isFalse();
		});
		
	});

	describe('Svidget.ActionParam.type() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertType(action.newParam("test1", { type: "string" }), "string");
			assertType(action.newParam("test1", { type: "bool" }), "boolean");
			assertType(action.newParam("test1", { type: "boolean" }), "boolean");
			assertType(action.newParam("test1", { type: "number" }), "number");
			assertType(action.newParam("test1", { type: "object" }), "object");
			assertType(action.newParam("test1", { type: "array" }), "array");
		});

		it('should default type to "object" if invalid and no value when passing in constructor', function () {
			assertType(action.newParam("test1"), "object");
			assertType(action.newParam("test1", { type: "blabla" }), "object");
		});

		it('should infer the type from defvalue if not set or invalid when passing in constructor', function () {
			assertType(action.newParam("test1", { defvalue: "hi there" }), "string");
			assertType(action.newParam("test1", { defvalue: 105.4 }), "number");
			assertType(action.newParam("test1", { defvalue: { foo: 3 } }), "object");
			assertType(action.newParam("test1", { defvalue: [1, 2, 3] }), "array");
			assertType(action.newParam("test1", { defvalue: false }), "boolean");
		});

		it('should support bool or boolean as valid type when passing in constructor', function () {
			assertType(action.newParam("test1", { type: "bool" }), "boolean");
			assertType(action.newParam("test1", { type: "boolean" }), "boolean");
		});

		it('should be set correctly when setting', function () {
			assertTypeSet(action.newParam("test1"), "string", "string");
			assertTypeSet(action.newParam("test1"), "object", "object");
		});
		
		it('should support bool or boolean as valid type when setting', function () {
			assertTypeSet(action.newParam("test1"), "bool", "boolean");
			assertTypeSet(action.newParam("test1"), "boolean", "boolean");
		});

		it('should not update when using an invalid type when setting', function () {
			assertTypeSet(action.newParam("test1", { type: "string" }), 3.33, "string");
			assertTypeSet(action.newParam("test1", { type: "string" }), "blabla", "string");
		});

		it('should update to default type of "object" when using null when setting ', function () {
			assertTypeSet(action.newParam("test1", { type: "string" }), null, "object");
		});

	});

	describe('Svidget.ActionParam.subtype() property', function () {
		
		it('should be set correctly as string when passing in constructor', function () {
			assertSubtype(action.newParam("test1", { subtype: "integer" }), "integer");
			assertSubtype(action.newParam("test1", { type: "bool", subtype: "regex" }), "regex");
			assertSubtype(action.newParam("test1", { type: "string", subtype: "choice" }), "choice");
			assertSubtype(action.newParam("test1", { type: "string", subtype: "notarealsubtype" }), "notarealsubtype");
			assertSubtype(action.newParam("test1", { type: "string", subtype: 3 }), "3");
		});

		it('should be set correctly even if invalid when passing in constructor', function () {
			assertSubtype(action.newParam("test1"), null);
			assertSubtype(action.newParam("test1", { type: "string", subtype: "notarealsubtype" }), "notarealsubtype");
		});

		it('should be set correctly as string when setting', function () {
			assertSubtypeSet(action.newParam("param1"), "regex", "regex");
			assertSubtypeSet(action.newParam("param1"), "choice", "choice");
			assertSubtypeSet(action.newParam("param1"), 45, "45");
		});
		
		it('should be set correctly even if invalid when setting', function () {
			assertDefvalueSet(action.newParam("param1", { type: "number", subtype: "integer" }), "notreally", "notreally");
		});


	});

	describe('Svidget.ActionParam.typedata() property', function () {
		
		it('should be set correctly as string when passing in constructor', function () {
			assertTypedata(action.newParam("test1", { typedata: "hello" }), "hello");
			assertTypedata(action.newParam("test1", { typedata: 56 }), "56");
		});

		it('should be set correctly as string when setting', function () {
			assertTypedataSet(action.newParam("param1"), "hello", "hello");
			assertTypedataSet(action.newParam("param1"), 56, "56");
		});

	});

	describe('Svidget.ActionParam.defvalue() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertDefvalue(action.newParam("param1"), undefined);
			assertDefvalue(action.newParam("param1", { defvalue: 0 }), 0);
			assertDefvalue(action.newParam("param1", { defvalue: 0 }), 0);
		});

		it('should be set correctly and not coerced when passing in constructor', function () {
			assertDefvalue(action.newParam("param1", { type: "number", coerce: true, defvalue: "foo" }), "foo");
			assertDefvalue(action.newParam("param1", { type: "string", coerce: true, defvalue: 0 }), 0);
		});

		it('should be set correctly when setting', function () {
			assertDefvalueSet(action.newParam("param1"), 0, 0);
			assertDefvalueSet(action.newParam("param1"), "foo", "foo");
		});

		it('should be set correctly and not coerced when setting', function () {
			assertDefvalueSet(action.newParam("param1", { type: "number", coerce: true }), 0, 0);
			assertDefvalueSet(action.newParam("param1", { type: "string", coerce: true }), 0, 0);
			assertDefvalueSet(action.newParam("param1", { type: "number", coerce: true }), "bar", "bar");
		});

	});
	
	describe('Svidget.ActionParam.toTransport() method', function () {

		it('should correctly return a transport with applicable proxy properties', function () {
			var param = action.newParam("myparam", {
				shortname: "m",
				type: "number",
				subtype: "integer",
				defvalue: 0
			});
			var transport = param.toTransport();
			// has properties
			test.object(transport)
							.hasProperty('name')
							.hasProperty('type')
							.hasProperty('subtype')
							.hasProperty('typedata')
							.hasProperty('defvalue');
			// test transport values
			test.value(transport.name).is("myparam");
			test.value(transport.type).is("number");
			test.value(transport.subtype).is("integer");
			test.value(transport.typedata).is(null);
			test.value(transport.defvalue).is(0);
		});

	});

	describe('Svidget.ActionParam.toString() method', function () {

		it('should correctly return a string representation calling manually', function () {
			test.value(action.newParam("myactionparam").toString()).is("[Svidget.ActionParam { name: \"myactionparam\" }]");
		});

		it('should correctly return a string representation coercing to string', function () {
			test.value(action.newParam("myactionparam") + "").is("[Svidget.ActionParam { name: \"myactionparam\" }]");
		});

	});

	describe('Svidget.ActionParam.change event', function () {
		
		it('should trigger when properties are changed', function () {
			var p = action.newParam("myparam");
			assertChangeEventTrigger(p, "defvalue", 67);
		});
		
		it('should trigger when properties are changed with event name and data', function () {
			var p = action.newParam("myparam", { defvalue: "(city)" });
			assertChangeEventTrigger(p, "defvalue", "City", true, { test: "data" }, "myhandler");
		});

		it('should not trigger when property value being set is the same as the current value', function () {
			var p = action.newParam("myparam", { description: "hello" });
			assertChangeEventTrigger(p, "description", "hello", false);
		});

	});


	// ASSERTERS
	

	function assertDescription(param, desc) {
		test.value(param.description()).is(desc);
		if (desc !== null) test.value(param.description()).isType('string');
	}
	
	function assertDescriptionSet(param, value, desc) {
		param.description(value);
		assertDescription(param, desc);
	}

	function assertEnabled(param, enabled) {
		test.value(param.enabled()).is(enabled);
	}
	
	function assertEnabledSet(param, value, enabled) {
		param.enabled(value);
		test.value(param.enabled()).is(enabled);
	}
	
	function assertName(param, name) {
		test.value(param.name()).is(name);
		test.value(param.name()).isType('string');
	}

	function assertType(param, type) {
		test.value(param.type()).is(type);
		test.value(param.type()).isType('string');
	}
	
	function assertTypeSet(param, type, expected) {
		param.type(type);
		assertType(param, expected);
	}

	function assertTypeAndValue(param, jstype, svtype, value) {
		test.value(param.value()).is(value);
		test.value(param.value()).isType(jstype);
		assertType(param, svtype);
		/*if (type == "array")
			test.value(param.value()).isArray(value);
		else
			test.value(param.value()).isType(type);*/
	}
	
	function assertValueTypeSet(param, type, value, expectedValue) {
		param.type(type);
		param.value(value);
		assertValue(param, expectedValue);
	}

	function assertDefvalue(param, value) {
		test.value(param.defvalue()).is(value);
	}

	function assertDefvalueSet(param, value, expected) {
		param.defvalue(value);
		test.value(param.defvalue()).is(expected);
	}

	function assertSubtype(param, value) {
		test.value(param.subtype()).is(value);
	}
	
	function assertSubtypeSet(param, value, expected) {
		param.subtype(value);
		test.value(param.subtype()).is(expected);
	}

	function assertTypedata(param, value) {
		test.value(param.typedata()).is(value);
	}
	
	function assertTypedataSet(param, value, expected) {
		param.typedata(value);
		test.value(param.typedata()).is(expected);
	}

	function assertChangeEventTrigger(param, prop, newValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var changed = false;
		param.onchange(eventData, eventName, function (e) {
			changed = true;
			var obj = e.value;
			test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
			test.value(obj.property).is(prop);
			test.value(obj.value).is(newValue);
			assertEventObject(e, eventData, eventName);
		});
		param[prop](newValue);
		test.value(changed).is(shouldTrigger);
	}

	function assertEventObject(e, eventData, eventName) {
		if (e.data === null)
			test.value(eventData).isNull();
		else
			test.value(e.data).isIdenticalTo(eventData);
		if (e.name === null)
			test.value(eventName).isNull();
		else
			test.value(e.name).isIdenticalTo(eventName);
	}

});