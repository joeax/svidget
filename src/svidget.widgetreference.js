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

- set params
- invoke actions
- subscribe events

******************************************/

// note: when param/action added/removed (even on initialize)
// widget fires event, bubbles to page root
// page root adds/removes param on this object

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
		// self-destructing set accessor
		this.setElement = null;
	},

	// set an instance to this on declaring element
	declaringElement.widgetReference = this;

	// wire events for params add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramProxyAdded, that.paramProxyRemoved);
	// wire events for actions add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.actions, that.actionProxyAdded, that.actionProxyRemoved);
	// wire events for events add/remove
	this.wireCollectionAddRemoveHandlers(privates.events, that.eventProxyAdded, that.eventProxyRemoved);
}

Svidget.WidgetReference.prototype = {

	id: function () {
		var id = this.getset("id");
		return id;
	},

	name: function () {
		return this.id();
	},

	enabled: function (val) {
		var res = this.getset("enabled", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		// todo: signal widget
		// todo: uncomment when events are ready
		// this.trigger("changed", { property: "enabled" });
		return true;
	},

	url: function () {
		var url = this.getset("url");
		return url;
	},

	// RETURNS
	// The underlying HTML DOM element (either <object> or <iframe>) for this widget reference.
	element: function () {
		var ele = this.getset("element");
		return ele;
	},

	// RETURNS
	// The original HTML DOM <object> element used to declare this widget reference. Optional, null if declared programatically.
	declaringElement: function () {
		var ele = this.getset("declaringElement");
		return ele;
	},

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

	window: function () {
		// gets access to widget's window object, if different domain
		var ele = this.element();
		if (ele == null) return null;
		// note: only FF supports <object>.contentWindow
		// ele is usually a <iframe>
		return ele.contentWindow;
	},

	// gets a reference to the widget DOM document, if cross domain will return null
	document: function () {
		var ele = this.element();
		return Svidget.DOM.getDocument(ele);
	},

	// gets whether the widget reference is connected to its underlying widget
	// if false, then the widget is cut off from the page
	connected: function (val) {
		var res = this.getset("connected", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	},

	// gets the crossdomain flag
	crossdomain: function (val) {
		var res = this.getset("crossdomain", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		return true;
	},

	// RETURNS
	// A collection of ParamProxy objects.
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	param: function (selector) {
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// RETURNS
	// A collection of ActionProxy objects.
	actions: function (selector) {
		var col = this.getset("actions");
		return this.select(col, selector);
	},

	action: function (selector) {
		//var item = this.actions(selector).first();
		var col = this.getset("actions");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// RETURNS
	// A collection of EventDesc objects.
	events: function (selector) {
		var col = this.getset("events");
		return this.select(col, selector);
	},

	// public
	// Returns the first item indicated by selector
	event: function (selector) {
		var col = this.getset("events");
		var item = this.selectFirst(col, selector);
		return item;
	},

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

	// private
	// internal, called from action
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

	on: function (type, data, name, handler) {
		this.eventContainer().on(type, data, name, handler);
	},

	off: function (type, handlerOrName) {
		this.eventContainer().off(type, handlerOrName);
	},

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

	//state: function () {
	//	// possible: declared, initialized, loaded
	//	//return "declared";
	//	var state = this.getset("state");
	//	return state;
	//},

	start: function () {
		this.getset("started", true);
	},

	//setState: function (state) {
	//	var states = ["declared", "initialized", "loaded"];
	//	var index = states.indexOf(state);
	//	if (index < 0) return false;
	//	var curState = this.state();
	//	if (index <= states.indexOf(curState)) return false;
	//	this.getset("state", state);
	//	return true;
	//},

	// REGION: Populate

	// Inflates this object with the transport JSON object
	populate: function (widgetObj) {
		if (this.populated()) return;
		// build params/action proxies
		//		var transport = {
		//			id: this.id(),
		//			enabled: this.enabled(),
		//			params: this.toParamsTransport(),
		//			actions: this.toActionsTransport()
		//		};
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
				this.addParamProxy(p.name, p.value, p);
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
