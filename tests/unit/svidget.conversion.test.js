/* Svidget.Conversion.Test
 * 
 * Tests the Svidget.Conversion static class.
 * Accessible from svidget.conversion.
*/

var test = require('unit.js');

// Instantiate svidget root object
var window = { name: "window", document: {}, _from: "svidget.conversion.test" };
var svidget = require('../../dist/svidget')(window);

describe('Svidget.Conversion Test', function () {
	
	it('should exist', function () {
		test.value(svidget.conversion).exists();
	});

	it('should contain conversion methods', function () {
		test.value(svidget.conversion.to).exists();
		test.value(svidget.conversion.toString).exists();
		test.value(svidget.conversion.toNumber).exists();
		test.value(svidget.conversion.toBool).exists();
		test.value(svidget.conversion.toObject).exists();
	});
	
	describe('svidget.conversion.to', function () {
		//svidget.conversion.to(val, type, subtype, typedata)

		it('should convert to string', function () {
			test.string(svidget.conversion.to(3, "string")).is("3");
			test.string(svidget.conversion.to(true, "string")).is("true");
			test.string(svidget.conversion.to({ sport: "baseball" }, "string")).is("{\"sport\":\"baseball\"}");
			test.string(svidget.conversion.to(['tomato','carrot','potato'], "string")).is("[\"tomato\",\"carrot\",\"potato\"]");
		});

		it('should convert to number', function () {
			test.number(svidget.conversion.to("3", "number")).is(3);
			test.number(svidget.conversion.to("3.5", "number")).is(3.5);
			test.number(svidget.conversion.to("XYZ", "number")).isNaN(); // todo, unit.js should support a isNaN() here
			test.number(svidget.conversion.to(true, "number")).is(1);
			test.number(svidget.conversion.to(false, "number")).is(0);
		});

		it('should convert to bool', function () {
			test.bool(svidget.conversion.to("false", "bool")).isFalse();
			test.bool(svidget.conversion.to("FALSE", "bool")).isFalse();
			test.bool(svidget.conversion.to("true", "bool")).isTrue();
			test.bool(svidget.conversion.to("TRUE", "bool")).isTrue();
			test.bool(svidget.conversion.to(0, "bool")).isFalse();
			test.bool(svidget.conversion.to(1, "bool")).isTrue();
			test.bool(svidget.conversion.to(2, "bool")).isTrue();
			test.bool(svidget.conversion.to(-100, "bool")).isTrue();
			test.bool(svidget.conversion.to(null, "bool")).isFalse();
		});

		it('should convert to array', function () {
			test.value(svidget.conversion.to("[]", "array")).isArray();
			test.array(svidget.conversion.to("[]", "array")).is([]);
			test.value(svidget.conversion.to(null, "array")).isNull();
			var arr1 = [1, 2, 3];
			test.array(svidget.conversion.to(arr1, "array")).isIdenticalTo(arr1);
			test.array(svidget.conversion.to(3, "array")).is([3]);
			test.array(svidget.conversion.to("[100, false, { 'key': 1 }]", "array")).is([100, false, { key: 1 }]);
			test.array(svidget.conversion.to("['single','quotes']", "array")).is(['single', 'quotes']);
			test.array(svidget.conversion.to("[invalid,'array']", "array")).is(["[invalid,'array']"]);
		});

		it('should convert to object', function () {
			// todo: get from jsonify test - update: test jsonify separately
			test.value(svidget.conversion.to("{}")).is({});
			test.object(svidget.conversion.to("{}")).isEmpty();
			test.object(svidget.conversion.to("{}", "object")).isEmpty();
			test.object(svidget.conversion.to("{ \"foo\": 44 }", "object")).is({ foo: 44 });
			test.object(svidget.conversion.to("{ 'foo': 44 }", "object")).is({ foo: 44 });
			test.object(svidget.conversion.to("{ 'foo': { 'bar': 'frog' } }", "object")).is({ foo: { bar: 'frog' } });
			test.object(svidget.conversion.to("{ 'foo': [1, 2, 3] }", "object")).is({ foo: [1, 2, 3] });
			test.value(svidget.conversion.to("{ 'foo' }", "object")).is("{ 'foo' }"); // invalid parse, so reverts back to string
		});

		it('should convert to string choice', function () {
			test.string(svidget.conversion.to("C", "string", "choice", "A|B|C")).is("C");
			test.string(svidget.conversion.to("D", "string", "choice", "A|B|C")).is("A");
			test.string(svidget.conversion.to(2, "string", "choice", "1|2|3")).is("2");
			test.string(svidget.conversion.to("foo", "string", "choice", "")).is(""); // empty string is a choice
			test.string(svidget.conversion.to("foo", "string", "choice", null)).is("foo");
		});

		it('should convert to number integer', function () {
			test.number(svidget.conversion.to(2, "number", "integer")).is(2);
			test.number(svidget.conversion.to(2.75, "number", "integer")).is(2);
			test.number(svidget.conversion.to("2.75", "number", "integer")).is(2);
		});
	});

	describe('svidget.conversion.jsonifyString', function () {
		// Svidget.Conversion.jsonifyString(val)
		// jsonifyString converts single quotes to double quotes when used as string delimiters
		it('should correctly parse these strings', function () {
			test.value(svidget.conversion.jsonifyString("'hello'")).is("\"hello\"");
			test.value(svidget.conversion.jsonifyString("\"hello\"")).is("\"hello\"");
			test.value(svidget.conversion.jsonifyString("\"'hello'\"")).is("\"'hello'\"");
			test.value(svidget.conversion.jsonifyString("'\"hello\"'")).is("\"\\\"hello\\\"\"");
			test.value(svidget.conversion.jsonifyString("'hello\\\"there'")).is("\"hello\\\\\\\"there\"");
			test.value(svidget.conversion.jsonifyString("\"hello\\\"there\"")).is("\"hello\\\"there\"");
			test.value(svidget.conversion.jsonifyString("'hello\\\'there'")).is("\"hello'there\"");
			test.value(svidget.conversion.jsonifyString("['hello', 'world']")).is("[\"hello\", \"world\"]");
			test.value(svidget.conversion.jsonifyString("['hello', 'world\"it\"']")).is("[\"hello\", \"world\\\"it\\\"\"]");
			test.value(svidget.conversion.jsonifyString("['hello', ['world\"it\"']]")).is("[\"hello\", [\"world\\\"it\\\"\"]]");
			test.value(svidget.conversion.jsonifyString("['he\\\'ll\\\'o', ['world\"it\"']]")).is("[\"he'll'o\", [\"world\\\"it\\\"\"]]");
		});
	});

});