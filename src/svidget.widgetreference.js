/*****************************************
svidget.widgetreference.js

Represents a widget on the parent page.

Dependencies:
svidget.core.js
svidget.collection.js
svidget.dom.js
svidget.domevent.js
svidget.domitem.js
svidget.domquery.js
svidget.event.js
svidget.eventprototype.js
svidget.object.js
svidget.objectprototype.js
svidget.param.js
svidget.paramcollection.js


******************************************/


/**
 * Represents a reference to a widget from the page level.
 * @constructor
 * @mixes ObjectPrototype
 * @memberof Svidget
 * @param {string} id - The id of the widget this object represents.
 * @param {object} paramValueObj - The initializing param object. These are usually parsed from the <object> tag.
 * @param {HTMLElement} declaringElement - The HTML element that was used to declare the widget on the page. This is the <object> element.
 * @param {HTMLElement} [element] - The element that contains the actual widget. This can be either an <object> or <iframe> element.
 * @param {boolean} [connected] - Whether the reference is connected to the underlying widget. If false, it passes the params to the widgets then ceases any further communications with it.
 * @param {boolean} [crossdomain] - Whether the widget is hosted on another domain. This is a hint value to optimize setting up when it is known in advance that the widget is cross domain.
 */
/*
// note: when param/action added/removed (even on initialize)
// widget fires event, bubbles to page root
// page root adds/removes param on this object
*/
Svidget.WidgetReference = function (id, paramValueObj, declaringElement, element, connected, crossdomain) {
	this.__type = "Svidget.WidgetReference";
	var that = this;
	// privates
	var privates = new (function () {
		this.writable = ["enabled", "started", "populated"];
		this.params = new Svidget.ParamProxyCollection([], that);
		this.actions = new Svidget.ActionProxyCollection([], that);
		this.events = new Svidget.EventDescProxyCollection([], that);
		this.eventContainer = new Svidget.EventContainer(Svidget.Widget.eventTypes, that)
		this.paramValues = paramValueObj;
		this.enabled = true;
		this.started = false;
		this.populated = false;
		this.connected = !!connected; // whether widget is connected/disconnected
		this.crossdomain = !!crossdomain; // whether widget in forced crossdomain mode
		this.state = "declared";
		this.id = id;
		this.element = element;
		this.declaringElement = declaringElement;
		this.url = declaringElement.getAttribute("data");
	})();
	// private accessors
	this.setup(privates);

	this.setElement = function (ele) {
		if (privates.element != null) return false;
		if (!Svidget.DOM.isElement(ele)) return false;
		privates.element = ele;
		// self-destructing set accessor, todo: delete too?
		this.setElement = null;
	},

	// initialize params from <object> tag on page, these will be replaced when the widget updates the values and sends them back to the page
	initParamsFromObject.call(that, paramValueObj);

	// set an instance to this on declaring element
	declaringElement.widgetReference = this;

	// wire events for params add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramProxyAdded, that.paramProxyRemoved);
	// wire events for actions add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.actions, that.actionProxyAdded, that.actionProxyRemoved);
	// wire events for events add/remove
	this.wireCollectionAddRemoveHandlers(privates.events, that.eventProxyAdded, that.eventProxyRemoved);

	function initParamsFromObject(paramValueObj) {
		if (paramValueObj == null) return;
		for (var name in paramValueObj) {
			this.addParamProxy(name, paramValueObj[name], { connected: false });
		}
	}
}

Svidget.WidgetReference.prototype = {

	/**
	 * Gets the widget ID. 
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {string} - The widget ID as a string.
	*/
	id: function () {
		var id = this.getset("id");
		return id;
	},

	name: function () {
		return this.id();
	},

	/**
	 * Gets whether the widget is enabled. 
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {boolean} - The enabled state.
	*/
	/*
	// should this be settable from the page?
	*/
	enabled: function () {
		var enabled = this.getset("enabled");
		return enabled;
	},

	/**
	 * Gets the url to the widget.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {string}
	*/
	url: function () {
		var url = this.getset("url");
		return url;
	},

	/**
	 * Gets the html element that contains the widget. This is either <object> or <iframe>.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {HTMLElement}
	*/
	element: function () {
		var ele = this.getset("element");
		return ele;
	},

	/**
	 * Gets the declaring html element that contains the widget. This is the <object> element, or null if declared programatically.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {HTMLElement}
	*/
	declaringElement: function () {
		var ele = this.getset("declaringElement");
		return ele;
	},

	/**
	 * Gets the svidget global object for the widget. Only available for same domain widgets.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {object}
	*/
	root: function () {
		// gets access to widget's root object, if same domain
		if (this.isCrossDomain()) {
			return null;
		}
		var doc = this.document();
		var win = doc.parentWindow || doc.defaultView;
		//var f = window.frames[0];
		// ele = this.element();
		//var s = win.$getSvidget();
		// note: is some browsers, this may not be available until its DOM is loaded
		return win.svidget;
	},

	/**
	 * Gets the window object for the widget. Only available for same domain widgets.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {Window}
	*/
	window: function () {
		// gets access to widget's window object, if different domain
		var ele = this.element();
		if (ele == null) return null;
		// note: only FF supports <object>.contentWindow
		// ele is usually a <iframe>
		return ele.contentWindow;
	},

	/**
	 * Gets the document object for the widget. Only available for same domain widgets.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {HTMLDocument}
	*/
	document: function () {
		var ele = this.element();
		return Svidget.DOM.getDocument(ele);
	},

	/**
	 * Gets whether this widget reference is connected to its underlying widget. If false, then the widget is cut off from the page.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @returns {HTMLDocument}
	*/
	connected: function (val) {
		var res = this.getset("connected", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	},

	/**
	 * Gets whether this widget reference has specified that it prefers to connect to the underlying widget as a cross-domain widget, irregardless if it is actually cross-domain or not.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {boolean} - Sets the property.
	 * @returns {boolean} - True/false if crossdomain, or if setting then true/false if set succeeded.
	*/
	crossdomain: function (val) {
		var res = this.getset("crossdomain", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	},

	/**
	 * Gets a collection of all ParamProxy objects in the widget reference, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * params(0)
	 * params("color")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} [selector] - The selector string or integer.
	 * @returns {Svidget.ParamProxyCollection} - A collection based on the selector, or the entire collection.
	*/
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	/**
	 * Gets the ParamProxy based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * param(0)
	 * param("color")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} selector - The index or ID of the param.
	 * @returns {Svidget.ParamProxy} - The ParamProxy based on the selector. If selector is invalid, null is returned.
	*/
	param: function (selector) {
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	/**
	 * Gets a collection of all ActionProxy objects in the widget reference, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * actions(0)
	 * actions("doSomething")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} [selector] - The selector string or integer.
	 * @returns {Svidget.ActionProxyCollection} - A collection based on the selector, or the entire collection.
	*/
	actions: function (selector) {
		var col = this.getset("actions");
		return this.select(col, selector);
	},

	/**
	 * Gets the ActionProxy based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * action(1)
	 * action("doSomething")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} selector - The index or ID of the param.
	 * @returns {Svidget.ActionProxy} - The ActionProxy based on the selector. If selector is invalid, null is returned.
	*/
	action: function (selector) {
		//var item = this.actions(selector).first();
		var col = this.getset("actions");
		var item = this.selectFirst(col, selector);
		return item;
	},

	/**
	 * Gets a collection of all EventDescProxy objects in the widget reference, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * events(0)
	 * events("somethingHappened")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} [selector] - The selector string or integer.
	 * @returns {Svidget.EventDescProxyCollection} - A collection based on the selector, or the entire collection.
	*/
	events: function (selector) {
		var col = this.getset("events");
		return this.select(col, selector);
	},

	/**
	 * Gets the EventDescProxy based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * events(0)
	 * events("somethingHappened")
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {object} selector - The index or ID of the param.
	 * @returns {Svidget.EventDescProxy} - The EventDescProxy based on the selector. If selector is invalid, null is returned.
	*/
	event: function (selector) {
		var col = this.getset("events");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// internal
	paramValues: function () {
		var val = this.getset("paramValues");
		return val;
	},

	// internal
	addParamProxy: function (nameOrObject, value, options) {
		return this.params().add(nameOrObject, value, options, this);
	},

	// internal
	removeParamProxy: function (name) {
		return this.params().remove(name);
	},

	// internal
	// adds or updates the param proxy
	refreshParamProxy: function (name, value, options) {
		var p = this.param(name);
		if (p == null)
			return this.params().add(nameOrObject, value, options, this);
		else {
			p.refreshProperties(options);
			return p;
		}
	},

	// internal
	// handle param added
	paramProxyAdded: function (param) {
		// raise event
		//alert('param added');
		Svidget.log('page: param proxy added: ' + param.name());
		// trigger event
		this.triggerFromWidget("paramadd", param);
	},

	// internal
	// handle param removed
	paramProxyRemoved: function (param) {
		// raise event
		//alert('param removed');
		Svidget.log('page: param proxy removed: ' + param.name());
		// trigger event
		this.triggerFromWidget("paramremove", param.name());
	},

	// internal
	// called from ParamProxy
	paramProxyBubble: function (type, event, param) {
		Svidget.log('page: param proxy bubble: ' + param.name());
		if (type == "change") this.paramProxyChanged(param, event.value);
		if (type == "valuechange") this.paramProxyValueChanged(param, event.value);
	},

	// private
	// eventValue ex = { property: "binding", value: bindValue }
	paramProxyChanged: function (param, eventValue) {
		Svidget.log('page: param proxy change: ' + param.name());
		this.triggerFromWidget("paramchange", eventValue, param);
	},

	// private
	// eventValue ex = { value: "3" }
	paramProxyValueChanged: function (param, eventValue) {
		Svidget.log('page: param proxy value change: ' + param.name());
		this.triggerFromWidget("paramvaluechange", eventValue, param);
	},

	// internal
	addActionProxy: function (nameOrObject, options) {
		return this.actions().add(nameOrObject, options, this);
	},

	// internal
	removeActionProxy: function (name) {
		return this.actions().remove(name);
	},

	// internal
	// handle param added
	actionProxyAdded: function (action) {
		// raise event
		Svidget.log('page: action proxy added: ' + action.name());
		// trigger event
		this.triggerFromWidget("actionadd", action);
	},

	// internal
	// handle param removed
	actionProxyRemoved: function (action) {
		Svidget.log('page: action proxy removed: ' + action.name());
		// trigger event
		this.triggerFromWidget("actionremove", action.name());
	},

	// internal
	// called from action
	actionProxyBubble: function (type, event, action) {
		Svidget.log('page: action proxy bubble: ' + action.name());
		if (type == "invoke") this.actionProxyInvoked(action, event.value);
		if (type == "change") this.actionProxyChanged(action, event.value);
		// event.target is actionParam that was changed
		if (type == "paramchange") this.actionParamProxyChanged(action, event.target, event.value);
		// for add/remove, event.value == actionParam added or removed
		if (type == "paramadd") this.actionParamProxyAdded(action, event.value);
		if (type == "paramremove") this.actionParamProxyRemoved(action, event.value);
	},

	// private
	actionProxyInvoked: function (action, eventValue) {
		this.triggerFromWidget("actioninvoke", eventValue, action);
	},

	// private
	actionProxyChanged: function (action, eventValue) {
		this.triggerFromWidget("actionchange", eventValue, action);
	},

	// private
	actionParamProxyAdded: function (action, actionParam) {
		this.triggerFromWidget("actionparamadd", actionParam, action);
	},

	// private
	actionParamProxyRemoved: function (action, actionParamName) {
		this.triggerFromWidget("actionparamremove", actionParamName, action);
	},

	// private
	actionParamProxyChanged: function (action, actionParam, eventValue) {
		this.triggerFromWidget("actionparamchange", eventValue, actionParam);
	},

	/* Events */

	// internal
	addEventProxy: function (nameOrObject, options) {
		return this.events().add(nameOrObject, options, this);
	},

	// internal
	removeEventProxy: function (name) {
		return this.events().remove(name);
	},

	// internal
	// handle param added
	eventProxyAdded: function (ev) {
		Svidget.log('page: event proxy added: ' + ev.name());
		// trigger event
		this.triggerFromWidget("eventadd", ev);
	},

	// internal
	// handle param removed
	eventProxyRemoved: function (ev) {
		Svidget.log('page: event proxy removed: ' + ev.name());
		// trigger event
		this.triggerFromWidget("eventremove", ev.name());
	},

	// internal, called from eventdescproxy
	eventProxyBubble: function (type, event, eventDesc) {
		Svidget.log('page: event proxy bubble: ' + eventDesc.name());
		if (type == "trigger") this.eventProxyTriggered(eventDesc, event);
		if (type == "change") this.eventProxyChanged(eventDesc, event.value);
	},

	// private
	eventProxyTriggered: function (eventDesc, event) {
		Svidget.log('page: event proxy trigger: ' + eventDesc.name());
		this.triggerFromWidget("eventtrigger", event.value, eventDesc);
	},

	// private
	eventProxyChanged: function (eventDesc, eventValue) {
		Svidget.log('page: event proxy change: ' + eventDesc.name());
		this.triggerFromWidget("eventchange", eventValue, eventDesc);
	},

	/* Proxy Events */

	eventContainer: function () {
		return this.getPrivate("eventContainer");
	},

	/**
	 * Registers an event handler for the WidgetReference.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {string} type - The event type i.e. "change", "paramremove".
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	on: function (type, data, name, handler) {
		this.eventContainer().on(type, data, name, handler);
	},

	/**
	 * Unregisters an event handler for the WidgetReference.
	 * @method
	 * @memberof Svidget.WidgetReference.prototype
	 * @param {string} type - The event type i.e. "change", "paramremove".
	 * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	 * @returns {boolean} - True if the event handler was successfully removed.
	*/
	off: function (type, handlerOrName) {
		this.eventContainer().off(type, handlerOrName);
	},

	// internal
	// Note: no access to trigger() object events here, only from widget
	// this is invoked from the widget to signal that the event was triggered
	triggerFromWidget: function (type, value, originalTarget) {
		this.eventContainer().trigger(type, value, originalTarget);
	},

	/* State Management */

	hasElement: function () {
		return this.element() != null;
	},

	// True if element is valid <object> or <iframe> and part of DOM.
	isAttached: function () {
		var ele = this.element();
		return ele != null && ele.parentNode != null;
	},

	isCrossDomain: function () {
		return this.element() !== this.declaringElement();
	},

	started: function () {
		var val = this.getset("started");
		return val;
	},

	populated: function () {
		var val = this.getset("populated");
		return val;
	},

	/*state: function () {
	//	// possible: declared, initialized, loaded
	//	//return "declared";
	//	var state = this.getset("state");
	//	return state;
	//},*/

	// internal
	// indicates from the widget that it has started.
	start: function () {
		this.getset("started", true);
	},

	/*setState: function (state) {
	//	var states = ["declared", "initialized", "loaded"];
	//	var index = states.indexOf(state);
	//	if (index < 0) return false;
	//	var curState = this.state();
	//	if (index <= states.indexOf(curState)) return false;
	//	this.getset("state", state);
	//	return true;
	//}, */

	// REGION: Populate

	// internal
	// Inflates this object with the transport JSON object
	populate: function (widgetObj) {
		if (this.populated()) return;
		/* build params/action proxies
		//		var transport = {
		//			id: this.id(),
		//			enabled: this.enabled(),
		//			params: this.toParamsTransport(),
		//			actions: this.toActionsTransport()
		//		}; */
		// enabled
		this.enabled(widgetObj.enabled);
		// params
		this._populateParams(widgetObj.params);
		// actions
		this._populateActions(widgetObj.actions);
		// events
		this._populateEvents(widgetObj.events);
		this.getset("populated", true);
	},

	// private
	// Populates the params from the transport object to this instance
	_populateParams: function (params) {
		if (params && Svidget.isArray(params)) {
			for (var i = 0; i < params.length; i++) {
				var p = params[i];
				// refresh - add or update param
				var paramProxy = this.refreshParamProxy(p.name, p.value, p);
				paramProxy.connect(); // mark the param as connected
			}
		}
	},

	// private
	// Populates the params from the transport object to this instance
	_populateActions: function (actions) {
		if (actions && Svidget.isArray(actions)) {
			for (var i = 0; i < actions.length; i++) {
				var a = actions[i];
				var action = this.addActionProxy(a.name, a);
				this._populateActionParams(a.params, action);
			}
		}
	},

	// private
	// Populates the actions from the transport object to this instance
	_populateActionParams: function (actionParams, action) {
		if (actionParams && Svidget.isArray(actionParams)) {
			for (var i = 0; i < actionParams.length; i++) {
				var ap = actionParams[i];
				action.addParam(ap.name, ap);
			}
		}
	},

	// private
	// Populates the events from the transport object to this instance
	_populateEvents: function (events) {
		if (events && Svidget.isArray(events)) {
			for (var i = 0; i < events.length; i++) {
				var e = events[i];
				this.addEventProxy(e.name, e);
			}
		}
	},

};

Svidget.extend(Svidget.WidgetReference, Svidget.ObjectPrototype);
