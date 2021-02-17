/*****************************************
svidget.root.js

Contains the root object.

Dependencies:
Svidget.Core

******************************************/

/// <reference path="types.ts" />
/// <reference path="../communication/communicator.ts" />
/// <reference path="../core/objectBase.ts" />
/// <reference path="../widget/widget.ts" />
/// <reference path="../widget/widgetReference.ts" />

namespace Svidget {

	const INITIAL_PROPS: RootProps = {
		name: 'Root',
		external: false,
        loaded: false,
        connected: false
    };

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
export class Root
extends ObjectBase<RootProps, RootEventTypes> implements RootArtifact {
	private _current: Widget;
	private _widgets: Collection<WidgetReference>;
	private comm: Communicator;
	private isBrowser: boolean = true;
	private isReady: boolean = false;
	private docType;

	constructor() {
		super(INITIAL_PROPS, undefined, "Svidget.Root");
	//= function (w, options) {

	
	// update "window" - for node environments
	//const document = window.document || {};

	// invoke init
	// todo: convert to private methods
	this.init();

	// API Extensions
	//Object.defineProperty(this, "conversion", Svidget.readOnlyProperty(Svidget.Conversion));
	//Object.defineProperty(this, "Collection", Svidget.readOnlyProperty(Svidget.Collection));
	//Object.defineProperty(this, "dom", Svidget.readOnlyProperty(Svidget.DOM));
	//Object.defineProperty(this, "util", Svidget.readOnlyProperty(Svidget.Util));

	// set this singleton instance
	//Svidget.root = this;
		this.comm = new Communicator();
		this.p2wComm = new PageWidgetCommunicator(this.comm, this.handleReceiveWidgetMessage);
		//this.w2pComm = null; //todo
	}


	private init() {
		this.initLifetime();
		this.initReady();
	}

	/*_initEvents() {
		//this.addMessageEvent();
	},*/

	/*_initPrototypes() {
		if (this.isWidget()) {
			Svidget.extend(Svidget.Root, Svidget.Root.WidgetPrototype, true);
		}
		else {
			Svidget.extend(Svidget.Root, Svidget.Root.PagePrototype, true);
		}
	},*/

	private initReady() {
		// is DOM loaded?
		// if not attach handler, if so call ready
		if (this.isDomReady()) {
			this.ready();
		}
		else {
			// add ready handler
			this.addReadyEvents();
		}
	}

	private initLifetime() {
		if (this.hasWidgets) {
			this.initPage();
		}
		if (this.isWidget) {
			this.initWidget();
		}
	}

	private initPage() {
		this.idSeed = 1; // seed for widget IDs
		window._svidget = "page";
		this.connected(true); // default to true for page
		Object.defineProperty(this, "$", Svidget.readOnlyProperty(null));
	}

	private initWidget() {
		// init widget object
		this.loadCurrent();
		// notify parent that widget is initialized and ready to be started
		// update: moved to sviget.start because we don't want to signal until svidget object created
		//this.signalInitialized();
		window._svidget = "widget";
	}

	private ready(): void {
		// if widget create Widget class
		this.isReady = true;
		if (this.isWidget()) {
			this.readyWidget();
		}
		// else parse page for role="widget"
		else {
			this.readyPage();
		}
	}


	/* Properties */

	/**
	 * Gets the current widget. 
	 * @method
	 * @abstract
	 * @returns {Svidget.Widget} - The current widget.
	*/
	public get current() {
		return null;
	}

	/**
	 * Gets whether the widget is connected to a parent page.
	 * @method
	 * @abstract
	 * @memberof Svidget.Root
	 * @returns {boolean}
	*/
	public get connected(val) {
		var res = this.getset("connected", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	}

	/**
	 * Gets a collection of all widgets, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * widgets(0)
	 * widgets("widget-1")
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {object} [selector] - An integer index or string ID
	 * @returns {Svidget.ObjectCollection} - A collection based on the selector, or the entire collection.
	*/
	public get widgets(selector) {
		var col = this.getWidgets();
		return this.select(col, selector);
	}

	/**
	 * Determines if the framework is instantiated in a widget file.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @returns {boolean}
	*/
	public get isWidget() {
		// todo: cache value
		if (this.getOption("mode") == Svidget.DocType.svg) return true; // for debugging
		this.docType = this.getDocType();
		// todo 2021: also check if it has svidget namespace
		return this.docType == Svidget.DocType.svg;
	}

	/**
	 * Determines if the framework is instantiated in a widget file.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @returns {boolean}
	*/
	public get hasWidgets() {
		// todo
		return false;
	}

	private getDocType() {
		// determine if in widget
		if (!document.documentElement) return Svidget.DocType.html;
		var localName = document.documentElement.localName;
		var namespaceUri = document.documentElement.namespaceURI;
		if (localName == "svg" && namespaceUri == Svidget.Namespaces.svg) return Svidget.DocType.svg;
		return Svidget.DocType.html;
	}
	

	// ready if interactive or complete
	private isDomReady() {
		// determine DOM loaded
		var rs = document.readyState;
		if (rs == null || !Svidget.DocReadyState[rs]) return false;
		return (Svidget.DocReadyState[rs] >= Svidget.DocReadyState.interactive); // interactive or complete
	}

	private addReadyEvents() {
		// attach to: DOMContentLoaded, readystatechange, load
		// we attach at all 3 stages
		var handler = Svidget.bind(this.readyHandler, this);
		Svidget.DOM.on(document, 'DOMContentLoaded', handler);
		Svidget.DOM.on(document, 'readystatechange', handler);
		Svidget.DOM.on(window, 'load', handler);
		// todo: setInterval as last resort check, if needed
	}

	readyHandler() {
		this.ensureReady();
	}

	ensureReady() {
		if (!this.isReady) this.ready();
	}

	// note: loaded state only applies to declared widgets ? (needs determiniation)
	// widgets loaded via svidget.load() 
	markLoaded() {
		if (this.getset("loaded") === true) return;
		this.getset("loaded", true);
		this.triggerLoad();
	}

	// ***********************************
	// REGION: Public Methods


/**
	 * Gets the widget based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * widgets(0)
	 * widgets("widget-1")
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {object} selector - The index or ID of the widget.
	 * @returns {Svidget.WidgetReference} - The widget reference based on the selector. If selector is invalid, null is returned.
	*/
	widget(selector) {
		var col = this.getWidgets();
		var item = this.selectFirst(col, selector);
		return item;
	}

	
	// RETURNS
	// A  WidgetReference object by that ID
	public getWidget(id: string) {
		if (id == null) return null;
		var col = this.widgets();
		// todo: convert to arrow function
		return col.first(function (w) { return w.id() === id });
	}

	// internal
	// not intended to be called by consumers
	public addWidget(widget: Widget): boolean {
		if (this.widgets().contains(widget)) return false;
		this.widgets().add(widget);
		return true;
	}

	// todo: define global Options from svidget.load (see svidget.io website)
	/**
	 * Registers an event handler for the "widgetload" event for the global object.
	 * Examples:
	 * svidget.load("#container", "mywidget.svg")
	 * svidget.load("#container", "mywidget.svg", { color: "red" }, loadCallback)
	 * svidget.load("#container", { url: "mywidget.svg", crossdomain: true }, { color: "red" })
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {string} selector - Arbirary data to initialize Event object with when event is triggered.
	 * @param {(string|object)} urlOrOptions - The url to the widget, or an options object contains properties to initialize the widget reference with.
	 * @param {object} paramObj - The object to initialize params with.
	 * @param {Function} callback - A function to call when loading is complete.
	 * @returns {Svidget.WidgetReference} - The widget reference created, or null if create fails.
	*/
	public load(selector: string, urlOrOptions: string | Options, paramObj: object, callback: Func): WidgetReference | undefined {
		// should we allow multiple sel and create a Widget for each? (hint test a jquery plugin) also: we can have a loadAll (named like queryselectorAll)
		// resolve container
		var container = Svidget.DOM.selectElement(selector);
		if (container == null) return null;
		// resolve urlOrOptions
		var options = null;
		if (typeof (urlOrOptions) === "string")
			options = { url: urlOrOptions };
		else if (urlOrOptions == null)
			return null;
		else
			options = urlOrOptions;
		if (options.url == null) return;
		// clear state
		this.allWidgetsStarted = false;
		// build out <object> element
		var widgetEle = this.createObjectElement(container, options, paramObj);
		delete widgetEle.svidgetLoad; // clear flag
		var widget = this.loadPageWidget(widgetEle, paramObj);
		// note: if this is called before ready, then it is queued
		// returns the WidgetReference object
		// if callback defined, defer invocation
		if (callback && typeof callback === "function") {
			setTimeout(function () {
				callback(widget);
			}, 0);
		}

		// return widget
		return widget;
	},

	/* REGION Events */

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

	onLoad(handler: EventHandlerFunc, data?: unknown, name?: string) {
		this.on("load", handler, data, name);
	}

	offLoad(handlerOrName: string | EventHandlerFunc) {
		this.off("load", handlerOrName);
	}

	offdeclaredload() {
		this.off("load", Svidget.declaredHandlerName);
	}

	/**
	 * Registers an event handler for the "widgetload" event for the global object.
	 * @method
	 * @memberof Svidget.Root.prototype
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/

	onWidgetLoad(data, name, handler) {
		this.on("widgetload", data, name, handler);
	}

	offWidgetLoad(handlerOrName) {
		this.off("widgetload", handlerOrName);
	}

	offDeclaredWidgetLoad() {
		this.off("widgetload", Svidget.declaredHandlerName);
	}

	// internal
	triggerLoad() {
		this.trigger("load");
	}

	// internal
	triggerWidgetLoad(widgetID) {
		this.trigger("widgetload", widgetID);
	}

	/* Communication */

	routeFromParent(name, payload) {
		Svidget.log("root: routeFromParent {name: " + name + "}");
		this.w2pComm.receiveFromParent(name, payload);
	}

	routeFromWidget(name, payload, widgetID) {
		Svidget.log(`root: routeFromWidget {name: ${name}}`);
		const widgetRef = this.root.getWidget(widgetID);
		this.p2wComm.receiveFromWidget(name, payload, widgetRef);
	}

	private handleReceiveWidgetMessage(name: string, widget: WidgetReference, payload: unknown) {
		if (name === "startack") {
			this.handleReceiveWidgetStartAck(widget, payload as widgetTransport);
		}
	}

	// invoked by widget to notify parent that it received start message
	// if the widget is to be in standalone mode then this will not be invoked
	handleReceiveWidgetStartAck(widgetRef, widgetTransport) {
		Svidget.log(
			"page: handleReceiveWidgetStartAck {widget: " +
				widgetRef.id() +
				"}"
		);
		// ignore subsequent acks
		if (widgetRef.started()) return;
		widgetRef.start();
		this.root.populateWidgetReference(widgetRef, widgetTransport);
		this.root.triggerWidgetLoad(widgetRef.id());
		// check if all widgets loaded, if so fire loaded
		// note: this is probably a bit inefficient, but we'll optimize later
		if (this.root.areAllWidgetsStarted()) {
			this.root.allWidgetsStarted = true;
			this.root.markLoaded();
		}
	}



	/*
	receiveFromParent(name, payload) {
		// overriden in root.widget
	}

	receiveFromWidget(name, payload, widgetID) {
		// overriden in root.page
	}
	*/

}

//Svidget.extend(Svidget.Root, Svidget.ObjectPrototype);

}