/*****************************************
svidget.root.page.js

Contains the root object definition for the page level.

Dependencies:
Svidget.Core
Svidget.Root

******************************************/


/* Notes:
	 todo: we are eventually going to need to move private methods inside the constructor to make them private
	 need to figure out best approach
	 maybe split the page and widget sides into separate prototype objects

// 7/22: add more Svidget.log to analyze order of signals, also figure out why params not populated on widget and circle changing to green
*/

Svidget.Root.PagePrototype = {

	// ***********************************
	// REGION: Initializing

	initInternal: function () {
		this.idSeed = 1; // seed for widget IDs
		window._svidget = "page";
		this.connected(true); // default to true for page
		Object.defineProperty(this, "$", Svidget.readOnlyProperty(null));
	},

	/* Page Mode */

	readyPage: function () {
		Svidget.log('page: readyPage');
		//alert("page");
		this.loadPageWidgets();
	},

	// ***********************************
	// REGION: Widget Loading

	/*
	// 7/9:
	// figure out how id is initialized/passed
	// do we discard existing <object> with potentially loaded widget?
	// 7/10:
	// - startack
	// 7/16:
	// - need to account for case when <iframe> loads, handling initialized for second time
	*/

	// Parses page for <object role="svidget"> and loads those as widgets
	loadPageWidgets: function () {
		// parse page for object role="svidget"
		var that = this;
		var svidgetEles = this.findAllWidgetElements();
		svidgetEles.each(function (item) { that.loadPageWidget(item); });
		//this.waitForWidgets();
	},

	// Loads a widget based on its <object> element.
	// objEle = <object role="svidget" data="(url)">
	// paramValues: passed in when adding widget dynamically via load()
	loadPageWidget: function (objEle, paramValues) {
		var widget = this.createWidgetReference(objEle, paramValues);
		this.addWidget(widget);
		//if (!Svidget.DOM.isElementDocumentReady(objEle)) {
		this.readyWidgetReference(widget, objEle);
		return widget;
	},

	createWidgetReference: function (objEle, paramValues) {
		var paramObj;
		// parse <params> if not provided (provided for dynamic loading)
		if (paramValues === undefined)
			paramObj = this.parseParamElements(objEle);
		else
			paramObj = paramValues;
		// check for forced values
		var connected = objEle.getAttribute("data-connected") != "false"; //todo: allow case-insensitive
		var crossdomain = objEle.getAttribute("data-crossdomain") == "true"; //todo: allow case-insensitive

		// generate ID
		// tests: test an element with same id before and test with one after declared element
		var widgetID = this.getWidgetIDForElement(objEle); //(objEle.id == null) ? this.generateWidgetID() : objEle.id;
		// resolve core element, if widget DOM not ready this will return null
		var coreEle = this.resolveCoreWidgetElement(objEle, null, crossdomain);
		// create WidgetReference
		var wRef = new Svidget.WidgetReference(widgetID, paramObj, objEle, coreEle, connected, crossdomain);
		return wRef;
	},

	readyWidgetReference: function (widget, objEle) { 
		// if <iframe> already loaded due to data-crossdomain
		var ele = widget.element() || objEle;
		this.addWidgetLoadEvents(ele, widget);
	},

	addWidgetLoadEvents: function (objEle, widget) {
		Svidget.log('page: addWidgetLoadEvents: id = ' + objEle.id + ', tag = ' + objEle.tagName);
		var handler = Svidget.wrap(this.finishPageWidget, this);
		var wrapper = function () { handler(widget) };
		widget._waitingForDOM = true;
		Svidget.DOM.on(objEle, 'load', wrapper);
		//Svidget.DOM.on(objEle, 'readystatechange', wrapper);
	},

	// Finishes page widget:
	//   Makes sure widget element is loaded
	//   Makes sure widget is started
	finishPageWidget: function (widget) { //objEle) {
		Svidget.log('page: finishPageWidget: id = ' + widget.id());
		//var widget = objEle.widgetReference; // this.createPageWidget(objEle);
		widget._waitingForDOM = false;
		// if <object> replaced with <iframe>
		var finalEle = this.ensureCoreElementResolved(widget);
		if (finalEle != null && finalEle != widget.declaringElement())
			this.readyWidgetReference(widget, widget.element());
		else
			this.ensureWidgetStarted(widget);
	},

	ensureCoreElementResolved: function (widget) {
		if (widget.hasElement()) return null;
		var coreEle = this.resolveCoreWidgetElement(widget.declaringElement(), widget, widget.crossdomain());// objEle);
		if (coreEle != null) {
			Svidget.log('page: CoreElementCreated: ' + coreEle.tagName + ' id:' + widget.id());
			widget.setElement(coreEle);
			return coreEle;
		}
		return null;
	},

	ensureWidgetStarted: function (widget) {
		// if core element hasn't been defined yet, then return and try again later
		if (!widget.hasElement()) return;
		if (!widget.started() && Svidget.DOM.isElementDocumentReady(widget.element())) {
			this.signalStart(widget, widget.paramValues()); //, this.connected());
			// todo: this is resulting in a race condition, if the first signalStart fails then it never gets initialized
			//if (widget.standalone()) widget.start(); // start right away, since its disconnected with widget
		}
	},

	// if DOM not yet loaded, returns null
	// if <object> is determined to be cross-domain, disables it and returns an alternate <iframe>
	// else returns declaring <object>
	resolveCoreWidgetElement: function (objEle, widget, crossdomain) {
		// try to get widget contentDocument
		var widgetDoc = Svidget.DOM.getDocument(objEle);
		// widget is not ready, so return null, we'll try again later
		// but if crossDomain flag is set, then we use iframe uncondtionally
		if (widgetDoc === null && !crossdomain) return null;
		var ifmEle = null;
		var coreEle = objEle;
		// if undefined, it means access was denied making it cross domain widget
		// so we disable and hide <object> and replace with <iframe>
		if (widgetDoc === undefined || crossdomain) {
			ifmEle = this.buildIFrameElement(objEle);
			objEle.parentNode.insertBefore(ifmEle, objEle);
			this.disableAndHide(objEle);
			coreEle = ifmEle;
			// since we created a new element, we need to ready it
			//if (widget) this.readyWidgetReference(widget, ifmEle); // moved to ensureCoreElementCreated
		}
		return coreEle;		
	},

	waitForWidgets: function () {
		setTimeout(Svidget.wrap(this.checkUnfinishedWidgetReferences, this), 50);
	},

	checkUnfinishedWidgetReferences: function () {
		// loops through each widget references with missing element
		// and checks if its document is ready
		// called from handle widget initialized
		// var unfinalWidgets = 
		if (this.allWidgetsStarted) return;
		Svidget.log("page: checkUnfinishedWidgetReferences");
		var that = this;
		var count = 0;
		this.widgets().where(function (w) { return that.needsFinishing(w) }).each(function (w) {
			//	return !w.hasElement() && Svidget.DOM.isElementDocumentReady(w.declaringElement()); 
			//}).each(function (w) { 
			count++;
			that.finishPageWidget(w);
		});
		// set flag so that we stop checking for unfinalized widgets
		//if (count == 0) this.allWidgetsFinalized = true;
		this.waitForWidgets();
	},

	needsFinishing: function (widget) {
		if (widget._waitingForDOM) return false;
		// if widget element hasn't been finalized or started, and declaring element is ready, then it needs finalizing
		if ((!widget.hasElement() || !widget.started()) && Svidget.DOM.isElementDocumentReady(widget.declaringElement())) return true;
		// if widget element is an <iframe> due to being cross domain, and the DOM for that <iframe> is ready, but it hasn't been started, it needs finalizing
		if (widget.hasElement() && widget.isCrossDomain() && !widget.started() && Svidget.DOM.isElementDocumentReady(widget.element())) return true;
		// doesn't need finalizing
		return false;
	},

	areAllWidgetsStarted: function () {
		return this.widgets().all(function (w) {
			return w.started();
		});
	},

	disableAndHide: function (ele) {
		ele.data = ""; //todo: confirm this works
		Svidget.DOM.disable(ele);
		Svidget.DOM.hide(ele);
	},

	getWidgetIDForElement: function (objEle) {
		var id = objEle.id; //(objEle.id == null) ? this.generateWidgetID() : objEle.id;
		// if id points to element (no duplicates, then just use that)
		if (id != null && Svidget.DOM.get(id) == objEle) return id;
		return this.newWidgetID();
	},

	newWidgetID: function() {
		var prefix = "_svidget_";
		if (this.idCounter === undefined) this.idCounter = 1;
		var idNum = this.idCounter;
		var id;
		while (true) {
			var id = prefix + idNum;
			idNum++;
			if (Svidget.DOM.get(id) == null) break;
		}
		this.idCounter = idNum;
		return id;
	},

	buildIFrameElement: function (objEle) {
		var iframe = document.createElement("iframe");
		var objItem = Svidget.DOM.wrap(objEle);
		objItem.attributes().each(function (a) {
			if (a.name() == "data" || a.name() == "data-url")
				iframe.setAttribute("src", a.value());
			else if (a.name() == "id")
				iframe.setAttribute("id", a.value() + "_frame");
			else
				iframe.setAttribute(a.name(), a.value());
		});
		iframe.frameBorder = 0;
		iframe.seamless = true;
		return iframe;
	},

	buildObjectElement: function (options, paramObj) {
		if (!document.createElement) return null;
		var objEle = document.createElement("object");
		objEle.setAttribute("role", "svidget");
		objEle.setAttribute("data-url", options.url);
		// for crossdomain, no need to load widget into object, an iframe will take its place
		if (options.crossdomain !== true)
			objEle.setAttribute("data", options.url);
		if (options.id) objEle.setAttribute("id", options.id);
		if (options.width) objEle.setAttribute("width", options.width);
		if (options.height) objEle.setAttribute("height", options.height);
		// yes, if these values are false we dont want to write them out
		if (options.connected !== undefined) objEle.setAttribute("data-connected", options.connected);
		if (options.crossdomain !== undefined) objEle.setAttribute("data-crossdomain", options.crossdomain);
		// copy other known attributes
		if (options.style) objEle.setAttribute("style", options.style);
		if (options.cssclass) objEle.setAttribute("class", options.cssclass);
		if (options.allowfullscreen !== undefined) objEle.setAttribute("allowfullscreen", options.allowfullscreen);
		if (options.title) objEle.setAttribute("title", options.title);
		// params
		for (var key in paramObj) {
			var paramEle = document.createElement("param");
			paramEle.setAttribute("name", key);
			// we don't want to write the value of the object here to the DOM, in case it is large
		}
		return objEle;
	},

	createObjectElement: function (container, options, paramObj) {
		var objEle = this.buildObjectElement(options, paramObj);
		container.appendChild(objEle);
		return objEle;
	},

	// this is called once the params/actions and widget data are sent from the widget
	populateWidgetReference: function (widgetRef, widgetTransport) {
		Svidget.log("page: populateWidgetReference");
		if (!widgetRef.populated()) {
			widgetRef.populate(widgetTransport);
		}
	},

	findAllWidgetElements: function () {
		var objectEles = Svidget.DOM.getByName("object", true); //document.getElementsByTagName("object");
		var svidgetEles = objectEles.where(function (item) { return Svidget.DOM.attrValue(item, "role") == "svidget"; });
		return svidgetEles;
	},

	// Parses the <param> elements inside of the <object> element for the widget.
	parseParamElements: function (objEle) {
		var paramEles = Svidget.DOM.getChildrenByName(objEle, "param", true); //Svidget.array(objEle.getElementsByTagName("param")));
		// return object with name/value (string/string)
		var obj = {};
		for (var i = 0; i < paramEles.length; i++) {
			var name = paramEles[i].getAttribute("name");
			if (name != null && name.length > 0) obj[name] = paramEles[i].getAttribute("value");
		}
		return obj;
	},

	// RETURNS
	// A  WidgetReference object by that ID
	getWidget: function (id) {
		if (id == null) return null;
		var col = this.widgets();
		return col.first(function (w) { return w.id() === id });
	},

	// internal
	addWidget: function (widget) {
		if (this.widgets().contains(widget)) return false;
		this.widgets().add(widget);
		return true;
	},

	// ***********************************
	// REGION: Public Methods

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
	load: function (selector, urlOrOptions, paramObj, callback) {
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
		var widget = this.loadPageWidget(widgetEle, paramObj);
		// note: if this is called before ready, then it is queued
		// returns the WidgetReference object
		// if callback defined, call it
		if (callback && typeof (callback) === "function") callback(widget);

		// return widget
		return widget;
	},

	// ***********************************
	// REGION: Public Properties

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
	widgets: function (selector) {
		var col = this.getWidgets();
		return this.select(col, selector);
	},

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
	widget: function (selector) {
		var col = this.getWidgets();
		var item = this.selectFirst(col, selector);
		return item;
	},

	// private
	getWidgets: function () {
		var col = this.getset("widgets");
		if (col == null) {
			col = new Svidget.ObjectCollection(null, Svidget.WidgetReference);
			this.getset("widgets", col);
		}
		return col;
	},

	// private
	triggerWidgetEvent: function (widgetRef, eventName, data) {
		var ev = widgetRef.event(eventName);
		if (ev == null) return;
		ev.triggerFromWidget(data);
	},

	// ***********************************
	// REGION: Communication

	receiveFromWidget: function (name, payload, widgetID) {
		Svidget.log("page: receiveFromWidget {name: " + name + ", widgetID: " + widgetID + "}");
		var widget = this.getWidget(widgetID);
		//if (widget == null && name != "initialized") return; // widgetID may be null if widget hasn't been assigned an ID
		// invoke handler for message
		switch (name) {
			// lifecycle handlers
			// payload == widget transport { id: "", enabled: true, params: [], actions: [] } 
			//case "initialized": this.handleReceiveWidgetInitialized(); break; //widget, payload); break;
			//case "loaded": this.handleReceiveWidgetLoaded(widget, payload); break;
			// params handlers 
			// payload == param transport { name: "background", type: "", value: 3 }
			case "paramadded": this.handleReceiveWidgetParamAdded(widget, payload); break;
			case "paramremoved": this.handleReceiveWidgetParamRemoved(widget, payload); break;
			case "paramchanged": this.handleReceiveWidgetParamChanged(widget, payload); break;
			case "paramset": this.handleReceiveWidgetParamSet(widget, payload); break;
			// actions handlers
			case "actionadded": this.handleReceiveWidgetActionAdded(widget, payload); break;
			case "actionremoved": this.handleReceiveWidgetActionRemoved(widget, payload); break;
			case "actionchanged": this.handleReceiveWidgetActionChanged(widget, payload); break;
			case "actioninvoked": this.handleReceiveWidgetActionInvoked(widget, payload); break;
			case "actionparamadded": this.handleReceiveWidgetActionParamAdded(widget, payload); break;
			case "actionparamremoved": this.handleReceiveWidgetActionParamRemoved(widget, payload); break;
			case "actionparamchanged": this.handleReceiveWidgetActionParamChanged(widget, payload); break;
				// events handlers
			case "eventadded": this.handleReceiveWidgetEventAdded(widget, payload); break;
			case "eventremoved": this.handleReceiveWidgetEventRemoved(widget, payload); break;
			case "eventchanged": this.handleReceiveWidgetEventChanged(widget, payload); break;
			case "eventtriggered": this.handleReceiveWidgetEventTriggered(widget, payload); break;
				// acks
			case "startack": this.handleReceiveWidgetStartAck(widget, payload); break;
		}
	},

	/* Signaling */

	// signal widget to start, effectively establishing a connection from parent to it
	signalStart: function (widgetRef, paramValues) {
		Svidget.log("page: signalStart {id: " + widgetRef.id() + ", url: " + widgetRef.url() + ", tag: " + widgetRef.element().tagName + "}");
		//var paramValues = {};
		var payload = { id: widgetRef.id(), params: paramValues, connected: widgetRef.connected() };
		this.comm().signalWidget(widgetRef, "start", payload);
	},

	signalPropertyChange: function (widgetRef, obj, objType, propName, propValue) {
		if (!widgetRef.started() || !widgetRef.connected()) return;
		Svidget.log("page: signalPropertyChange {id: " + widgetRef.id() + ", type: " + objType + "}");
		var payload = { "type": objType, "name": obj.name(), "propertyName": propName, "value": propValue };
		this.comm().signalWidget(widgetRef, "propertychange", payload);
	},

	signalActionInvoke: function (widgetRef, actionProxy, argList) {
		if (!widgetRef.started() || !widgetRef.connected()) return;
		Svidget.log("page: signalActionInvoke {id: " + widgetRef.id() + ", url: " + widgetRef.url() + "}");
		//var paramValues = {};
		var payload = { action: actionProxy.name(), args: argList };
		this.comm().signalWidget(widgetRef, "actioninvoke", payload);
	},

	signalEventTrigger: function (widgetRef, eventDescProxy, data) {
		if (!widgetRef.started() || !widgetRef.connected()) return;
		Svidget.log("page: signalEventTrigger {id: " + widgetRef.id() + "}");
		var payload = { "event": eventDescProxy.name(), "data": data };
		this.comm().signalWidget(widgetRef, "eventtrigger", payload);
	},

	/* Signal Handlers */

		// invoked by widget to notify parent that it has been instantiated
	handleReceiveWidgetInitialized: function () { //widgetRef, widgetTransport) {
		Svidget.log("page: handleReceiveWidgetInitialized");
		/*
		// moved to loaded handler, since widget will not have this data until widget DOM is ready
		//this.populateWidgetReference(widgetRef, widgetTransport);
		// the widget would have to be started, otherwise there is no way this code would be reached because the ID would not have been set yet
		// this should probably be commented out
		//this.ensureWidgetStarted();
		// also note this could come from a standalone widget in which case we want to ignore

		// update: 7/10
		// maybe we should call finalizePageWidget from here instead of relying on object.load event
		// update 7/23: if we go with lookup widgetRef by element approach we can ditch this
		// update 7/24: commented out, resulting in too many checks, handled in loaded handler only now
		//this.checkUnfinalizedWidgetReferences();
		*/
	},

	// invoked by widget to notify parent that it is loaded and ready
	handleReceiveWidgetLoaded: function (widgetRef, widgetTransport) {
		//this.signalStart(widgetProxy); // moved to initialized
		// in most cases, widget should be finalized, but call one more time just in case
		// commented out because it no longer makes sense because if widgetRef is not null then it means that start was already called
		// this.finalizePageWidget(widgetRef.declaringElement());
		// trigger load widget event
		// if null, it means that widget DOM loaded before start was called, so defer
		if (widgetRef == null) {
			this.checkUnfinishedWidgetReferences();
			return;
		}
		this.populateWidgetReference(widgetRef, widgetTransport);
	},

	// invoked by widget to notify parent that it received start message
	// if the widget is to be in standalone mode then this will not be invoked
	handleReceiveWidgetStartAck: function (widgetRef, widgetTransport) {
		Svidget.log("page: handleReceiveWidgetStartAck {widget: " + widgetRef.id() + "}");
		// ignore subsequent acks
		if (widgetRef.started()) return;
		widgetRef.start();
		this.populateWidgetReference(widgetRef, widgetTransport);
		this.triggerWidgetLoad(widgetRef.id());
		// check if all widgets loaded, if so fire loaded
		// note: this is probably a bit inefficient, but we'll optimize later
		if (this.areAllWidgetsStarted()) {
			this.allWidgetsStarted = true;
			this.markLoaded();
		}
	},

	// Handle: Params

	// invoked by widget to notify parent that a param was added
	handleReceiveWidgetParamAdded: function (widgetRef, paramPayload) {
		Svidget.log("page: handleReceiveWidgetParamAdded {param: " + paramPayload.name + "}");
		// paramPayload == param transport
		// add the paramProxy from param transport, this will trigger any events associated with the add
		widgetRef.addParamProxy(paramPayload.name, paramPayload); // paramPayload == options
	},

	// invoked by widget to notify parent that a param was removed
	handleReceiveWidgetParamRemoved: function (widgetRef, paramName) {
		Svidget.log("page: handleReceiveWidgetParamRemoved {param: " + paramName + "}");
		// remove the paramProxy, this will trigger any events associated with the add
		widgetRef.removeParamProxy(paramName);
	},

	// changeData: { name: actionName, property: "enabled", value: val }
	handleReceiveWidgetParamChanged: function (widgetRef, changePayload) {
		Svidget.log("page: handleReceiveWidgetParamChanged {param: " + changePayload.name + "}");
		var param = widgetRef.param(changePayload.name);
		if (param == null) return;
		param.notifyPropertyChange(changePayload.property, changePayload.value);
	},

	// valueData: { name: actionName, value: val }
	handleReceiveWidgetParamSet: function (widgetRef, setPayload) {
		Svidget.log("page: handleReceiveWidgetParamSet {param: " + setPayload.name + "}");
		var param = widgetRef.param(setPayload.name);
		if (param == null) return;
		param.notifyValueChange(setPayload.value);
	},

	// Handle: Actions

	// invoked by widget to notify parent that a param was added
	handleReceiveWidgetActionAdded: function (widgetRef, actionPayload) {
		Svidget.log("page: handleReceiveWidgetActionAdded {action: " + actionPayload.name + "}");
		// actionPayload == action transport
		// add the actionProxy from action transport, this will trigger any events associated with the add
		widgetRef.addActionProxy(actionPayload.name, actionPayload); // actionPayload == options
	},

	// invoked by widget to notify parent that a param was removed
	handleReceiveWidgetActionRemoved: function (widgetRef, actionName) {
		Svidget.log("page: handleReceiveWidgetActionRemoved {action: " + actionName + "}");
		// remove the paramProxy, this will trigger any events associated with the add
		widgetRef.removeActionProxy(actionName);
	},

	// changeData: { name: actionName, property: "enabled", value: val }
	handleReceiveWidgetActionChanged: function (widgetRef, changePayload) {
		Svidget.log("page: handleReceiveWidgetActionChanged {action: " + changePayload.name + "}");
		var action = widgetRef.action(changePayload.name);
		if (action == null) return;
		action.notifyPropertyChange(changePayload.property, changePayload.value);
	},

	// actionReturnPayload = { name: actionName, returnValue: "value returned from action" }
	handleReceiveWidgetActionInvoked: function (widgetRef, actionReturnPayload) {
		Svidget.log("page: handleReceiveWidgetActionInvoked {action: " + actionReturnPayload.name + "}");
		var action = widgetRef.action(actionReturnPayload.name);
		if (action == null) return;
		action.invokeFromWidget(actionReturnPayload.returnValue);
	},

	// invoked by widget to notify parent that a param was added
	handleReceiveWidgetActionParamAdded: function (widgetRef, actionParamPayload) {
		Svidget.log("page: handleReceiveWidgetActionParamAdded {actionparam: " + actionParamPayload.name + "}");
		// actionPayload == action transport
		// add the actionProxy from action transport, this will trigger any events associated with the add
		var action = widgetRef.action(actionParamPayload.actionName);
		if (action == null) return;
		action.addParam(actionParamPayload.name, actionParamPayload); // actionParamPayload == options
	},

	// invoked by widget to notify parent that a param was removed
	// { name: actionParamName, actionName: actionName }
	handleReceiveWidgetActionParamRemoved: function (widgetRef, actionParamNamePayload) {
		Svidget.log("page: handleReceiveWidgetActionParamRemoved {actionparam: " + actionParamNamePayload + "}");
		// remove the paramProxy, this will trigger any events associated with the add
		var action = widgetRef.action(actionParamNamePayload.actionName);
		if (action == null) return;
		action.removeParam(actionParamNamePayload.name);
	},

	// changeData: { name: actionParamName, actionName: actionName, property: "enabled", value: val }
	handleReceiveWidgetActionParamChanged: function (widgetRef, changePayload) {
		Svidget.log("page: handleReceiveWidgetActionParamChanged {actionparam: " + changePayload.name + "}");
		var action = widgetRef.action(changePayload.actionName);
		if (action == null) return;
		var actionParam = action.param(changePayload.name);
		if (actionParam == null) return;
		actionParam.notifyPropertyChange(changePayload.property, changePayload.value);
	},

	// Handle: Events

	handleReceiveWidgetEventAdded: function (widgetRef, eventDescPayload) {
		Svidget.log("page: handleReceiveWidgetEventAdded {event: " + eventDescPayload.name + "}");
		// eventPayload == eventDesc transport
		// add the eventDescProxy from eventDesc transport, this will trigger any events associated with the add
		widgetRef.addEventProxy(eventDescPayload.name, eventDescPayload);
	},

	handleReceiveWidgetEventRemoved: function (widgetRef, eventDescName) {
		Svidget.log("page: handleReceiveWidgetEventRemoved {event: " + eventDescName + "}");
		// eventPayload == eventDesc.name
		// remove the eventDescProxy by its name, this will trigger any events associated with the remove
		widgetRef.removeEventProxy(eventDescName);
	},

	// changeData: { name: eventName, property: "enabled", value: val }
	handleReceiveWidgetEventChanged: function (widgetRef, changePayload) {
		Svidget.log("page: handleReceiveWidgetEventChanged {event: " + changePayload.name + "}");
		var ev = widgetRef.event(changePayload.name);
		if (ev == null) return;
		ev.notifyPropertyChange(changePayload.property, changePayload.value);
	},

	// invoked by widget to notify parent that an event was triggered
	handleReceiveWidgetEventTriggered: function (widgetRef, eventDataPayload) {
		Svidget.log("page: handleReceiveWidgetEventTriggered {event: " + eventDataPayload.name + "}");
		//{ "name": eventDesc.name(), "value": value };
		var ev = widgetRef.event(eventDataPayload.name);
		if (ev == null) return;
		ev.triggerEventFromWidget(eventDataPayload.value);
		// widgetRef.triggerFromWidget("eventtrigger", eventData.value); // not needed, we bubble from eventDescProxy to WidgetReference
	}


};
