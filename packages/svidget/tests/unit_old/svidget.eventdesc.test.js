/* Svidget.Param.Test
 * 
 * Tests the Svidget.Param class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {}, _from: "svidget.eventdesc.test" }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.EventDesc tests', function () {
	
	var widget = svidget.$;
	
	it('should exist', function () {
		// pre-test
		test.value(widget).exists();
		test.value(widget.events()).exists();
	});

	it('should be able to create an event', function () {
		// sanity test 1
		var ap1 = widget.newEvent("scream", { external: false });
		test.value(ap1.name()).is("scream");
		test.bool(ap1.external()).isFalse();
	});
	
	it('should be able to create a complex event', function () {
		// sanity test 2
		var options = {
			description: "A complex scream event.",
			enabled: 1,
			external: false
		};
		var e1 = widget.newEvent("complexscream", options);
		
		// tests
		test.value(e1.name()).is("complexscream");
		test.value(e1.description()).is("A complex scream event.");
		test.bool(e1.enabled()).isTrue();
		test.bool(e1.external()).isFalse();
		test.value(e1.parent()).isIdenticalTo(widget);
	});
	
	describe('Svidget.EventDesc.description() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertDescription(widget.newEvent("test1", { description: "this is description." }), "this is description.");
			assertDescription(widget.newEvent("test1", { description: 3 }), "3");
			assertDescription(widget.newEvent("test1", { description: false }), "false");
			assertDescription(widget.newEvent("test1", { description: { foo: "bar" } }), "{\"foo\":\"bar\"}");
			assertDescription(widget.newEvent("test1", { description: null }), null);
		});
		
		it('should be set as string when setting', function () {
			assertDescriptionSet(widget.newEvent("test1"), "this is description.", "this is description.");
			assertDescriptionSet(widget.newEvent("test1"), 3, "3");
			assertDescriptionSet(widget.newEvent("test1"), false, "false");
			assertDescriptionSet(widget.newEvent("test1"), { foo: "bar" }, "{\"foo\":\"bar\"}");
			assertDescriptionSet(widget.newEvent("test1"), null, null);
		});
	
	});
	
	describe('Svidget.EventDesc.enabled() property', function () {
		
		it('should default to true', function () {
			assertEnabled(widget.newEvent("event1"), true);
		});
		
		it('should set to true when passing value other than false in constructor', function () {
			assertEnabled(widget.newEvent("event1", { enabled: true }), true);
			assertEnabled(widget.newEvent("event1", { enabled: "X" }), true);
			assertEnabled(widget.newEvent("event1", { enabled: null }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertEnabled(widget.newEvent("event1", { enabled: false }), false);
			assertEnabled(widget.newEvent("event1", { enabled: "false" }), false);
		});
		
		it('should set to true when using value other than false', function () {
			assertEnabledSet(widget.newEvent("event1"), true, true);
			assertEnabledSet(widget.newEvent("event1"), "X", true);
			assertEnabledSet(widget.newEvent("event1"), null, true);
		});
		
		it('should set to false when using false or "false"', function () {
			assertEnabledSet(widget.newEvent("event1"), false, false);
			assertEnabledSet(widget.newEvent("event1"), "false", false);
		});

	});
	
	describe('Svidget.EventDesc.external() property', function () {
		
		it('should default to true', function () {
			assertExternal(widget.newEvent("event1"), true);
		});
		
		it('should set to true when passing value other than false in constructor', function () {
			assertExternal(widget.newEvent("event1", { external: "X" }), true);
			assertExternal(widget.newEvent("event1", { external: null }), true);
		});
		
		it('should set to false when passing false or "false" in constructor', function () {
			assertExternal(widget.newEvent("event1", { external: false }), false);
			assertExternal(widget.newEvent("event1", { external: "false" }), false);
		});
		
		it('should set to true when using value other than false', function () {
			assertExternalSet(widget.newEvent("event1"), "X", true);
			assertExternalSet(widget.newEvent("event1"), null, true);
		});
		
		it('should set to false when using false or "false"', function () {
			assertExternalSet(widget.newEvent("event1"), false, false);
			assertExternalSet(widget.newEvent("event1"), "false", false);
		});

	});
	
	describe('Svidget.EventDesc.name() property', function () {
		
		it('should be set as string when passing in constructor', function () {
			assertName(widget.newEvent("test1"), "test1");
			assertName(widget.newEvent(3), "3");
			assertName(widget.newEvent(false), "false");
			assertName(widget.newEvent({ foo: "bar" }), "{\"foo\":\"bar\"}");
		});
		
		it('should not be modifiable', function () {
			var ev = widget.newEvent("test1");
			var result = ev.name("test1!!!");
			test.value(ev.name()).is("test1");
			test.bool(result).isFalse();
		});
		
	});
	
	describe('Svidget.EventDesc.trigger() method', function () {
		
		it('should trigger with value', function () {
			var ev1 = widget.newEvent("ev1");
			var triggered = false;
			var val = null;
			ev1.ontrigger(function (e) {
				triggered = true;
				val = e.value;
			});
			ev1.trigger(5);
			test.bool(triggered).isTrue();
			test.value(val).is(5);
		});

		it('should not invoke when event is not enabled', function () {
			var ev1 = widget.newEvent("ev1", { enabled: false });
			var triggered = false;
			ev1.ontrigger(function (e) {
				triggered = true;
			});
			ev1.trigger();
			test.bool(triggered).isFalse();
		});

	});
	
	describe('Svidget.EventDesc.toTransport() method', function () {

		it('should correctly return a transport with applicable proxy properties', function () {
			var ev = widget.newEvent("myevent", {
				description: "This is event.",
				external: false,
				enabled: true
			});
			var transport = ev.toTransport();
			// has properties
			test.object(transport)
							.hasProperty('name')
							.hasProperty('description')
							.hasProperty('external')
							.hasProperty('enabled');
			// test transport values
			test.value(transport.name).is("myevent");
			test.value(transport.description).is("This is event.");
			test.value(transport.external).is(false);
			test.value(transport.enabled).is(true);
		});

	});

	describe('Svidget.EventDesc.toString() method', function () {

		it('should correctly return a string representation calling manually', function () {
			test.value(widget.newEvent("myevent").toString()).is("[Svidget.EventDesc { name: \"myevent\" }]");
		});

		it('should correctly return a string representation coercing to string', function () {
			test.value(widget.newEvent("myevent") + "").is("[Svidget.EventDesc { name: \"myevent\" }]");
		});

	});

	describe('Svidget.EventDesc.change event', function () {
		
		it('should trigger when properties are changed', function () {
			var e = widget.newEvent("myevent");
			assertChangeEventTrigger(e, "external", false);
		});
		
		it('should trigger when properties are changed with event name and data', function () {
			var e = widget.newEvent("myevent", { description: "Hey" });
			assertChangeEventTrigger(e, "description", "Hey!!!!", true, { foo: "data" }, "myhandler1");
		});

		it('should not trigger when property value being set is the same as the current value', function () {
			var e = widget.newEvent("myevent", { description: "hello" });
			assertChangeEventTrigger(e, "description", "hello", false);
		});

	});
	
	describe('Svidget.EventDesc.trigger event', function () {
		
		it('should trigger when trigger is called', function () {
			var e = widget.newEvent("myevent");
			assertTriggerEventTrigger(e, 5);
		});
		
		it('should trigger when trigger is called with event name and data', function () {
			var e = widget.newEvent("myevent");
			assertTriggerEventTrigger(e, 1, true, { test: "hiya!" }, "myhandler1");
		});
		
		it('should not trigger when enabled is false', function () {
			var e = widget.newEvent("myevent", { enabled: false });
			assertTriggerEventTrigger(e, null, false);
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

	function assertExternal(action, external) {
		test.value(action.external()).is(external);
	}
	
	function assertExternalSet(action, value, external) {
		action.external(value);
		test.value(action.external()).is(external);
	}

	function assertChangeEventTrigger(event, prop, newValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var changed = false;
		event.onchange(eventData, eventName, function (e) {
			changed = true;
			var obj = e.value;
			test.object(obj)
					.hasProperty("property")
					.hasProperty("value");
			test.value(obj.property).is(prop);
			test.value(obj.value).is(newValue);
			assertEventObject(e, eventData, eventName);
		});
		event[prop](newValue);
		test.value(changed).is(shouldTrigger);
	}
	
	function assertTriggerEventTrigger(event, eventValue, shouldTrigger, eventData, eventName) {
		shouldTrigger = shouldTrigger === undefined ? true : shouldTrigger;
		var triggered = false;
		event.ontrigger(eventData, eventName, function (e) {
			triggered = true;
			var obj = e.value;
			test.value(obj).is(eventValue);
			assertEventObject(e, eventData, eventName);
		});
		event.trigger(eventValue);
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