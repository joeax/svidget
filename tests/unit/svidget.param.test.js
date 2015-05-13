/* Svidget.Param.Test
 * 
 * Tests the Svidget.Param class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {} }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.Param tests', function () {
	
	var widget = svidget.$;
	
	it('should exist', function () {
		// pre-test
		test.value(widget).exists();
		test.value(widget.params()).exists();
	});

	it('should be able to create a param', function () {
		// sanity test 1
		var p1 = widget.newParam("boo", 100);
		test.value(p1.name()).is("boo");
		test.value(p1.value()).is(100);
	});
	
	it('should be able to create a complex param', function () {
		// sanity test 2
		var options = {
			defvalue: {},
			description: "A complex boo param.",
			enabled: 1,
			coerce: false,
			shortname: "cb",
			type: "object"
		};
		var p1 = widget.newParam("complexboo", { foo: "bar" }, options);
		
		// tests
		test.value(p1.name()).is("complexboo");
		test.value(p1.value()).is({ foo: "bar" });
		test.value(p1.defvalue()).is({});
		test.value(p1.description()).is("A complex boo param.");
		test.value(p1.enabled()).is(true);
		test.value(p1.coerce()).is(false);
		test.value(p1.shortname()).is("cb");
		test.value(p1.type()).is("object");
	});
	
	describe('Svidget.Param.coerce() property', function () {
		
		it('should set to true when passing value other than false in constructor', function () {
			assertCoerce(widget.newParam("test1", "foo", { coerce: true }), true);
			assertCoerce(widget.newParam("test1", "foo", { coerce: "X" }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertCoerce(widget.newParam("test1", "foo", { coerce: false }), false);
			assertCoerce(widget.newParam("test1", "foo", { coerce: "false" }), false);
			assertCoerce(widget.newParam("test1", "foo", { coerce: null }), false);
		});
		
		it('should set to true when using value other than false', function () {
			assertCoerceSet(widget.newParam("test1", "foo"), true, true);
			assertCoerceSet(widget.newParam("test1", "foo"), "X", true);
		});
		
		it('should set to false when using false or "false"', function () {
			assertCoerceSet(widget.newParam("test1", "foo"), false, false);
			assertCoerceSet(widget.newParam("test1", "foo"), "false", false);
			assertCoerceSet(widget.newParam("test1", "foo"), null, false);
		});
		
	});
	
	describe('Svidget.Param.description() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertDescription(widget.newParam("test1", "foo", { description: "this is description." }), "this is description.");
			assertDescription(widget.newParam("test1", "foo", { description: 3 }), "3");
			assertDescription(widget.newParam("test1", "foo", { description: false }), "false");
			assertDescription(widget.newParam("test1", "foo", { description: { foo: "bar" } }), "{\"foo\":\"bar\"}");
			assertDescription(widget.newParam("test1", "foo", { description: null }), null);
		});
		
		it('should be set as string when setting', function () {
			assertDescriptionSet(widget.newParam("test1", "foo"), "this is description.", "this is description.");
			assertDescriptionSet(widget.newParam("test1", "foo"), 3, "3");
			assertDescriptionSet(widget.newParam("test1", "foo"), false, "false");
			assertDescriptionSet(widget.newParam("test1", "foo"), { foo: "bar" }, "{\"foo\":\"bar\"}");
			assertDescriptionSet(widget.newParam("test1", "foo"), null, null);
		});
	
	});

	describe('Svidget.Param.enabled() property', function () {

		it('should set to true when passing value other than false in constructor', function () {
			assertEnabled(widget.newParam("test1", "foo", { enabled: true }), true);
			assertEnabled(widget.newParam("test1", "foo", { enabled: "X" }), true);
			assertEnabled(widget.newParam("test1", "foo", { enabled: null }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertEnabled(widget.newParam("test1", "foo", { enabled: false }), false);
			assertEnabled(widget.newParam("test1", "foo", { enabled: "false" }), false);
		});		
		
		it('should set to true when using value other than false', function () {
			assertEnabledSet(widget.newParam("test1", "foo"), true, true);
			assertEnabledSet(widget.newParam("test1", "foo"), "X", true);
			assertEnabledSet(widget.newParam("test1", "foo"), null, true);
		});

		it('should set to false when using false or "false"', function () {
			assertEnabledSet(widget.newParam("test1", "foo"), false, false);
			assertEnabledSet(widget.newParam("test1", "foo"), "false", false);
		});

	});
	
	describe('Svidget.Param.name() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertName(widget.newParam("test1", null), "test1");
			assertName(widget.newParam(3, null), "3");
			assertName(widget.newParam(false, null), "false");
			assertName(widget.newParam({ foo: "bar" }, null), "{\"foo\":\"bar\"}");
		});
		
		it('should not be modifiable', function () {
			var param = widget.newParam("test1");
			var result = param.name("test1!!!");
			test.value(param.name()).is("test1");
			test.bool(result).isFalse();
		});
		
		// plan to generate a name
		/*it('should throw error null or undefined when passing in constructor', function () {
			test.value(widget.newParam()).isNull();
			test.value(widget.newParam(null)).isNull();
			test.value(widget.newParam(null, null)).isNull();
		}); */
		
	});
	
	describe('Svidget.Param.shortname() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertShortname(widget.newParam("test1", null, { shortname: "t" }), "t");
			assertShortname(widget.newParam("test1", null, { shortname: 3 }), "3");
			assertShortname(widget.newParam("test1", null, { shortname: false }), "false");
			assertShortname(widget.newParam("test1", null, { shortname: { foo: "bar" } }), "{\"foo\":\"bar\"}");
		});
		
		it('should be set as string when setting', function () {
			assertShortnameSet(widget.newParam("test1", null), "t", "t");
			assertShortnameSet(widget.newParam("test1", null), 3, "3");
			assertShortnameSet(widget.newParam("test1", null), false, "false");
			assertShortnameSet(widget.newParam("test1", null), { foo: "bar" }, "{\"foo\":\"bar\"}");
		});
		
	});

	describe('Svidget.Param.type() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertType(widget.newParam("test1", null, { type: "string" }), "string");
			assertType(widget.newParam("test1", null, { type: "bool" }), "boolean");
			assertType(widget.newParam("test1", null, { type: "boolean" }), "boolean");
			assertType(widget.newParam("test1", null, { type: "number" }), "number");
			assertType(widget.newParam("test1", null, { type: "object" }), "object");
			assertType(widget.newParam("test1", null, { type: "array" }), "array");
		});

		it('should default type to "object" if invalid and no value when passing in constructor', function () {
			assertType(widget.newParam("test1", null), "object");
			assertType(widget.newParam("test1", null, { type: "blabla" }), "object");
		});

		it('should infer the type from value if not set or invalid when passing in constructor', function () {
			assertType(widget.newParam("test1", "hi there"), "string");
			assertType(widget.newParam("test1", 105.4), "number");
			assertType(widget.newParam("test1", { foo: 3 }), "object");
			assertType(widget.newParam("test1", [1, 2, 3]), "array");
			assertType(widget.newParam("test1", false), "boolean");
		});

		it('should infer the type from defvalue if not set or invalid and value not set when passing in constructor', function () {
			assertType(widget.newParam("test1", null, { defvalue: "hi there" }), "string");
			assertType(widget.newParam("test1", null, { defvalue: 105.4 }), "number");
			assertType(widget.newParam("test1", null, { defvalue: { foo: 3 } }), "object");
			assertType(widget.newParam("test1", null, { defvalue: [1, 2, 3] }), "array");
			assertType(widget.newParam("test1", null, { defvalue: false }), "boolean");
		});

		it('should support bool or boolean as valid type when passing in constructor', function () {
			assertType(widget.newParam("test1", null, { type: "bool" }), "boolean");
			assertType(widget.newParam("test1", null, { type: "boolean" }), "boolean");
		});

		it('should be set correctly when setting', function () {
			assertTypeSet(widget.newParam("test1", "bar"), "string", "string");
			assertTypeSet(widget.newParam("test1", "bar"), "object", "object");
		});
		
		it('should support bool or boolean as valid type when setting', function () {
			assertTypeSet(widget.newParam("test1", "bar"), "bool", "boolean");
			assertTypeSet(widget.newParam("test1", "bar"), "boolean", "boolean");
		});

		it('should not update when using an invalid type when setting', function () {
			assertTypeSet(widget.newParam("test1", "bar", { type: "string" }), 3.33, "string");
			assertTypeSet(widget.newParam("test1", "bar", { type: "string" }), "blabla", "string");
		});

		it('should update to default type of "object" when using null when setting ', function () {
			assertTypeSet(widget.newParam("test1", "bar", { type: "string" }), null, "object");
		});

	});

	describe('Svidget.Param.subtype() property', function () {
		
		it('should be set correctly as string when passing in constructor', function () {
			assertSubtype(widget.newParam("test1", null, { subtype: "integer" }), "integer");
			assertSubtype(widget.newParam("test1", null, { type: "bool", subtype: "regex" }), "regex");
			assertSubtype(widget.newParam("test1", null, { type: "string", subtype: "choice" }), "choice");
			assertSubtype(widget.newParam("test1", null, { type: "string", subtype: "notarealsubtype" }), "notarealsubtype");
			assertSubtype(widget.newParam("test1", null, { type: "string", subtype: 3 }), "3");
		});

		it('should be set correctly even if invalid when passing in constructor', function () {
			assertSubtype(widget.newParam("test1", null), null);
			assertSubtype(widget.newParam("test1", null, { type: "string", subtype: "notarealsubtype" }), "notarealsubtype");
		});

		it('should be set correctly as string when setting', function () {
			assertSubtypeSet(widget.newParam("param1", 3), "regex", "regex");
			assertSubtypeSet(widget.newParam("param1", "bar"), "choice", "choice");
			assertSubtypeSet(widget.newParam("param1", "bar"), 45, "45");
		});
		
		it('should be set correctly even if invalid when setting', function () {
			assertDefvalueSet(widget.newParam("param1", 3, { type: "number", subtype: "integer" }), "notreally", "notreally");
		});


	});

	describe('Svidget.Param.typedata() property', function () {
		
		it('should be set correctly as string when passing in constructor', function () {
			assertTypedata(widget.newParam("test1", null, { typedata: "hello" }), "hello");
			assertTypedata(widget.newParam("test1", null, { typedata: 56 }), "56");
		});

		it('should be set correctly as string when setting', function () {
			assertTypedataSet(widget.newParam("param1", 3), "hello", "hello");
			assertTypedataSet(widget.newParam("param1", "bar"), 56, "56");
		});

	});

	describe('Svidget.Param.defvalue() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertDefvalue(widget.newParam("param1", 3), undefined);
			assertDefvalue(widget.newParam("param1", 3, { defvalue: 0 }), 0);
			assertDefvalue(widget.newParam("param1", "bar", { defvalue: 0 }), 0);
		});

		it('should be set correctly and not coerced when passing in constructor', function () {
			assertDefvalue(widget.newParam("param1", 3, { type: "number", coerce: true, defvalue: "foo" }), "foo");
			assertDefvalue(widget.newParam("param1", "bar", { type: "string", coerce: true, defvalue: 0 }), 0);
		});

		it('should be set correctly when setting', function () {
			assertDefvalueSet(widget.newParam("param1", 3), 0, 0);
			assertDefvalueSet(widget.newParam("param1", "bar"), "foo", "foo");
		});

		it('should be set correctly and not coerced when setting', function () {
			assertDefvalueSet(widget.newParam("param1", 3, { type: "number", coerce: true }), 0, 0);
			assertDefvalueSet(widget.newParam("param1", 3, { type: "string", coerce: true }), 0, 0);
			assertDefvalueSet(widget.newParam("param1", null, { type: "number", coerce: true }), "bar", "bar");
		});

	});

	describe('Svidget.Param.value() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertValue(widget.newParam("param1", 3), 3);
			assertValue(widget.newParam("param1", "3"), "3");
		});
		
		it('should be set correctly when coerce is true and no type is specified (causing an infer) passing in constructor', function () {
			assertValue(widget.newParam("param1", 3, { coerce: true }), 3);
		});
		
		it('should not set when the value is the same as the current value', function () {
			var p = widget.newParam("param1", 3, { type: "number" });
			var res = p.value(3);
			test.bool(res).isFalse();
		});

		it('should coerce to type when type is valid and coerce is true when passing in constructor', function () {
			assertTypeAndValue(widget.newParam("test1", 34, { type: "string", coerce: true }), "string", "string", "34");
			assertTypeAndValue(widget.newParam("test1", "false", { type: "boolean", coerce: true }), "boolean", "boolean", false);
			assertTypeAndValue(widget.newParam("test1", "566", { type: "number", coerce: true }), "number", "number", 566);
			assertTypeAndValue(widget.newParam("test1", "{ 'name': 'Bob' }", { type: "object", coerce: true }), "object", "object", { name: "Bob" });
			assertTypeAndValue(widget.newParam("test1", "['apple','banana']", { type: "array", coerce: true }), "object", "array", ['apple', 'banana']);
			assertTypeAndValue(widget.newParam("test1", 34, { type: "object", coerce: true }), "number", "object", 34);
		});
		
		it('should coerce to type when type/subtype/typedata is valid and coerce is true when passing in constructor', function () {
			assertTypeAndValue(widget.newParam("test1", 34.55, { type: "number", subtype: "integer", coerce: true }), "number", "number", 34);
			assertTypeAndValue(widget.newParam("test1", "B", { type: "string", subtype: "choice", typedata: "A|B|C", coerce: true }), "string", "string", "B");
			assertTypeAndValue(widget.newParam("test1", "D", { type: "string", subtype: "choice", typedata: "A|B|C", coerce: true }), "string", "string", "A");
		});

		it('should not coerce to type when type is invalid and coerce is true', function () {
			assertTypeAndValue(widget.newParam("test1", 34, { type: "blabla", coerce: true }), "number", "object", 34);
		});

		it('should be set correctly when setting', function () {
			assertValueSet(widget.newParam("param1", 3), 4, 4);
			assertValueSet(widget.newParam("param1", "3"), "foo", "foo");
		});

		it('should fail to set when enabled is false when setting', function () {
			assertValueSet(widget.newParam("param1", 3, { enabled: false }), 4, 3);
			assertValueSet(widget.newParam("param1", "3", { enabled: false }), "foo", "3");
		});

		it('should coerce the value if coerce is true and the type is changed then the value is changed', function () {
			assertValueTypeSet(widget.newParam("param1", 3, { coerce: true }), "string", 300, "300");
			assertValueTypeSet(widget.newParam("param1", "3", { coerce: true }), "number", "101", 101);
			assertValueTypeSet(widget.newParam("param1", "foo", { coerce: true }), "bool", "true", true);
		});

		it('should not coerce the value if coerce is false and the type is changed then the value is changed', function () {
			assertValueTypeSet(widget.newParam("param1", 3, { coerce: false }), "string", 4, 4);
			assertValueTypeSet(widget.newParam("param1", "3", { coerce: false }), "number", "4!", "4!");
			assertValueTypeSet(widget.newParam("param1", "foo", { coerce: false }), "bool", "boolio", "boolio");
		});

	});
	
	describe('Svidget.Param.binding() property', function () {
		
		it('should be set correctly when passing in constructor', function () {
			assertBinding(widget.newParam("test1", "224", { binding: "#target" }), "#target");
		});
		
		it('should be set correctly when setting', function () {
			assertBindingSet(widget.newParam("test1", "hello"), "#target", "#target");
		});
				
		// todo: bindingQuery
	});

	describe('Svidget.Param.sanitizer() property', function () {
		
		// should find function by name (in the global scope) when passed in constructor
		// should find function by reference when passed in constructor
		// should find function by name (in the global scope) when setting
		// should find function by reference when setting
		// should be correctly invoked when setting value and set by name
		// should be correctly invoked when setting value and set by reference
		// should revert to value used when sanitizer doesn't return a value

		global.sanitizeIt = function() {

		}

	});
	
	describe('Svidget.Param.toTransport() method', function () {

		it('should correctly return a transport with applicable proxy properties', function () {
			var param = widget.newParam("myparam", 300, {
				shortname: "m",
				type: "number",
				subtype: "integer",
				defvalue: 0
			});
			var transport = param.toTransport();
			// has properties
			test.object(transport)
							.hasProperty('name')
							.hasProperty('shortname')
							.hasProperty('enabled')
							.hasProperty('type')
							.hasProperty('subtype')
							.hasProperty('typedata')
							.hasProperty('coerce')
							.hasProperty('defvalue')
							.hasProperty('value');
			// doesn't have properties
			test.object(transport).hasNotProperty('binding');
			// test transport values
			test.value(transport.name).is("myparam");
			test.value(transport.shortname).is("m");
			test.bool(transport.enabled).isTrue();
			test.value(transport.type).is("number");
			test.value(transport.subtype).is("integer");
			test.bool(transport.coerce).isFalse();
			test.value(transport.defvalue).is(0);
			test.value(transport.value).is(300);
		});

	});

	describe('Svidget.Param.toString() method', function () {

		it('should correctly return a string representation calling manually', function () {
			test.value(widget.newParam("myparam").toString()).is("[Svidget.Param { name: \"myparam\" }]");
		});

		it('should correctly return a string representation coercing to string', function () {
			test.value(widget.newParam("myparam") + "").is("[Svidget.Param { name: \"myparam\" }]");
		});

	});

	describe('Svidget.Param.change event', function () {
		
		it('should trigger when properties are changed', function () {
			var p = widget.newParam("myparam", 4);
			/*var changed = false;
			p.onchange(function (e) {
				changed = true;
				var obj = e.value;
				test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
				test.value(obj.property).is("defvalue");
				test.value(obj.value).is(67);
			});
			p.defvalue(67);
			test.bool(changed).isTrue();*/

			assertChangeEventTrigger(p, "defvalue", 67);
		});
		
		it('should trigger when properties are changed with event name and data', function () {
			var p = widget.newParam("myparam", "Chicago", { defvalue: "(city)" });
			assertChangeEventTrigger(p, "defvalue", "City", true, { test: "data" }, "myhandler");
		});

		it('should not trigger when property value being set is the same as the current value', function () {
			var p = widget.newParam("myparam", 0, { description: "hello" });
			assertChangeEventTrigger(p, "description", "hello", false);
		});

		// should not trigger for value property change
		it('should not trigger for value property change', function () {
			var p = widget.newParam("myparam", "fun");
			assertChangeEventTrigger(p, "value", "times", false);
		});

	});

	describe('Svidget.Param.set event', function () {
		
		it('should trigger when value property is changed', function () {
			var p = widget.newParam("myparam", 4);
			assertSetEventTrigger(p, 67);
		});
		
		it('should trigger when value is changed with event name and data', function () {
			var p = widget.newParam("myparam", "Baltimore");
			assertSetEventTrigger(p, "Chicago", true, { test: "data!" }, "mysethandler");
		});

		it('should not trigger when property value being set is the same as the current value', function () {
			var p = widget.newParam("myparam", "golf");
			assertSetEventTrigger(p, "tennis");
		});

	});
	


	// todo:
	// test binding resolution/DOM
	// test parent/widget
	// test new coerceValue (when available)

	// ASSERTERS
	
	function assertCoerce(param, coerce) {
		test.value(param.coerce()).is(coerce);
	}
	
	function assertCoerceSet(param, value, coerce) {
		param.coerce(value);
		test.value(param.coerce()).is(coerce);
	}
	
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

	function assertShortname(param, name) {
		test.value(param.shortname()).is(name);
		test.value(param.shortname()).isType('string');
	}
	
	function assertShortnameSet(param, value, sn) {
		param.shortname(value);
		assertShortname(param, sn);
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

	function assertValue(param, value) {
		test.value(param.value()).is(value);
	}
	
	function assertValueSet(param, value, expected) {
		param.value(value);
		test.value(param.value()).is(expected);
	}

	function assertDefvalue(param, value) {
		test.value(param.defvalue()).is(value);
	}

	function assertDefvalueSet(param, value, expected) {
		param.defvalue(value);
		test.value(param.defvalue()).is(expected);
	}

	function assertBinding(param, value) {
		test.value(param.binding()).is(value);
	}
	
	function assertBindingSet(param, value, expected) {
		param.binding(value);
		test.value(param.binding()).is(expected);
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
			//console.log('data == ' + e.data);
			if (e.data === null)
				test.value(eventData).isNull();
			else
				test.value(e.data).isIdenticalTo(eventData);
			if (e.name === null)
				test.value(eventName).isNull();
			else
				test.value(e.name).isIdenticalTo(eventName);
		});
		param[prop](newValue);
		test.value(changed).is(shouldTrigger);
	}

	function assertSetEventTrigger(param, newValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var triggered = false;
		param.onset(eventData, eventName, function (e) {
			triggered = true;
			var obj = e.value;
			test.object(obj).hasProperty("value");
			test.value(obj.value).is(newValue);
			//console.log('data == ' + e.data);
			if (e.data === null)
				test.value(eventData).isNull();
			else
				test.value(e.data).isIdenticalTo(eventData);
			if (e.name === null)
				test.value(eventName).isNull();
			else
				test.value(e.name).isIdenticalTo(eventName);
		});
		param.value(newValue);
		test.value(triggered).is(shouldTrigger);
	}

});