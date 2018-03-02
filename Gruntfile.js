module.exports = function (grunt) {
	
	var coreFiles = [
    // core
		'src/svidget.core.js',
		'src/svidget.objectprototype.js',
		'src/svidget.eventprototype.js',
		'src/svidget.paramprototype.js',
		'src/svidget.collection.js',
		'src/svidget.objectcollection.js',
		'src/svidget.communicator.js',
		'src/svidget.conversion.js',
		'src/svidget.dom.js',
		'src/svidget.domitem.js',
		'src/svidget.domquery.js',
		'src/svidget.enums.js',
		'src/svidget.event.js',
		'src/svidget.eventcontainer.js',
		'src/svidget.root.js',
		'src/svidget.util.js'
	];
	
	var objectFiles = [
		// objects
		'src/svidget.action.js',
		'src/svidget.actioncollection.js',
		'src/svidget.actionparam.js',
		'src/svidget.actionparamcollection.js',
		'src/svidget.eventdesc.js',
		'src/svidget.eventdesccollection.js',
		'src/svidget.param.js',
		'src/svidget.paramcollection.js',
		'src/svidget.widget.js'
	];
	
	var proxyFiles = [
		// proxies
		'src/svidget.proxy.js',
		'src/svidget.actionproxy.js',
		'src/svidget.actionproxycollection.js',
		'src/svidget.actionparamproxy.js',
		'src/svidget.actionparamproxycollection.js',
		'src/svidget.eventdescproxy.js',
		'src/svidget.eventdescproxycollection.js',
		'src/svidget.paramproxy.js',
		'src/svidget.paramproxycollection.js',
		'src/svidget.widgetreference.js'
	];
	
	var startFiles = [
		// start
		'src/svidget.root.page.js',
		'src/svidget.root.widget.js',
		'src/svidget.start.js'
	];
	
	var allFiles = [].concat(coreFiles, objectFiles, proxyFiles, startFiles);
	
	/*
	var sourcePageFiles = [
    'src/proxy.js',
    'src/action.js',
    'src/actionproxy.js',
    'src/actionparam.js',
    'src/actionparamproxy.js',
    'src/actionparamproxycollection.js',
    'src/eventdesc.js',
    'src/eventdescproxy.js',
    'src/param.js',
    'src/paramproxy.js',
    'src/root.page.js',
    'src/widgetreference.js',
    'src/start.js'
  ];
	
	var sourceWidgetFiles = [
    'src/action.js',
    'src/actioncollection.js',
    'src/actionparam.js',
    'src/actionparamcollection.js',
    'src/eventdesc.js',
    'src/eventdesccollection.js',
    'src/param.js',
    'src/paramcollection.js',
    'src/root.widget.js',
    'src/widget.js',
    'src/start.js'
  ];
	*/

	function commentFilter(node, comment) {
		// notes on comment filtering:
		// https://github.com/mishoo/UglifyJS2#keeping-comments-in-the-output
		var comm = comment.value;
		// file header - strip out
		if (comm.substr(0, 6) == "******") return false;
		// single line, jsdoc, main header - keep in
		if (comm.substr(0, 1) == "*" || comm.indexOf("2014") > 0 || comment.type == "comment1") return true;
		// multiline, others - strip out
		return false;
	}
	
	function getClosureWrapArray() {
		var closure = grunt.file.read("misc/closure.js");
		return closure.split("//BODY//");
	}
	
	var config = {
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';\n'
			},
			full: {
				src: allFiles,
				dest: 'dist/svidget-full.js'
			},
			header: {
				src: ['dist/header.js', 'dist/svidget.js'],
				dest: 'dist/svidget.js'
			}
			/*,
			page: {
				src: sourceFiles,
				dest: 'dist/kinetic-v<%= pkg.version %>-beta.js'
			},
			widget: {
				src: sourceFiles,
				dest: 'dist/kinetic-v<%= pkg.version %>.js'
			},
			core: {
				src: coreFiles,
				dest: 'release/svidget-core.js'
			},*/
		},
		wrap: {
			full: {
				src: ['dist/svidget-full.js'],
				dest: 'dist/svidget-full.js',
				options: {
					wrapper: getClosureWrapArray() //[';(function () {\n', '\n}).call(this);']
				}
			}
		},
		uglify: {
			full: {
				options: {
					mangle: false,
					beautify: true,
					preserveComments: commentFilter, //'all',
					compress: {
						booleans: false,
						cascade: false,
						sequences: false
					}
				},
				files: {
					'dist/svidget.js': 'dist/svidget-full.js'
				}
			},
			min: {
				options: {
					banner: '/* Svidget.js v<%= pkg.version %> on <%= grunt.template.today("yyyy-mm-dd") %>, Copyright <%= grunt.template.today("yyyy") %> Joe Agster http://www.svidget.org MIT License */\r\n',
					mangle: true,
					beautify: false,
					preserveComments: false,
					compress: {
						booleans: true,
						cascade: true,
						sequences: true
					}
				},
				files: {
					'dist/svidget.min.js': 'dist/svidget-full.js'
				}
			},
			header: {
				options: {
					preserveComments: 'all'
				},
				files: {
					'dist/header.js': 'misc/header.js'
				}
			}
		},
		replace: {
			header: {
				options: {
					variables: {
						version: '<%= pkg.version %>',
						date: '<%= grunt.template.today("yyyy-mm-dd") %>',
						year: '<%= grunt.template.today("yyyy") %>',
					},
					prefix: '@@'
				},
				files: [{
					src: ['dist/header.js'],
					dest: 'dist/header.js'
				}]
			}
		},
		textreplace: {
			full: {
				src: ['dist/svidget.js'],
				overwrite: true,
				replacements: [{ from: '\r', to: '' }] // normalize line endings
			}
		},
		copy: {
			full: {
				src: 'dist/svidget.js',
				dest: 'dist/svidget-<%= pkg.version %>.js'
			},
			min: {
				src: 'dist/svidget.min.js',
				dest: 'dist/svidget-<%= pkg.version %>.min.js'
			},
			header: {
				src: 'misc/header.js',
				dest: 'dist/header.js'
			},
		},
		clean: {
			// clean release folder
			build: ['dist/svidget-full.js', 'dist/header.js']
		},

		// TEST
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					//captureFile: 'results.txt', // Optionally capture the reporter output to a file
					quiet: false, // Optionally suppress output to standard out (defaults to false)
					//clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
				},
				src: ['tests/unittest.js']
			}
		}
	}
	
	// TODO:
	// X get rid of file headers
	// x inject header, then wrap rest of files in closure (try to use uglify for header banner)
	// X full version comments: double slash (//), jsdoc (/**) stay, /* */ gets deleted
	// X fix line endings in full version of file
	// X replace version, year and date in header
	
	// configure
	grunt.initConfig(config);
	
	// load the plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.renameTask('replace', 'textreplace'); //rename text-replace's "replace" to "textreplace" so it doesn't conflict with grunt-replace
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-mocha-test');
	
	var buildTasks = [
		'concat:full', 
		'wrap:full',
		'uglify:full', 
		'uglify:min', 
		'copy:header', 
		'replace:header', 
		'concat:header', 
		'textreplace:full', 
		'copy:full', 
		'copy:min', 
		'clean'
	];
	
	var testTasks = ['mochaTest'];
	
	var allTasks = [].concat(buildTasks, testTasks);

	// grunt all
	grunt.registerTask('all', 'Run all release tasks', allTasks);
	// grunt build
	grunt.registerTask('build', 'Run build tasks', buildTasks);
	// grunt test
	grunt.registerTask('test', 'Run test tasks', testTasks);
	// grunt clean
	grunt.registerTask('cleanup', 'Run clean tasks', ['clean']);
}