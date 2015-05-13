/* Svidget.Widget.Test
 * 
 * Tests the Svidget.Widget class.
*/

var test = require('unit.js');

// Instantiate svidget root object - Widget mode
var window = { name: "window", document: {} }; // mode 1 == widget mode
var opts = { mode: 1 }; // force widget mode
var svidget = require('../../dist/svidget')(window, opts);

describe('Svidget.Widget Test', function () {
	
	var widget = svidget.$;
	
	it('should exist', function () {
		// Pre-Test
		test.value(widget).exists();
	});

	// test add-remove-add of param

});