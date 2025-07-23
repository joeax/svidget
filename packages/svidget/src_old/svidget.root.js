/*****************************************
svidget.root.js

Contains the root object.

Dependencies:
Svidget.Core

******************************************/


/**
 * Represents the root object (access via global svidget var).
 * @constructor
 * @mixes ObjectPrototype
 * @memberof Svidget
 * @param {object} window - The window object in browser, or mock window object in server/node environment
 * @param {object} options - Options to simulate the environment (usually in node).
 */
/*
// Svidget is an object var not a class var, so instantiate with ()
// We declare it this way so that we can maintain private members via var
// REMARKS: this should be instantiated last after all ofther lib scripts loaded
*/
Svidget.Root = function (w, options) {
	this.__type = "Svidget.Root";
	var that = this;
	
	// update "window" - for node environments
	if (w != null) {
		window = w;
		document = w.document || {};
	}

	// private fields
	var privates = new (function () {
		this.writable = ["current", "widgets", "connected", "loaded"];
		// Common:
		this.comm = new Svidget.Communicator();
		this.eventContainer = new Svidget.EventContainer(["loaded"], that); // todo: move event names to array at bottom
		this.loaded = false;
		// Widget:
		this.current = null;
		this.connected = false;
		// Page:
		this.widgets = null; // WidgetReferenceCollection
		this.options = options || {};
	})();
	// private accessors
	this.setup(privates);

	// state
	this.isBrowser = true; // whether in browser or in some other execution environment i.e. Node.js
	//this.root = root || window; // i.e. window
	//this.document = root.document || {};
	this.docType = null;

	this.setCurrent = function (widget) {
		privates.current = widget;
	}
	
	// invoke init
	// todo: convert to private methods
	this._init();

	// API Extensions
	Object.defineProperty(this, "conversion", Svidget.readOnlyProperty(Svidget.Conversion));
	Object.defineProperty(this, "Collection", Svidget.readOnlyProperty(Svidget.Collection));
	Object.defineProperty(this, "dom", Svidget.readOnlyProperty(Svidget.DOM));
	Object.defineProperty(this, "util", Svidget.readOnlyProperty(Svidget.Util));

	// set this singleton instance
	Svidget.root = this;

};

Svidget.Root.prototype = {

	_init: function () {
		//this._initDomObjects();
		this._initEvents();
		this._initPrototypes();
		this.initInternal();
		this._initReady();
	},

	_initEvents: function () {
		//this.addMessageEvent();
	},

	_initPrototypes: function () {
		if (this.isWidget()) {
			Svidget.extend(Svidget.Root, Svidget.Root.WidgetPrototype, true);
		}
		else {
			Svidget.extend(Svidget.Root, Svidget.Root.PagePrototype, true);
		}
	},

	_initReady: function () {
		// is DOM loaded?
		// if not attach handler, if so call ready
		if (this.isDomReady()) {
			this._ready();
		}
		else {
			// add ready handler
			this.addReadyEvents();
		}
	},

	// protected: overriden in prototypes
	initInternal: function () { },

	_ready: function () {
		// if widget create Widget class
		this.isReady = true;
		if (this.isWidget()) {
			this.readyWidget();
		}
		// else parse page for role="widget"
		else {
			this.readyPage();
		}
	},

	getDocType: function () {
		// determine if in widget
		if (!document.documentElement) return Svidget.DocType.html;
		var localName = document.documentElement.localName;
		var namespaceUri = document.documentElement.namespaceURI;
		if (localName == "svg" && namespaceUri == Svidget.Namespaces.svg) return Svidget.DocType.svg;
		return Svidget.DocType.html;
	},
	
	getOption: function (name) {
		return this.options()[name];
	},

	/**
	 * Determines if the framework is instantiated in a widget file.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @returns {boolean}
	*/
	isWidget: function () {
		if (this.getOption("mode") == Svidget.DocType.svg) return true; // for debugging
		this.docType = this.getDocType();
		return this.docType == Svidget.DocType.svg;
	},

	// ready if interactive or complete
	isDomReady: function () {
		// determine DOM loaded
		var rs = document.readyState;
		if (rs == null || !Svidget.DocReadyState[rs]) return false;
		return (Svidget.DocReadyState[rs] >= Svidget.DocReadyState.interactive); // interactive or complete
	},

	addReadyEvents: function () {
		// attach to: DOMContentLoaded, readystatechange, load
		// we attach at all 3 stages
		var handler = Svidget.wrap(this.readyHandler, this);
		Svidget.DOM.on(document, 'DOMContentLoaded', handler);
		Svidget.DOM.on(document, 'readystatechange', handler);
		Svidget.DOM.on(window, 'load', handler);
		// todo: setInterval as last resort check, if needed
	},

	readyHandler: function () {
		this.ensureReady();
	},

	ensureReady: function () {
		if (!this.isReady) this._ready();
		this.isReady = true;
	},

	// note: loaded state only applies to declared widgets ? (needs determiniation)
	// widgets loaded via svidget.load() 
	markLoaded: function () {
		if (this.getset("loaded") === true) return;
		this.getset("loaded", true);
		this.triggerLoad();
	},

	/* REGION Events */

	eventContainer: function () {
		return this.getset("eventContainer");
	},

	/**
	 * Registers an event handler for the global object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {string} type - The event type i.e. "load".
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	on: function (type, data, name, handler) {
		this.eventContainer().on(type, data, name, handler);
	},

	/**
	 * Unregisters an event handler for the global object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {string} type - The event type i.e. "load".
	 * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	 * @returns {boolean} - True if the event handler was successfully removed.
	*/
	off: function (type, handlerOrName) {
		this.eventContainer().off(type, handlerOrName);
	},

	// public
	// triggers the event, using the specified data as input
	trigger: function (name, value) {
		// call something on parent widget
		this.eventContainer().trigger(name, value);
	},

	/**
	 * Registers an event handler for the "load" event for the global object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	/*
	// note: this can happen before window.onload event
	// convention: use past tense (ie "loaded") as method name to present tense event name (ie "load")
	*/
	// deprecate loaded in favor of onload
	loaded: function (data, name, handler) {
		this.onload(data, name, handler);
	},
	onload: function (data, name, handler) {
		this.on("load", data, name, handler);
	},
	offload: function (handlerOrName) {
		this.off("load", handlerOrName);
	},
	offdeclaredload: function () {
		this.off("load", Svidget.declaredHandlerName);
	},

	/**
	 * Registers an event handler for the "widgetload" event for the global object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	// wires up a handler for the "widgetload" event
	widgetloaded: function (data, name, handler) {
		/*if (handler === undefined && Svidget.isFunction(widgetID)) {
			handler = widgetID;
			widgetID = null;
		}*/
		this.widgetloaded(data, name, handler);
	},
	onwidgetload: function (data, name, handler) {
		this.on("widgetload", data, name, handler);
	},
	offwidgetload: function (handlerOrName) {
		this.off("widgetload", handlerOrName);
	},
	offdeclaredwidgetload: function () {
		this.off("widgetload", Svidget.declaredHandlerName);
	},

	// internal
	triggerLoad: function () {
		this.trigger("load");
	},

	// internal
	triggerWidgetLoad: function (widgetID) {
		this.trigger("widgetload", widgetID);
	},

	/* Communication */

	comm: function () {
		return this.getset("comm");
	},

	routeFromParent: function (name, payload) {
		Svidget.log("root: routeFromParent {name: " + name + "}");
		this.comm().receiveFromParent(name, payload);
	},

	routeFromWidget: function (name, payload, widgetID) {
		Svidget.log("root: routeFromWidget {name: " + name + "}");
		this.comm().receiveFromWidget(name, payload, widgetID);
	},

	receiveFromParent: function (name, payload) {
		// overriden in root.widget
	},

	receiveFromWidget: function (name, payload, widgetID) {
		// overriden in root.page
	},

	/* Properties */

	/**
	 * Gets the current widget. 
	 * @method
	 * @abstract
	 * @returns {Svidget.Widget} - The current widget.
	*/
	current: function () {
		return null;
	},

	/**
	 * Gets whether the widget is connected to a parent page.
	 * @method
	 * @abstract
	 * @memberof Svidget.Root
	 * @returns {boolean}
	*/
	connected: function (val) {
		var res = this.getset("connected", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	},

	options: function () {
		return this.getset("options");
	}

}


Svidget.extend(Svidget.Root, Svidget.ObjectPrototype);
