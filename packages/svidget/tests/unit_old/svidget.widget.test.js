/* Svidget.Widget.Test
 * 
 * Tests the Svidget.Widget class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {}, _from: "svidget.widget.test" }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.Widget Test', function () {
	
	var widget = svidget.$;
	
	it('should exist', function () {
		// Pre-Test
		test.value(widget).exists();
	});
	
	describe('Svidget.Widget.connected() property', function () {
		
		it('should be false', function () {
			test.bool(widget.connected()).isFalse();
		});

	});
	
	describe('Svidget.Widget.enabled() property', function () {
		
		it('should be true', function () {
			test.bool(widget.enabled()).isTrue();
		});

		it('should be settable', function () {
			widget.enabled(false);
			test.bool(widget.enabled()).isFalse();
			widget.enabled(true);
			test.bool(widget.enabled()).isTrue();
		});

	});

	describe('Svidget.Widget.id() property', function () {
		
		it('should be null', function () {
			test.value(widget.id()).is(null);
		});
		
	});
	
	describe('Svidget.Widget.param() property', function () {
		
		it('should select the correct param by index', function () {
			widget.removeAllParams();
			// test removeAllParams
			test.value(widget.params().length).is(0);
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			test.value(widget.params().length).is(2);
			assertParam(0, { name: "p1", type: "string" });
			assertParam(1, { name: "p2", type: "number" });
			// clean up			
			widget.removeAllParams();
		});
		
		it('should select the correct param by name', function () {
			// set up
			widget.removeAllParams();
			// test removeAllParams
			test.value(widget.params().length).is(0);
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			test.value(widget.params().length).is(2);
			assertParam("p1", { name: "p1", type: "string" });
			assertParam("p2", { name: "p2", type: "number" });
			assertParam("p123xxx", null);
			// clean up			
			widget.removeAllParams();
		});
		
		it('should select the correct param by function selector', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			test.value(widget.params().length).is(2);
			assertParam(function f(a) { return a.type() == "string" }, { name: "p1", type: "string" });
			assertParam(function f(a) { return a.type() == "number" }, { name: "p2", type: "number" });
			assertParam(function f(a) { return a.type() == "foo" }, null);
			// clean up			
			widget.removeAllParams();
		});

	});
	
	describe('Svidget.Widget.params() property', function () {
		
		it('should return the correct collection by index', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			assertParamsCollection(0, [{ name: "p1", type: "string" }]);
			assertParamsCollection(1, [{ name: "p2", type: "number" }]);
			assertParamsCollection(3, []);
			// clean up			
			widget.removeAllParams();
		});
		
		it('should return the correct collection by index', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			assertParamsCollection("p1", [{ name: "p1", type: "string" }]);
			assertParamsCollection("p2", [{ name: "p2", type: "number" }]);
			assertParamsCollection("p123xxx", []);
			// clean up			
			widget.removeAllParams();
		});
		
		it('should select the correct collection by function selector', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" }).toTransport();
			var p2 = widget.addParam("p2", 3, { type: "number" }).toTransport();
			var p3 = widget.addParam("p3", false, { type: "boolean" }).toTransport();
			assertParamsCollection(function f(a) { return a.type() == "string" }, [p1]);
			assertParamsCollection(function f(a) { return a.type() == "string" || a.type() == "number" }, [p1, p2]);
			assertParamsCollection(function f(a) { return true }, [p1, p2, p3]);
			assertParamsCollection(function f(a) { return false }, []);
			// clean up			
			widget.removeAllParams();
		});

	});
	
	describe('Svidget.Widget.addParam() method', function () {
		
		it('should add a param and return it when properties are valid', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string", defvalue: "--", description: "Hello there." });
			test.object(p1).isNot(null);
			test.value(p1.name()).is("p1");
			test.value(p1.type()).is("string");
			test.value(p1.description()).is("Hello there.");
			var p1Dup = widget.param("p1");
			test.object(p1).isIdenticalTo(p1Dup);
			// clean up			
			widget.removeAllParams();
		});
		
		it('should add a previously created param using newParam', function () {
			widget.removeAllParams();
			var p1 = widget.newParam("p1", "foo", { type: "string", defvalue: "--", description: "Hello there." });
			widget.addParam(p1);
			test.object(p1).isNot(null);
			test.value(p1.name()).is("p1");
			test.value(p1.type()).is("string");
			test.value(p1.description()).is("Hello there.");
			var p1Dup = widget.param("p1");
			test.object(p1).isIdenticalTo(p1Dup);
			// clean up			
			widget.removeAllParams();
		});
		
		it('should not add a param, and return null, when properties are not valid (i.e duplicate name)', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string", defvalue: "--", decription: "Hello there." });
			var p1Invalid = widget.addParam("p1", "foo", { type: "string", defvalue: "--", decription: "Hello there." });
			test.object(p1).isNot(null);
			test.value(p1Invalid).isNull();
			// clean up			
			widget.removeAllParams();
		});
		
		it('should not add a param, and return null, when trying to add a param that was already added', function () {
			widget.removeAllParams();
			var p1 = widget.newParam("p1", "foo", { type: "string", defvalue: "--", decription: "Hello there." });
			var res1 = widget.addParam(p1);
			test.object(res1).isNot(null);
			test.object(res1).isIdenticalTo(p1);
			var resInvalid = widget.addParam(p1);
			test.value(resInvalid).isNull();
			// clean up			
			widget.removeAllParams();
		});

	});
	
	describe('Svidget.Widget.removeParam() method', function () {
		
		it('should remove a param and return true for existing param', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			test.value(widget.params().length).is(2);
			var success = widget.removeParam("p1");
			test.bool(success).isTrue();
			test.value(widget.params().length).is(1);
			success = widget.removeParam("p1");
			test.bool(success).isFalse(); // already removed
		});
		
		it('should not remove a param and return false if param not found by name or index', function () {
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			test.value(widget.params().length).is(2);
			var success = widget.removeParam("p3");
			test.bool(success).isFalse();
			test.value(widget.params().length).is(2);
			success = widget.removeParam();
			test.bool(success).isFalse();
			test.value(widget.params().length).is(2);
		});

	});
	
	describe('Svidget.Widget.action() property', function () {
		
		it('should select the correct action by index', function () {
			widget.removeAllActions();
			// test removeAllActions
			test.value(widget.actions().length).is(0);
			var a1 = widget.addAction("a1", { description: "Action 1" });
			var a2 = widget.addAction("a2", { description: "Action 2" });
			test.value(widget.actions().length).is(2);
			assertAction(0, { name: "a1", description: "Action 1" });
			assertAction(1, { name: "a2", description: "Action 2" });
			// clean up			
			widget.removeAllActions();
		});
		
		it('should select the correct action by name', function () {
			// set up
			widget.removeAllActions();
			// test removeAllParams
			test.value(widget.actions().length).is(0);
			var a1 = widget.addAction("a1", { description: "Action 1" });
			var a2 = widget.addAction("a2", { description: "Action 2" });
			test.value(widget.actions().length).is(2);
			assertAction("a1", { name: "a1", description: "Action 1" });
			assertAction("a2", { name: "a2", description: "Action 2" });
			assertAction("a123xxx", null);
			// clean up			
			widget.removeAllActions();
		});
		
		it('should select the correct action by function selector', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "Action 1" });
			var a2 = widget.addAction("a2", { description: "Action 2" });
			test.value(widget.actions().length).is(2);
			assertAction(function f(a) { return a.description() == "Action 1" }, { name: "a1", description: "Action 1" });
			assertAction(function f(a) { return a.description() == "Action 2" }, { name: "a2", description: "Action 2" });
			assertAction(function f(a) { return a.description() == "foo" }, null);
			// clean up			
			widget.removeAllActions();
		});

	});
	
	describe('Svidget.Widget.actions() property', function () {
		
		it('should return the correct collection by index', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "Action 1" });
			var a2 = widget.addAction("a2", { description: "Action 2" });
			assertActionsCollection(0, [{ name: "a1", description: "Action 1" }]);
			assertActionsCollection(1, [{ name: "a2", description: "Action 2" }]);
			assertActionsCollection(3, []);
			// clean up			
			widget.removeAllActions();
		});
		
		it('should return the correct collection by index', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "football" });
			var a2 = widget.addAction("a2", { description: "baseball" });
			assertActionsCollection("a1", [{ name: "a1", description: "football" }]);
			assertActionsCollection("a2", [{ name: "a2", description: "baseball" }]);
			assertActionsCollection("a123xxx", []);
			// clean up			
			widget.removeAllActions();
		});
		
		it('should select the correct collection by function selector', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "football" }).toTransport();
			var a2 = widget.addAction("a2", { description: "baseball" }).toTransport();
			var a3 = widget.addAction("a3", { description: "hockey" }).toTransport();
			assertActionsCollection(function f(a) { return a.description() == "baseball" }, [a2]);
			assertActionsCollection(function f(a) { return a.description() == "football" || a.description() == "hockey" }, [a1, a3]);
			assertActionsCollection(function f(a) { return true }, [a1, a2, a3]);
			assertActionsCollection(function f(a) { return false }, []);
			// clean up			
			widget.removeAllActions();
		});

	});
	
	describe('Svidget.Widget.addAction() method', function () {
		
		it('should add an action and return it when properties are valid', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { binding: "add", external: false, description: "Hello there." });
			test.object(a1).isNot(null);
			test.value(a1.name()).is("a1");
			test.value(a1.binding()).is("add");
			test.value(a1.bindingFunc()).isIdenticalTo(add);
			test.value(a1.description()).is("Hello there.");
			test.bool(a1.external()).isFalse();
			var a1Dup = widget.action("a1");
			test.object(a1).isIdenticalTo(a1Dup);
			// clean up			
			widget.removeAllActions();
		});
		
		it('should add a previously created action using newAction', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { binding: "add", external: false, description: "Hello there." });
			widget.addAction(a1);
			test.object(a1).isNot(null);
			test.value(a1.name()).is("a1");
			test.value(a1.binding()).is("add");
			test.value(a1.bindingFunc()).isIdenticalTo(add);
			test.value(a1.description()).is("Hello there.");
			test.bool(a1.external()).isFalse();
			var a1Dup = widget.action("a1");
			test.object(a1).isIdenticalTo(a1Dup);
			// clean up			
			widget.removeAllActions();
		});
		
		it('should not add an action, and return null, when properties are not valid (i.e duplicate name)', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { binding: "add", external: false, description: "Hello there." });
			var a1Invalid = widget.addAction("a1", { external: true });
			test.object(a1).isNot(null);
			test.value(a1Invalid).isNull();
			// clean up			
			widget.removeAllActions();
		});
		
		it('should not add an action, and return null, when trying to add an action that was already added', function () {
			widget.removeAllActions();
			var a1 = widget.newAction("a1", { binding: "add", external: false, description: "Hello there." });
			var res1 = widget.addAction(a1);
			test.object(res1).isNot(null);
			test.object(res1).isIdenticalTo(a1);
			var resInvalid = widget.addAction(a1);
			test.value(resInvalid).isNull();
			// clean up			
			widget.removeAllActions();
		});

		window.add = function (a, b) {
			return a + b;
		}
		var add = window.add;

	});
	
	describe('Svidget.Widget.removeAction() method', function () {
		
		it('should remove an action and return true for existing action', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "football" });
			var a2 = widget.addAction("a2", { description: "baseball" });
			test.value(widget.actions().length).is(2);
			var success = widget.removeAction("a1");
			test.bool(success).isTrue();
			test.value(widget.actions().length).is(1);
			success = widget.removeAction("a1");
			test.bool(success).isFalse(); // already removed
			// clean up			
			widget.removeAllActions();
		});
		
		it('should not remove an action and return false if action not found by name or index', function () {
			widget.removeAllActions();
			var a1 = widget.addAction("a1", { description: "football" });
			var a2 = widget.addAction("a2", { description: "baseball" });
			test.value(widget.actions().length).is(2);
			var success = widget.removeAction("a3");
			test.bool(success).isFalse();
			test.value(widget.actions().length).is(2);
			success = widget.removeAction();
			test.bool(success).isFalse();
			test.value(widget.actions().length).is(2);
			// clean up			
			widget.removeAllActions();
		});

	});
	
	describe('Svidget.Widget.event() property', function () {
		
		it('should select the correct event by index', function () {
			widget.removeAllEvents();
			// test removeAllEvents
			test.value(widget.events().length).is(0);
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			test.value(widget.events().length).is(2);
			assertEvent(0, { name: "e1", description: "chocolate" });
			assertEvent(1, { name: "e2", description: "black cherry" });
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should select the correct event by name', function () {
			// set up
			widget.removeAllEvents();
			// test removeAllParams
			test.value(widget.events().length).is(0);
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			test.value(widget.events().length).is(2);
			assertEvent("e1", { name: "e1", description: "chocolate" });
			assertEvent("e2", { name: "e2", description: "black cherry" });
			assertEvent("e123xxx", null);
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should select the correct event by function selector', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			test.value(widget.events().length).is(2);
			assertEvent(function f(a) { return a.description() == "chocolate" }, { name: "e1", description: "chocolate" });
			assertEvent(function f(a) { return a.description() == "black cherry" }, { name: "e2", description: "black cherry" });
			assertEvent(function f(a) { return a.description() == "foo" }, null);
			// clean up			
			widget.removeAllEvents();
		});

	});
	
	describe('Svidget.Widget.events() property', function () {
		
		it('should return the correct collection by index', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			assertEventsCollection(0, [{ name: "e1", description: "chocolate" }]);
			assertEventsCollection(1, [{ name: "e2", description: "black cherry" }]);
			assertEventsCollection(3, []);
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should return the correct collection by index', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			assertEventsCollection("e1", [{ name: "e1", description: "chocolate" }]);
			assertEventsCollection("e2", [{ name: "e2", description: "black cherry" }]);
			assertEventsCollection("e123xxx", []);
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should select the correct collection by function selector', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" }).toTransport();
			var e2 = widget.addEvent("e2", { description: "black cherry" }).toTransport();
			var e3 = widget.addEvent("e3", { description: "rocky road" }).toTransport();
			assertEventsCollection(function f(a) { return a.description() == "black cherry" }, [e2]);
			assertEventsCollection(function f(a) { return a.description() == "chocolate" || a.description() == "rocky road" }, [e1, e3]);
			assertEventsCollection(function f(a) { return true }, [e1, e2, e3]);
			assertEventsCollection(function f(a) { return false }, []);
			// clean up			
			widget.removeAllEvents();
		});

	});
	
	describe('Svidget.Widget.addEvent() method', function () {
		
		it('should add an event and return it when properties are valid', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { external: false, description: "Hello there." });
			test.object(e1).isNot(null);
			test.value(e1.name()).is("e1");
			test.value(e1.description()).is("Hello there.");
			test.bool(e1.external()).isFalse();
			var e1Dup = widget.event("e1");
			test.object(e1).isIdenticalTo(e1Dup);
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should add a previously created action using newEvent', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", {external: false, description: "Hello there." });
			widget.addEvent(e1);
			test.object(e1).isNot(null);
			test.value(e1.name()).is("e1");
			test.value(e1.description()).is("Hello there.");
			test.bool(e1.external()).isFalse();
			var e1Dup = widget.event("e1");
			test.object(e1).isIdenticalTo(e1Dup);
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should not add an event, and return null, when properties are not valid (i.e duplicate name)', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { external: false, description: "Hello there." });
			var e1Invalid = widget.addEvent("e1", { external: true });
			test.object(e1).isNot(null);
			test.value(e1Invalid).isNull();
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should not add an event, and return null, when trying to add an event that was already added', function () {
			widget.removeAllEvents();
			var a1 = widget.newEvent("a1", { external: false, description: "Hello there." });
			var res1 = widget.addEvent(a1);
			test.object(res1).isNot(null);
			test.object(res1).isIdenticalTo(a1);
			var resInvalid = widget.addEvent(a1);
			test.value(resInvalid).isNull();
			// clean up			
			widget.removeAllEvents();
		});

	});
	
	describe('Svidget.Widget.removeEvent() method', function () {
		
		it('should remove an event and return true for existing event', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			test.value(widget.events().length).is(2);
			var success = widget.removeEvent("e1");
			test.bool(success).isTrue();
			test.value(widget.events().length).is(1);
			success = widget.removeEvent("e1");
			test.bool(success).isFalse(); // already removed
			// clean up			
			widget.removeAllEvents();
		});
		
		it('should not remove an event and return false if event not found by name or index', function () {
			widget.removeAllEvents();
			var e1 = widget.addEvent("e1", { description: "chocolate" });
			var e2 = widget.addEvent("e2", { description: "black cherry" });
			test.value(widget.events().length).is(2);
			var success = widget.removeEvent("e3");
			test.bool(success).isFalse();
			test.value(widget.events().length).is(2);
			success = widget.removeEvent();
			test.bool(success).isFalse();
			test.value(widget.events().length).is(2);
			// clean up			
			widget.removeAllEvents();
		});

	});

	// test add-remove-add of param

	describe('Svidget.Widget.toTransport() method', function () {
		
		it('should correctly return a transport with applicable proxy properties', function () {
			// set up
			widget.removeAllParams();
			var p1 = widget.addParam("p1", "foo", { type: "string", description: "foo string" });
			var p2 = widget.addParam("p2", 3, { type: "number" });
			// test
			var transport = widget.toTransport();
			test.object(transport)
							.hasProperty('id')
							.hasProperty('enabled')
							.hasProperty('params')
							.hasProperty('actions')
							.hasProperty('events');
			// test transport values
			test.value(transport.id).is(null);
			test.bool(transport.enabled).isTrue();
			test.value(transport.params).isArray();
			test.value(transport.actions).isArray();
			test.value(transport.events).isArray();
			// todo
			//test.array(transport.params).is([{ name: "p1", shortname: null, type: "string", subtype: null, typedata: null, enabled: true, description: null, defvalue: 1 }]);
		});

	});

	describe('Svidget.Widget.toString() method', function () {
		
		it('should correctly return a string representation calling manually', function () {
			test.value(widget.toString()).is("[Svidget.Widget { id: \"null\" }]");
		});
		
		it('should correctly return a string representation coercing to string', function () {
			test.value(widget + "").is("[Svidget.Widget { id: \"null\" }]");
		});

	});
	
	describe('Svidget.Widget.change event', function () {
		
		var changed = false;
		var prop = "enabled";

		widget.onchange(function (e) {
			changed = true;
			var obj = e.value;
			test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
			test.value(obj.property).is(prop);
		});

		it('should trigger when properties are changed', function () {
			changed = false;
			widget.enabled(false);
			test.bool(changed).isTrue();
			widget.enabled(true);
		});
		
		it('should not trigger when property value being set is the same as the current value', function () {
			changed = false;
			widget.enabled(true);
			test.bool(changed).isFalse();
		});

	});

	describe('Svidget.Widget.paramset event', function () {
	
		it('should trigger when setting the param', function () {
			var triggered = false;
			var expectedVal = null;
			
			widget.onparamset(null, "paramsettest", function (e) {
				triggered = true;
				var obj = e.value.value;
				test.value(obj).is(expectedVal);
			});
			// set up
			triggered = false;
			var name = "set-param";
			// test paramset event
			widget.addParam(name, 100);
			expectedVal = 200;
			widget.param(name).value(expectedVal);
			test.bool(triggered).isTrue();
			// test event removal
			widget.offparamset("paramsettest");
			triggered = false;
			expectedVal = 34;
			widget.param(name).value(expectedVal);
			test.bool(triggered).isFalse();
			// clean up
			widget.removeParam(name);
		});

	});

	describe('Svidget.Widget.paramchange event', function () {
	
		it('should trigger when changing the param', function () {
			var changed = false;
			var prop = "description";
			var val = null;
			
			widget.onparamchange(null, "paramchangetest", function (e) {
				changed = true;
				var obj = e.value;
				test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
				test.value(obj.property).is(prop);
				test.value(obj.value).is(val);
			});
			// set up
			widget.removeAllParams();
			changed = false;
			var name = "paramchangetest";
			var p1 = widget.addParam("p1", { description: "Basic description." });
			// test action change event
			p1.description(val = "Exciting description.");
			test.bool(changed).isTrue();
			// test event removal
			widget.offparamchange("paramchangetest");
			changed = false;
			p1.description(val = "---");
			test.bool(changed).isFalse();
			test.bool(widget.removeParam("p1")).isTrue();
		});

	});

	describe('Svidget.Widget.paramadd event', function () {
	
		it('should trigger when adding a param', function () {
			var triggered = false;
			var name = null;
			
			widget.onparamadd(null, "paramaddtest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj.__type).is("Svidget.Param");
				test.value(obj.name()).is(name);
			});
			// set up
			widget.removeAllParams();
			triggered = false;
			name = "add-param";
			widget.addParam(name);
			// test paramadd event
			test.bool(triggered).isTrue();
			// clean up
			widget.offparamadd("paramaddtest");
			widget.removeParam(name);
		});

	});

	describe('Svidget.Widget.paramremove event', function () {
	
		it('should trigger when removing a param', function () {
			var triggered = false;
			var name = null;
			
			widget.onparamremove(null, "paramremovetest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj).is(name);
			});
			// set up
			widget.removeAllParams();
			triggered = false;
			name = "remove-param";
			// test paramremove event
			widget.addParam(name);
			test.bool(triggered).isFalse();
			widget.removeParam(name);
			test.bool(triggered).isTrue();
			// test paramremove handler removal
			triggered = false;
			widget.offparamremove("paramremovetest");
			widget.addParam(name);
			test.bool(triggered).isFalse();
			widget.removeParam(name);
			test.bool(triggered).isFalse();
		});

	});

	describe('Svidget.Widget.actioninvoke event', function () {
	
		it('should trigger when invoking the action', function () {
			var triggered = false;
			var expectedReturnVal = null;
			
			widget.onactioninvoke(null, "actioninvoketest", function (e) {
				triggered = true;
				var obj = e.value.returnValue;
				test.value(obj).is(expectedReturnVal);
			});
			// set up
			triggered = false;
			var name = "invoke-action";
			// test action invoke event
			widget.addAction(name, { binding: invokeFunc, params: [{ name: "a" }, { name: "b" }] });
			expectedReturnVal = 8;
			widget.action(name).invoke(3, 5);
			test.bool(triggered).isTrue();
			// test event removal
			widget.offactioninvoke("actioninvoketest");
			triggered = false;
			widget.action(name).invoke(4, 6);
			test.bool(triggered).isFalse();
			// clean up
			widget.removeAction(name);
		});

		function invokeFunc(a, b) {
			return a + b;
		}
	});
	
	describe('Svidget.Widget.actionchange event', function () {
	
		it('should trigger when changing the action', function () {
			var changed = false;
			var prop = "description";
			var val = null;
			
			widget.onactionchange(null, "actionchangetest", function (e) {
				changed = true;
				var obj = e.value;
				test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
				test.value(obj.property).is(prop);
				test.value(obj.value).is(val);
			});
			// set up
			changed = false;
			var name = "actionchangetest";
			var a1 = widget.addAction("a1", { description: "description 1." });
			// test action change event
			a1.description(val = "a new description");
			test.bool(changed).isTrue();
			// test event removal
			widget.offactionchange("actionchangetest");
			changed = false;
			a1.description(val = "desc1---");
			test.bool(changed).isFalse();
			test.bool(widget.removeAction("a1")).isTrue();
		});

	});
	
	describe('Svidget.Widget.actionadd event', function () {
	
		it('should trigger when adding an action', function () {
			var triggered = false;
			var name = null;
			
			widget.onactionadd(null, "actionaddtest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj.__type).is("Svidget.Action");
				test.value(obj.name()).is(name);
			});
			// set up
			triggered = false;
			name = "add-action";
			widget.addAction(name);
			// test actionadd event
			test.bool(triggered).isTrue();
			// clean up
			widget.offactionadd("actionaddtest");
			widget.removeAction(name);
		});

	});
	
	describe('Svidget.Widget.actionremove event', function () {
	
		it('should trigger when removing an action', function () {
			var triggered = false;
			var name = null;
			
			widget.onactionremove(null, "actionremovetest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj).is(name);
			});
			// set up
			triggered = false;
			name = "remove-action";
			// test actionremove event
			widget.addAction(name);
			test.bool(triggered).isFalse();
			widget.removeAction(name);
			test.bool(triggered).isTrue();
			// test actionremove handler removal
			triggered = false;
			widget.offactionremove("actionremovetest");
			widget.addAction(name);
			test.bool(triggered).isFalse();
			widget.removeAction(name);
			test.bool(triggered).isFalse();
		});

	});
	
	describe('Svidget.Widget.actionparamchange event', function () {
	
		it('should trigger when changing the action param', function () {
			var changed = false;
			var prop = "description";
			var val = null;
			
			widget.onactionparamchange(null, "actionparamchangetest", function (e) {
				changed = true;
				var obj = e.value;
				test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
				test.value(obj.property).is(prop);
				test.value(obj.value).is(val);
			});
			// set up
			changed = false;
			var name = "actionchangetest";
			var a1 = widget.addAction("a1");
			var ap1 = a1.addParam("ap1", { description: "action param 1." });
			// test action change event
			ap1.description(val = "action param 1!!!!");
			test.bool(changed).isTrue();
			// test event removal
			widget.offactionparamchange("actionparamchangetest");
			changed = false;
			ap1.description(val = "---");
			test.bool(changed).isFalse();
			test.bool(widget.removeAction("a1")).isTrue();
		});

	});
	
	describe('Svidget.Widget.actionparamadd event', function () {
	
		it('should trigger when adding an action param', function () {
			var triggered = false;
			var name = null;
			
			widget.onactionparamadd(null, "actionparamaddtest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj.__type).is("Svidget.ActionParam");
				test.value(obj.name()).is(name);
			});
			// set up
			triggered = false;
			name = "add-actionparam";
			var a1 = widget.addAction("action1");
			a1.addParam(name);
			// test actionadd event
			test.bool(triggered).isTrue();
			widget.offactionparamadd("actionparamaddtest");
			triggered = false;
			a1.removeParam(name);
			a1.addParam(name);
			test.bool(triggered).isFalse();
			// clean up
			widget.removeAction("action1");
		});

	});
	
	describe('Svidget.Widget.actionparamremove event', function () {
	
		it('should trigger when removing an action param', function () {
			var triggered = false;
			var name = null;
			
			widget.onactionparamremove(null, "actionparamremovetest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj).is(name);
			});
			// set up
			triggered = false;
			name = "remove-actionparam";
			// test actionremove event
			var a1 = widget.addAction("action1");
			a1.addParam(name);
			test.bool(triggered).isFalse();
			a1.removeParam(name);
			test.bool(triggered).isTrue();
			// test actionparamremove handler removal
			triggered = false;
			widget.offactionparamremove("actionparamremovetest");
			a1.addParam(name);
			test.bool(triggered).isFalse();
			a1.addParam(name);
			test.bool(triggered).isFalse();
			// clean up
			widget.removeAction("action1");
		});

	});

	describe('Svidget.Widget.eventtrigger event', function () {
	
		it('should trigger when triggering the event', function () {
			var triggered = false;
			var val = "test";
			
			widget.oneventtrigger(null, "eventtriggertest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj).is(val);
			});
			triggered = false;
			var name = "trigger-event";
			widget.addEvent(name);
			widget.event(name).trigger(val);
			widget.offeventtrigger("eventtriggertest");
			triggered = false;
			widget.event(name).trigger(val);
			test.bool(triggered).isFalse();
			widget.removeEvent(name);
		});

	});
	
	describe('Svidget.Widget.eventchange event', function () {
	
		it('should trigger when changing the event', function () {
			var changed = false;
			var prop = "description";
			var val = null;
			
			widget.oneventchange(null, "eventchangetest", function (e) {
				changed = true;
				var obj = e.value;
				test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
				test.value(obj.property).is(prop);
				test.value(obj.value).is(val);
			});
			changed = false;
			var name = "eventchange";
			var e1 = widget.addEvent("e1", { description: "desc1" });
			var e2 = widget.addEvent("e2", { description: "desc2" });
			e1.description(val = "desc1!!!");
			test.bool(changed).isTrue();
			changed = false;
			e2.description(val = "desc2!!!");
			test.bool(changed).isTrue();
			widget.offeventchange("eventchangetest");
			changed = false;
			e1.description(val = "desc1---");
			test.bool(changed).isFalse();
			widget.removeEvent("e1");
			widget.removeEvent("e2");
		});

	});
	
	describe('Svidget.Widget.eventadd event', function () {
		
		it('should trigger when adding an event', function () {
			var triggered = false;
			var name = null;
			widget.oneventadd(null, "eventaddtest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj.__type).is("Svidget.EventDesc");
				test.value(obj.name()).is(name);
			});
			triggered = false;
			name = "complete-event";
			widget.addEvent(name);
			test.bool(triggered).isTrue();
			widget.offeventadd("eventaddtest");
		});

	});
	
	describe('Svidget.Widget.eventremove event', function () {
		
		it('should trigger when removing an event', function () {
			var triggered = false;
			var name = null;
			
			widget.oneventremove(null, "eventremovetest", function (e) {
				triggered = true;
				var obj = e.value;
				test.value(obj).is(name);
			});
			triggered = false;
			name = "complete-event";
			widget.addEvent(name);
			widget.removeEvent(name);
			test.bool(triggered).isTrue();
			widget.offeventremove("eventremovetest");
		});

	});


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

	function assertParam(sel, expected) {
		var p = widget.param(sel);
		if (expected === null)
			test.value(p).isNull();
		else {
			test.value(p.name()).is(expected.name);
			test.value(p.type()).is(expected.type);
		}
	}
	
	function assertParams(expected) {
		for (var i = 0; i < expected.length; i++) {
			assertParam(i, expected[i]);
		}
	}

	function assertParamsCollection(sel, expected) {
		var col = widget.params(sel);
		test.number(col.length).is(expected.length);
		for (var i = 0; i < expected.length; i++) {
			test.value(col[i].name()).is(expected[i].name);
			test.value(col[i].type()).is(expected[i].type);
		}
	}
	
	// assert Actions

	function assertAction(sel, expected) {
		var p = widget.action(sel);
		if (expected === null)
			test.value(p).isNull();
		else {
			test.value(p.name()).is(expected.name);
			test.value(p.description()).is(expected.description);
		}
	}

	function assertActions(expected) {
		for (var i = 0; i < expected.length; i++) {
			assertAction(i, expected[i]);
		}
	}
	
	function assertActionsCollection(sel, expected) {
		var col = widget.actions(sel);
		test.number(col.length).is(expected.length);
		for (var i = 0; i < expected.length; i++) {
			test.value(col[i].name()).is(expected[i].name);
			test.value(col[i].description()).is(expected[i].description);
		}
	}

	// assert Events
	
	function assertEvent(sel, expected) {
		var p = widget.event(sel);
		if (expected === null)
			test.value(p).isNull();
		else {
			test.value(p.name()).is(expected.name);
			test.value(p.description()).is(expected.description);
		}
	}
	
	function assertEvents(expected) {
		for (var i = 0; i < expected.length; i++) {
			assertAction(i, expected[i]);
		}
	}
	
	function assertEventsCollection(sel, expected) {
		var col = widget.events(sel);
		test.number(col.length).is(expected.length);
		for (var i = 0; i < expected.length; i++) {
			test.value(col[i].name()).is(expected[i].name);
			test.value(col[i].description()).is(expected[i].description);
		}
	}

});