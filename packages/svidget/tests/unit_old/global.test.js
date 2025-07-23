/* Svidget.Param.Test
 * 
 * Tests the Svidget.Param class.
*/

var test = require('unit.js');

// Instantiate svidget root object
var window = { name: "window", document: {} };
var svidget = require('../../dist/svidget')(window);

describe('Svidget Global Test', function () {
	
	it('should exist', function () {
		test.value(svidget).exists();
	});

	it('should be of type Svidget.Root', function () {
		test.string(svidget.__type).is("Svidget.Root");
	});

});