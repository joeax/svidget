//
// Run Mocha manually (outside of Grunt) - for debugging unit tests only
// From Visual Studio: 
//	Set this page as the start page, and run. 
//	Set breakpoints in the unit tests files(unit/*.js) as needed.
//
// To change reporters (from 'spec'), see: http://mochajs.org/#reporters
// Also see: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
//

var Mocha = require('mocha');
var mocha = new Mocha();
// run tests un unittest.js
mocha.reporter('spec').addFile('./tests/unittest.js').run();