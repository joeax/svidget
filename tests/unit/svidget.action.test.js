/* Svidget.Action.Test
 * 
 * Tests the Svidget.Action class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {}, _from: "svidget.action.test" }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.Action tests', function () {
	
	var widget = svidget.$;
	
	it('should exist', function () {
		// pre-test
		test.value(widget).exists();
		test.value(widget.actions()).exists();
	});

	it('should be able to create an action', function () {
		// sanity test 1
		var action1 = widget.newAction("wingit");
		test.value(action1.name()).is("wingit");
	});
	
	it('should be able to create a complex action', function () {
		// sanity test 2
		var options = {
			binding: function (x) { },
			description: "A complex wingit action.",
			enabled: 1,
			external: true,
		};
		var action1 = widget.newAction("complexsomething", options);
		
		// tests
		test.value(action1.name()).is("complexsomething");
		test.value(action1.description()).is("A complex wingit action.");
		test.value(action1.enabled()).is(true);
		test.value(action1.external()).is(true);
		test.value(action1.binding()).isFunction();
		test.value(action1.parent()).isIdenticalTo(widget);
	});
	
	describe('Svidget.Action.binding() property', function () {
		
		it('should find function by name (in the global scope) when passed in constructor', function () {
			assertBinding(widget.newAction("action1", { binding: "_binding1" }), "_binding1", "string");
		});
		
		it('should find function by reference when passed in constructor', function () {
			assertBinding(widget.newAction("action1", { binding: window._binding1 }), window._binding1, "function");
		});
		
		it('should return function name even when function not found when passed in constructor', function () {
			assertBinding(widget.newAction("action1", { binding: "_binding_foo" }), "_binding_foo", "string");
		});
		
		it('should find function by name (in the global scope) when setting', function () {
			assertBindingSet(widget.newAction("action1"), "_binding1", "_binding1", "string");
		});
		
		it('should find function by reference when setting', function () {
			assertBindingSet(widget.newAction("action1"), window._binding1, window._binding1, "function");
		});
		
		it('should return function name event when function not found when setting', function () {
			assertBindingSet(widget.newAction("action1"), "_binding_not_found", "_binding_not_found", "string");
		});

		window._binding1 = function () {

		}

	});
	
	describe('Svidget.Action.bindingFunc() property', function () {
		
		it('should return function by name (in the global scope) when binding name is set', function () {
			assertBindingFunc(widget.newAction("action1", { binding: "_binding2" }), window._binding2);
		});
		
		it('should return null when binding name is invalid when passed in constructor', function () {
			assertBindingFunc(widget.newAction("action2", { binding: "_binding_not_found" }), null);
		});
		
		it('should return function by name (in the global scope) when binding name is set', function () {
			assertBindingFuncSet(widget.newAction("action3"), "_binding2", window._binding2);
		});
		
		it('should return null when binding name is invalid when setting', function () {
			assertBindingFuncSet(widget.newAction("action4"), "_binding_not_found", null);
		});

		window._binding2 = function () {

		}

	});

	describe('Svidget.Action.description() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertDescription(widget.newAction("action1", { description: "this is description." }), "this is description.");
			assertDescription(widget.newAction("action1", { description: 3 }), "3");
			assertDescription(widget.newAction("action1", { description: false }), "false");
			assertDescription(widget.newAction("action1", { description: { foo: "bar" } }), "{\"foo\":\"bar\"}");
		});
		
		it('should be set as string when setting', function () {
			assertDescriptionSet(widget.newAction("action1"), "this is description.", "this is description.");
			assertDescriptionSet(widget.newAction("action1"), 3, "3");
			assertDescriptionSet(widget.newAction("action1"), false, "false");
			assertDescriptionSet(widget.newAction("action1"), { foo: "bar" }, "{\"foo\":\"bar\"}");
			assertDescriptionSet(widget.newAction("action1"), null, null);
		});
	
	});

	describe('Svidget.Action.enabled() property', function () {
		
		it('should default to true', function () {
			assertEnabled(widget.newAction("action1"), true);
		});

		it('should set to true when passing value other than false in constructor', function () {
			assertEnabled(widget.newAction("action1", { enabled: true }), true);
			assertEnabled(widget.newAction("action1", { enabled: "X" }), true);
			assertEnabled(widget.newAction("action1", { enabled: null }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertEnabled(widget.newAction("action1", { enabled: false }), false);
			assertEnabled(widget.newAction("action1", { enabled: "false" }), false);
		});		
		
		it('should set to true when using value other than false', function () {
			assertEnabledSet(widget.newAction("action1"), true, true);
			assertEnabledSet(widget.newAction("action1"), "X", true);
			assertEnabledSet(widget.newAction("action1"), null, true);
		});

		it('should set to false when using false or "false"', function () {
			assertEnabledSet(widget.newAction("action1"), false, false);
			assertEnabledSet(widget.newAction("action1"), "false", false);
		});

	});
	
	describe('Svidget.Action.external() property', function () {

		it('should default to true', function () {
			assertExternal(widget.newAction("action1"), true);
		});
		
		it('should set to true when passing value other than false in constructor', function () {
			assertExternal(widget.newAction("action1", { external: "X" }), true);
			assertExternal(widget.newAction("action1", { external: null }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertExternal(widget.newAction("action1", { external: false }), false);
			assertExternal(widget.newAction("action1", { external: "false" }), false);
		});

		it('should set to true when using value other than false', function () {
			assertExternalSet(widget.newAction("action1"), "X", true);
			assertExternalSet(widget.newAction("action1"), null, true);
		});
		
		it('should set to false when using false or "false"', function () {
			assertExternalSet(widget.newAction("action1"), false, false);
			assertExternalSet(widget.newAction("action1"), "false", false);
		});

	});

	describe('Svidget.Action.name() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertName(widget.newAction("test1"), "test1");
			assertName(widget.newAction(3), "3");
			assertName(widget.newAction(false), "false");
			assertName(widget.newAction({ foo: "bar" }), "{\"foo\":\"bar\"}");
		});
		
		it('should not be modifiable', function () {
			var param = widget.newAction("test1");
			var result = param.name("test1!!!");
			test.value(param.name()).is("test1");
			test.bool(result).isFalse();
		});
		
	});
	
	describe('Svidget.Action.param() property', function () {
		
		it('should be set correctly when adding params fom constructor', function () {
			assertParam(widget.newAction("action1", { params: [{ name: "p1", type: "string" }] }), "p1", { name: "p1", type: "string" });
			assertParam(widget.newAction("action1", { params: [{ name: "p1", type: "string" }] }), "p2", null);
		});

		it('should select the correct param by index', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			assertParam(action1, 0, { name: "p1", type: "string" });
			assertParam(action1, 1, { name: "p2", type: "number" });
			assertParam(action1, 2, null);
		});

		it('should select the correct param by name', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			assertParam(action1, "p1", { name: "p1", type: "string" });
			assertParam(action1, "p2", { name: "p2", type: "number" });
			assertParam(action1, "p123xxx", null);
		});

		it('should select the correct param by function selector', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			assertParam(action1, function f(a) { return a.type() == "string" }, { name: "p1", type: "string" });
			assertParam(action1, function f(a) { return a.type() == "number" }, { name: "p2", type: "number" });
			assertParam(action1, function f(a) { return a.type() == "foo" }, null);
		});

	});
	
	describe('Svidget.Action.params() property', function () {

		it('should be set correctly when adding params fom constructor', function () {
			assertParams(widget.newAction("action1", { params: [{ name: "p1", type: "string" }] }), [{ name: "p1", type: "string" }]);
			assertParams(widget.newAction("action1", { params: [] }), []);
		});

		it('should return the correct collection by index', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			assertParamsCollection(action1, 0, [{ name: "p1", type: "string" }]);
			assertParamsCollection(action1, 1, [{ name: "p2", type: "number" }]);
			assertParamsCollection(action1, 3, []);
		});

		it('should return the correct collection by index', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			assertParamsCollection(action1, "p1", [{ name: "p1", type: "string" }]);
			assertParamsCollection(action1, "p2", [{ name: "p2", type: "number" }]);
			assertParamsCollection(action1, "p123xxx", []);
		});

		it('should select the correct collection by function selector', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action1 = widget.newAction("action1", { params: [p1, p2, p3] });
			assertParamsCollection(action1, function f(a) { return a.type() == "string" }, [p1]);
			assertParamsCollection(action1, function f(a) { return a.type() == "string" || a.type() == "number" }, [p1, p2]);
			assertParamsCollection(action1, function f(a) { return true }, [p1, p2, p3]);
			assertParamsCollection(action1, function f(a) { return false }, []);
		});

	});
	
	describe('Svidget.Action.newParam() method', function () {
		
		it('should return a param as specified when properties are valid', function () {
			var action1 = widget.newAction("action1");
			var ap1 = action1.newParam("p1", { type: "string", defvalue: "--" });
			test.object(ap1).hasProperty('name')
											.hasProperty('description')
											.hasProperty('defvalue');
			test.value(ap1.name()).is("p1");
			test.value(ap1.type()).is("string");
			test.value(action1.param("p1")).isNull();
		});
	});
	
	describe('Svidget.Action.addParam() method', function () {
		
		it('should add a param and return it when properties are valid', function () {
			var action1 = widget.newAction("action1");
			var ap1 = action1.addParam("p1", { type: "string", defvalue: "--", description: "Hello there." });
			test.object(ap1).isNot(null);
			test.value(ap1.name()).is("p1");
			test.value(ap1.type()).is("string");
			test.value(ap1.description()).is("Hello there.");
			var ap1Dup = action1.param("p1");
			test.object(ap1).isIdenticalTo(ap1Dup);
		});

		it('should add a previously created param using newParam', function () {
			var action1 = widget.newAction("action1");
			var ap1 = action1.newParam("p1", { type: "string", defvalue: "--", description: "Hello there." });
			action1.addParam(ap1);
			test.object(ap1).isNot(null);
			test.value(ap1.name()).is("p1");
			test.value(ap1.type()).is("string");
			test.value(ap1.description()).is("Hello there.");
			var ap1Dup = action1.param("p1");
			test.object(ap1).isIdenticalTo(ap1Dup);
		});

		it('should not add a param, and return null, when properties are not valid (i.e duplicate name)', function () {
			var action1 = widget.newAction("action1");
			var ap1 = action1.addParam("p1", { type: "string", defvalue: "--", decription: "Hello there." });
			var ap1Invalid = action1.addParam("p1", { type: "string", defvalue: "--", decription: "Hello there." });
			test.object(ap1).isNot(null);
			test.value(ap1Invalid).isNull();
		});

		it('should not add a param, and return null, when trying to add a param that was already added', function () {
			var action1 = widget.newAction("action1");
			var ap1 = action1.newParam("p1", { type: "string", defvalue: "--", decription: "Hello there." });
			var res1 = action1.addParam(ap1);
			test.object(res1).isNot(null);
			test.object(res1).isIdenticalTo(ap1);
			var resInvalid = action1.addParam(ap1);
			test.value(resInvalid).isNull();
		});

	});
	
	describe('Svidget.Action.removeParam() method', function () {
		
		it('should remove a param and return true for existing param', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			var ap1 = action1.param(0);
			var ap2 = action1.param(1);
			test.value(action1.params().length).is(2);
			var success = action1.removeParam("p1");
			test.bool(success).isTrue();
			test.value(action1.params().length).is(1);
			success = action1.removeParam("p1");
			test.bool(success).isFalse(); // already removed
		});

		it('should not remove a param and return false if param not found by name or index', function () {
			var action1 = widget.newAction("action1", { params: [{ name: "p1", type: "string" }, { name: "p2", type: "number" }] });
			var ap1 = action1.param(0);
			var ap2 = action1.param(1);
			test.value(action1.params().length).is(2);
			var success = action1.removeParam("p3");
			test.bool(success).isFalse();
			test.value(action1.params().length).is(2);
			success = action1.removeParam();
			test.bool(success).isFalse();
			test.value(action1.params().length).is(2);
		});

	});
	
	describe('Svidget.Action.invoke() method', function () {
		
		it('should invoke if binding is valid', function () {
			var addParams = [{ name: "a", type: "number" }, { name: "b", type: "number" }];
			var action1 = widget.newAction("action1", { binding: add, params: addParams });
			var result = action1.invoke(3, 6);
			test.bool(result).isTrue();
		});

		it('should not invoke if there is no binding or binding invalid', function () {
			var addParams = [{ name: "a", type: "number" }, { name: "b", type: "number" }];
			var action1 = widget.newAction("action1", { binding: null, params: addParams });
			assertInvoke(action1, function () { return action1.invoke(3, 6); }, false);
			action1.binding("foobar");
			assertInvoke(action1, function () { return action1.invoke(3, 6); }, false);
		});
		
		it('should not invoke when action is not enabled', function () {
			var action1 = widget.newAction("action1", { binding: add });
			var triggered = false;
			action1.oninvoke(function (e) {
				triggered = true;
			});
			action1.trigger();
			test.bool(triggered).isFalse();
		});
		
		it('should apply param defvalue when params are not supplied or undefined, but not null', function () {
			var addParams = [{ name: "a", type: "number", defvalue: 2 }, { name: "b", type: "number", defvalue: 7 }];
			var action1 = widget.newAction("action1", { binding: add, params: addParams });
			var returnVal;
			action1.oninvoke(function (e) {
				returnVal = e.value.returnValue;
			});
			action1.invoke();
			test.value(returnVal).is(9); // 2 + 7
			action1.invoke(undefined, undefined);
			test.value(returnVal).is(9); // 2 + 7
			action1.invoke(3, undefined);
			test.value(returnVal).is(10); // 3 + 7
			action1.invoke(undefined, 11);
			test.value(returnVal).is(13); // 2 + 11
			action1.invoke(null, 3);
			test.value(returnVal).is(3);
		});

		function add(a, b) {
			return a + b;
		}
	});


	describe('Svidget.Action.toTransport() method', function () {

		it('should correctly return a transport with applicable proxy properties', function () {
			var action = widget.newAction("myaction", {
				description: "Hello, description.",
				external: false
			});
			action.addParam("param1", { type: "number", defvalue: 1 });
			var transport = action.toTransport();
			// has properties
			test.object(transport)
							.hasProperty('name')
							.hasProperty('description')
							.hasProperty('enabled')
							.hasProperty('external')
							.hasProperty('params');
			// doesn't have properties
			test.object(transport).hasNotProperty('binding');
			// test transport values
			test.value(transport.name).is("myaction");
			test.bool(transport.enabled).isTrue();
			test.bool(transport.external).isFalse();
			test.value(transport.description).is("Hello, description.");
			test.value(transport.params).isArray();
			test.array(transport.params).is([{ name: "param1", type: "number", subtype: null, typedata: null, description: null, defvalue: 1 }]);
		});

	});

	describe('Svidget.Action.toString() method', function () {

		it('should correctly return a string representation calling manually', function () {
			test.value(widget.newAction("myaction").toString()).is("[Svidget.Action { name: \"myaction\" }]");
		});

		it('should correctly return a string representation coercing to string', function () {
			test.value(widget.newAction("myaction") + "").is("[Svidget.Action { name: \"myaction\" }]");
		});

	});

	describe('Svidget.Action.change event', function () {
		
		it('should trigger when properties are changed', function () {
			var action = widget.newAction("myaction");
			assertChangeEventTrigger(action, "description", "hello!");
		});
		
		it('should trigger when properties are changed with event name and data', function () {
			var action = widget.newAction("myaction", { external: false });
			assertChangeEventTrigger(action, "external", true, true, { test: "data" }, "myhandler");
		});

		it('should not trigger when property value being set is the same as the current value', function () {
			var action = widget.newAction("myaction", { description: "hello" });
			assertChangeEventTrigger(action, "description", "hello", false);
		});

	});

	describe('Svidget.Action.invoke event', function () {
		
		it('should trigger when invoke is called', function () {
			var action = widget.newAction("myaction", { binding: function () { return "world"; } });
			assertInvokeEventTrigger(action, "world");
		});
		
		it('should trigger when invoke is called with event name and data', function () {
			var action = widget.newAction("myaction", { binding: function () { return 1; } });
			assertInvokeEventTrigger(action, 1, true, { test: "invoked!" }, "myinvokehandler");
		});

		it('should not trigger when invoke is called and no binding was set or is invalid', function () {
			var action = widget.newAction("myaction", { binding: null });
			assertInvokeEventTrigger(action, 1, false);
		});

	});
	
	describe('Svidget.Action.paramchange event', function () {
		
		it('should trigger when any param properties are changed', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamChangeEventTrigger(action, action.param("p1"), "description", "hello!");
		});

		it('should trigger when any param properties are changed with event name and data', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamChangeEventTrigger(action, action.param("p2"), "type", "boolean", true, { test: "data" }, "myhandler");
		});
		
		it('should not trigger when any param property value being set is the same as the current value', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamChangeEventTrigger(action, action.param("p3"), "type", "boolean", false);
		});

	});
	
	describe('Svidget.Action.paramadd event', function () {
		
		it('should trigger when a param is added', function () {
			var action = widget.newAction("myaction");
			assertParamAddEventTrigger(action, "p1", { description: "hello!" });
		});
		
		it('should trigger when a param is added with event name and data', function () {
			var action = widget.newAction("myaction");
			assertParamAddEventTrigger(action, "p1", { description: "hello!" }, true, { test: "data" }, "myhandler");
		});

		it('should not trigger when the param was not added', function () {
			var action = widget.newAction("myaction");
			assertParamAddEventTrigger(action, null, null, false);
		});

	});
	
	describe('Svidget.Action.paramremove event', function () {
		
		it('should trigger when a param is removed', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamRemoveEventTrigger(action, "p1");
		});
		
		it('should trigger when a param is removed with event name and data', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamRemoveEventTrigger(action, "p2", true, { foo: "bar" }, "handler1");
		});
		
		it('should not trigger when the param was not removed', function () {
			var p1 = { name: "p1", type: "string" }, p2 = { name: "p2", type: "number" }, p3 = { name: "p3", type: "boolean" };
			var action = widget.newAction("myaction", { params: [p1, p2, p3] });
			assertParamRemoveEventTrigger(action, "p4", false);
		});

	});
	

	// ASSERTERS
	
	function assertBinding(action, value, type) {
		test.value(action.binding()).is(value);
		test.value(action.binding()).isType(type);
	}
	
	function assertBindingSet(action, value, assertValue, type) {
		action.binding(value);
		assertBinding(action, assertValue, type);
	}
	
	function assertBindingFunc(action, value) {
		test.value(action.bindingFunc()).is(value);
		if (value !== null) test.value(action.bindingFunc()).isType("function");
	}
	
	function assertBindingFuncSet(action, value, assertValue) {
		action.binding(value);
		assertBindingFunc(action, assertValue);
	}
	
	function assertDescription(action, desc) {
		test.value(action.description()).is(desc);
		if (desc !== null) test.value(action.description()).isType('string');
	}
	
	function assertDescriptionSet(action, value, desc) {
		action.description(value);
		assertDescription(action, desc);
	}

	function assertEnabled(action, enabled) {
		test.value(action.enabled()).is(enabled);
	}
	
	function assertEnabledSet(action, value, enabled) {
		action.enabled(value);
		test.value(action.enabled()).is(enabled);
	}
	
	function assertExternal(action, external) {
		test.value(action.external()).is(external);
	}
	
	function assertExternalSet(action, value, external) {
		action.external(value);
		test.value(action.external()).is(external);
	}
	
	function assertName(action, name) {
		test.value(action.name()).is(name);
		test.value(action.name()).isType('string');
	}
	
	function assertParam(action, sel, expected) {
		var p = action.param(sel);
		if (expected === null)
			test.value(p).isNull();
		else {
			test.value(p.name()).is(expected.name);
			test.value(p.type()).is(expected.type);
		}
	}
	
	function assertParams(action, expected) {
		for (var i = 0; i < expected.length; i++) {
			assertParam(action, i, expected[i]);
		}
	}
	
	function assertParamsCollection(action, sel, expected) {
		var col = action.params(sel);
		test.number(col.length).is(expected.length);
		for (var i = 0; i < expected.length; i++) {
			test.value(col[i].name()).is(expected[i].name);
			test.value(col[i].type()).is(expected[i].type);
		}
	}
	
	function assertInvoke(action, invokeFunc, expectedResult) {
		var result = invokeFunc();
		test.value(result).is(expectedResult);
	}

	function assertChangeEventTrigger(action, prop, newValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var changed = false;
		action.onchange(eventData, eventName, function (e) {
			changed = true;
			var obj = e.value;
			test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
			test.value(obj.property).is(prop);
			test.value(obj.value).is(newValue);
			assertEventObject(e, eventData, eventName);
		});
		action[prop](newValue);
		test.value(changed).is(shouldTrigger);
	}

	function assertInvokeEventTrigger(action, returnValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var triggered = false;
		action.oninvoke(eventData, eventName, function (e) {
			triggered = true;
			var obj = e.value;
			test.object(obj).hasProperty("returnValue");
			test.value(obj.returnValue).is(returnValue);
			assertEventObject(e, eventData, eventName);
		});
		action.invoke();
		test.value(triggered).is(shouldTrigger);
	}
	
	function assertParamChangeEventTrigger(action, param, prop, newValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var changed = false;
		action.onparamchange(eventData, eventName, function (e) {
			changed = true;
			var obj = e.value;
			test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
			test.value(obj.property).is(prop);
			test.value(obj.value).is(newValue);
			test.value(e.target).isIdenticalTo(param);
			test.value(e.currentTarget).isIdenticalTo(action);
			assertEventObject(e, eventData, eventName);
		});
		param[prop](newValue);
		test.value(changed).is(shouldTrigger);
	}

	function assertParamAddEventTrigger(action, paramName, paramProps, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var triggered = false;
		var count = action.params().length;
		action.onparamadd(eventData, eventName, function (e) {
			triggered = true;
			count += 1;
			var obj = e.value;
			test.object(obj).hasProperty("__type")
			test.value(obj.__type).is("Svidget.ActionParam");
			assertEventObject(e, eventData, eventName);
		});
		var newParam = action.addParam(paramName, paramProps);
		test.value(action.params().length).is(count);
		test.value(triggered).is(shouldTrigger);
	}
	
	function assertParamRemoveEventTrigger(action, paramName, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var triggered = false;
		var count = action.params().length;
		action.onparamremove(eventData, eventName, function (e) {
			triggered = true;
			count -= 1;
			var obj = e.value;
			test.value(obj).isString();
			test.value(obj).is(paramName);
			assertEventObject(e, eventData, eventName);
		});
		var newParam = action.removeParam(paramName);
		test.value(action.params().length).is(count);
		test.value(triggered).is(shouldTrigger);
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