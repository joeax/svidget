var window = { name: "window", document: {} };

var svidget = require('../dist/svidget')(window);
if (svidget.__type = "Svidget.Root")
	console.log("A match!");
else
	console.log("Not a match!");
