/*****************************************
svidget.widget.js

Contains the core framework elements.

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

// note: Widget class should be decoupled from the DOM

Svidget.Widget = function () {
	this.__type = "Svidget.Widget";
	var that = this;
	// privates
	var privates = new (function () {
		this.writable = ["id", "enabled", "started", "connected"];
		this.params = new Svidget.ParamCollection([], that);
		this.actions = new Svidget.ActionCollection([], that);
		this.events = new Svidget.EventDescCollection([], that);
		this.enabled = true; // reserved for future use
		this.connected = false;
		this.started = false;
		this.id = null; // provided by parent
		this.page = null; // todo: get a reference to an object containing details about the page (determine if we need)
		this.parentElement = null; // todo: gets a DomItem describing the parent element <object> or <iframe>
	})();
	// private accessors
	this.setup(privates);

	// this.started = false;
	// this.loaded = false;
	// this.standalone = false;
	// this.paramValues = null;

	// wire events for params add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.params, that.paramAdded, that.paramRemoved);

	// wire events for actions add/remove and bubbles
	this.wireCollectionAddRemoveHandlers(privates.actions, that.actionAdded, that.actionRemoved);

	// wire events for events add/remove
	this.wireCollectionAddRemoveHandlers(privates.events, that.eventAdded, that.eventRemoved);


	this._init();
}

Svidget.Widget.prototype = {

	_init: function () {
		// constructor logic
	},

	/* Called by parent (via global object) to signal that is has established its relationship with the parent page.
	// Params:
	//   id: the ID assigned to this widget
	//   paramValues: the param values as they were declared on the page, or provided if widget declared programmatically
	// Remarks:
	//   start() may be called at any point during the DOM lifecycle for this widget, i.e. while DOM is still parsing or when completed
//	start: function (id, paramValues) {
//		if (this.started) return;
//		Svidget.log("widget: start {id: " + id + "}");
//		// set ID
//		this.getset("id", id);
//		this.paramValues = paramValues || {};
//		// if ready() was called first, widget in standalone mode, so switch to connected mode
//		if (this.standalone) this.connect();
//		//this.startConnected();
//		this.started = true;
//		// check if DOM loaded, if not then wait
//		//if (!this.loaded) return;
//	},

//	// called when DOM is finished loading (but assets aren't loaded yet)
//	ready: function () {
//		// populate objects - params, actions
//		this.populateObjects();
//		// set up widget as either standalone or connected
//		if (!this.started)
//			this.readyStandalone();
//		else
//			this.readyConnected();

//		this.loaded = true;
//	},*/

	start: function () {
		// if DOM not ready then readyConnected(0 will be called when ready()
		//if (this.loaded) this.readyConnected();
		this.getset("started", true);
	},

	connect: function (id) {
		// if DOM not ready then readyConnected(0 will be called when ready()
		//if (this.loaded) this.readyConnected();
		if (this.connected()) return;
		this.getset("id", id);
		this.getset("connected", true);
	},

	// REGION: Parent

	// internal
	// called from the root to signal that the parent element has changed, so we update there
	updateParentElement: function (item) {

	},


	// REGION: Params

	// select by index: params(0)
	// select by name: params("color")
	// return read-only collection: params()
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	param: function (selector) {
		//var item = this.params(selector).first();
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// public
	addParam: function (nameOrObject, value, options) {
		return this.params().add(nameOrObject, value, options, this);
	},

	// public
	removeParam: function (name) {
		return this.params().remove(name);
	},

	// handle param added
	paramAdded: function (param) {
		// raise event
		//alert('param added');
		Svidget.log('widget: param added: ' + param.name());
		// event.value = param
		this.trigger("paramadd", param);
		// signal parent
		svidget.signalParamAdded(param);
	},

	// private
	// handle param removed
	paramRemoved: function (param) {
		// raise event
		//alert('param removed');
		Svidget.log('widget: param removed: ' + param.name());
		// event.value = param.name
		this.trigger("paramremove", param.name());
		// signal parent
		svidget.signalParamRemoved(param.name());
	},

	// internal, called from param
	paramBubble: function (type, event, param) {
		if (type == "change") this.paramChanged(param, event.value);
		if (type == "valuechange") this.paramValueChanged(param, event.value);
	},

	// private
	// eventValue ex = { property: "binding", value: bindValue }
	paramChanged: function (param, eventValue) {
		this.trigger("paramchange", eventValue, param);
		// signal parent
		svidget.signalParamChanged(param, eventValue);
	},

	// private
	// eventValue ex = { value: "3" }
	paramValueChanged: function (param, eventValue) {
		this.trigger("paramvaluechange", eventValue, param);
		// signal parent
		svidget.signalParamValueChanged(param, eventValue);
	},

	// REGION: Actions

	// public
	// select by index: params(0)
	// select by name: params("color")
	// return read-only collection: params()
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

	// public
	addAction: function (nameOrObject, options) {
		var action = this.actions().add(nameOrObject, options, this);
		if (action == null) return action;
		// add params
		// options.params
		if (options == null || options.params == null || !Svidget.isArray(options.params)) return action;
		for (var i = 0; i < options.params.length; i++) {
			var p = options.params[i];
			if (p != null && p.name != null) {
				action.addParam(p.name, p);
			}
		}
	},

	// public
	removeAction: function (name) {
		return this.actions().remove(name);
	},

	// private
	// handle action added
	actionAdded: function (action) {
		Svidget.log('widget: action added: ' + action.name());
		// trigger event
		// event.value = action
		this.trigger("actionadd", action);
		// signal parent
		svidget.signalActionAdded(action);
	},

	// private
	// handle action removed
	actionRemoved: function (action) {
		Svidget.log('widget: action removed: ' + action.name());
		// trigger event
		// event.value = action.name
		this.trigger("actionremove", action.name());
		// signal parent
		svidget.signalActionRemoved(action.name());
	},

	// private
	// internal, called from action
	actionBubble: function (type, event, action) {
		if (type == "invoke") this.actionInvoked(action, event.value);
		if (type == "change") this.actionChanged(action, event.value);
		// event.target is actionParam that was changed
		if (type == "paramchange") this.actionParamChanged(action, event.target, event.value);
		// for add/remove, event.value == actionParam added or removed
		if (type == "paramadd") this.actionParamAdded(action, event.value);
		if (type == "paramremove") this.actionParamRemoved(action, event.value);
	},

	// private
	actionInvoked: function (action, returnData) {
		this.trigger("actioninvoke", returnData, action);
		// signal parent
		svidget.signalActionInvoked(action, returnData);
	},

	// private
	// eventValue ex = { property: "binding", value: bindValue }
	actionChanged: function (action, eventValue) {
		this.trigger("actionchange", eventValue, action);
		// signal parent
		svidget.signalActionChanged(action, eventValue);
	},

	// private
	actionParamChanged: function (action, actionParam, eventValue) {
		this.trigger("actionparamchange", eventValue, actionParam);
		// signal parent
		svidget.signalActionParamChanged(actionParam, action, eventValue);
	},

	// private
	actionParamAdded: function (action, actionParam) {
		this.trigger("actionparamadd", actionParam, action);
		// signal parent
		svidget.signalActionParamAdded(actionParam, action.name());
	},

	// private
	actionParamRemoved: function (action, actionParamName) {
		this.trigger("actionparamremove", actionParamName, action);
		// signal parent
		svidget.signalActionParamRemoved(actionParamName, action.name());
	},

	// REGION: Events 

	// public
	// select by index: events(0)
	// select by name: events("color")
	// return read-only collection: events()
	events: function (selector) {
		var col = this.getset("events");
		return this.select(col, selector);
	},

	event: function (selector) {
		var col = this.getset("events");
		var item = this.selectFirst(col, selector);
		return item;
	},

	// public
	addEvent: function (nameOrObject, options) {
		return this.events().add(nameOrObject, options, this);
	},

	// public
	removeEvent: function (name) {
		return this.events().remove(name);
	},

	// private
	// handle event added
	eventAdded: function (eventDesc) {
		Svidget.log('widget: event added: ' + eventDesc.name());
		// trigger event
		// event.value = event
		this.trigger("eventadd", eventDesc);
		// signal parent
		svidget.signalEventAdded(eventDesc);
	},

	// private
	// handle event removed
	eventRemoved: function (eventDesc) {
		Svidget.log('widget: event removed: ' + eventDesc.name());
		// trigger event
		// event.value = event name
		this.trigger("eventremove", eventDesc.name());
		// signal parent
		svidget.signalEventRemoved(eventDesc.name());
	},

	// internal, called from eventdesc.EventPrototype
	eventBubble: function (type, event, eventDesc) {
		if (type == "trigger") this.eventTrigger(eventDesc, event);
		if (type == "change") this.eventChanged(eventDesc, event.value);
	},

	// private
	eventTrigger: function (eventDesc, event) {
		Svidget.log('widget: event trigger: ' + eventDesc.name());
		this.trigger("eventtrigger", event.value, eventDesc);
		// FYI: event.target == eventDesc
		svidget.signalEventTriggered(event.target, event.value);
	},

	// private
	eventChanged: function (eventDesc, eventValue) {
		this.trigger("eventchange", eventValue, eventDesc);
		// signal parent
		svidget.signalEventChanged(eventDesc, eventValue);
	},

	//bubbleFuncs: function (objectType) {
	//	if (objectType == "param") return this.paramBubble;
	//	if (objectType == "action") return this.actionBubble;
	//	if (objectType == "event") return this.eventBubble;
	//	return null;
	//},

	// REGION: Properties

	id: function () {
		return this.getset("id");
	},

	enabled: function () {
		return this.getset("enabled");
		// todo: should be settable
	},

	connected: function () {
		return this.getset("connected");
	},

	started: function () {
		var val = this.getset("started");
		return val;
	},

	// REGION: Communication

	// todo: rename to serialize()
	toTransport: function () {
		var transport = {
			id: this.id(),
			enabled: this.enabled(),
			params: this.toParamsTransport(),
			actions: this.toActionsTransport(),
			events: this.toEventsTransport()
		};
		return transport;
	},

	toParamsTransport: function () {
		var col = this.params();
		var ps = col.select(function (p) { return p.toTransport(); }).toArray();
		return ps;
	},

	toActionsTransport: function () {
		var col = this.actions();
		var acs = col.select(function (a) { return a.toTransport(); }).toArray();
		return acs;
	},

	toEventsTransport: function () {
		var col = this.events();
		var evs = col.select(function (e) { return e.toTransport(); }).toArray();
		return evs;
	},

};

// todo: wrap in closure to prevent tampering
Svidget.Widget.eventTypes = ["paramvaluechange", "paramchange", "paramadd", "paramremove", "actioninvoke", "actionchange", "actionadd", "actionremove", "eventtrigger", "eventadd", "eventremove"];


Svidget.extend(Svidget.Widget, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Widget, new Svidget.EventPrototype(Svidget.Widget.eventTypes));
