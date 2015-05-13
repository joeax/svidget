var window = { name: "window", document: {} };

var svidget = require('../dist/svidget')(window);
if (svidget.__type = "Svidget.Root")
	console.log("A match!");
else
	console.log("Not a match!");


// NaN
console.log(parseFloat("foo") === NaN);
console.log(NaN === NaN);
console.log(NaN == NaN);