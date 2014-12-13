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


/**
 * Represents the widget.
 * @class
 * @mixes Svidget.ObjectPrototype
 * @augments Svidget.EventPrototype
 * @memberof Svidget
 */
/*
// note: Widget class should be decoupled from the DOM
*/
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

	/**
	 * Gets a collection of all Param objects in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * params(0)
	 * params("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} [selector] - The selector string or integer.
	 * @returns {Svidget.ParamCollection} - A collection based on the selector, or the entire collection.
	*/
	params: function (selector) {
		var col = this.getset("params");
		return this.select(col, selector);
	},

	/**
	 * Gets the Param based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * param(0)
	 * param("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} selector - The index or ID of the param.
	 * @returns {Svidget.Param} - The Param based on the selector. If selector is invalid, null is returned.
	*/
	param: function (selector) {
		//var item = this.params(selector).first();
		var col = this.getset("params");
		var item = this.selectFirst(col, selector);
		return item;
	},

	/**
	 * Adds a Param to the widget. If a duplicate name is supplied the Param will fail to add.
	 * Examples:
	 * addParam("backColor", "#ffee54", { description: "Background color."})
	 * addParam("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the Param to add.
	 * @param {object} value - The value of the Param.
	 * @param {object} [options] - The options used to contruct the Param. Example: { enabled: true, description: "A param" }
	 * @returns {Svidget.Param} - The Param that was added, or null if Param failed to add.
	*/
	/*
	Adding an previously constructed Param object reserved for internal use.
	*/
	addParam: function (nameOrObject, value, options) {
		return this.params().add(nameOrObject, value, options, this);
	},

	/**
	 * Removes an Param from the widget. 
	 * Examples:
	 * removeParam("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the Param to remove.
	 * @returns {Boolean} - True if the Param was successfully removed, false otherwise.
	*/
	removeParam: function (name) {
		return this.params().remove(name);
	},

	// internal
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

	// internal
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

	// internal
	// called from param
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

	/**
	 * Gets a collection of all actions in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * actions(0)
	 * actions("doSomething")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} [selector] - 
	 * @returns {Svidget.ActionCollection} - A collection based on the selector, or the entire collection.
	*/
	actions: function (selector) {
		var col = this.getset("actions");
		return this.select(col, selector);
	},

	/**
	 * Gets the action object based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * action(1)
	 * action("doSomething")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} selector - The index or ID of the action.
	 * @returns {Svidget.Action} - The action based on the selector. If selector is invalid, null is returned.
	*/
	action: function (selector) {
		//var item = this.actions(selector).first();
		var col = this.getset("actions");
		var item = this.selectFirst(col, selector);
		return item;
	},

	/**
	 * Adds an Action to the widget. If a duplicate name is supplied the action will fail to add.
	 * Examples:
	 * addAction("doIt", { binding: function (s) { do_something(s) }, description: "Background color."})
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the param to add.
	 * @param {object} [options] - The options used to contruct the Action. Example: { enabled: true, description: "An action" }
	 * @returns {Svidget.Action} - The Action that was added, or null if Action failed to add.
	*/
	/*
	Adding an previously constructed Action object reserved for internal use.
	*/
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

	/**
	 * Removes an Action from the widget. 
	 * Examples:
	 * removeAction("someAction")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the Action to remove.
	 * @returns {boolean} - True if the Action was successfully removed, false otherwise.
	*/
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

	/**
	 * Gets a collection of all events in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * events(0)
	 * events("somethingHappened")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} [selector] - 
	 * @returns {Svidget.EventDescCollection} - A collection based on the selector, or the entire collection.
	*/
	events: function (selector) {
		var col = this.getset("events");
		return this.select(col, selector);
	},

	/**
	 * Gets the event object based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * event(0)
	 * event("somethingHappened")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {object} selector - The index or ID of the event.
	 * @returns {Svidget.EventDesc} - The event based on the selector. If selector is invalid, null is returned.
	*/
	event: function (selector) {
		var col = this.getset("events");
		var item = this.selectFirst(col, selector);
		return item;
	},

	/**
	 * Adds an EventDesc object to the widget. If a duplicate name is supplied the EventDesc will fail to add.
	 * Examples:
	 * addEvent("somethingHappened", { description: "An event for that." })
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the EventDesc to add.
	 * @param {object} [options] - The options used to contruct the EventDesc. Example: { enabled: true, description: "An event" }
	 * @returns {Svidget.Action} - The EventDesc that was added, or null if EventDesc failed to add.
	*/
	/*
	Adding an previously constructed Action object reserved for internal use.
	*/
	addEvent: function (nameOrObject, options) {
		return this.events().add(nameOrObject, options, this);
	},

	/**
	 * Removes an EventDesc object from the widget. 
	 * Examples:
	 * removeEvent("somethingHappened")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {string} name - The name of the EventDesc to remove.
	 * @returns {boolean} - True if the EventDesc was successfully removed, false otherwise.
	*/
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

	/*
	//bubbleFuncs: function (objectType) {
	//	if (objectType == "param") return this.paramBubble;
	//	if (objectType == "action") return this.actionBubble;
	//	if (objectType == "event") return this.eventBubble;
	//	return null;
	//},
	*/

	// REGION: Properties

	/**
	 * Gets the widget ID. 
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {string} - The widget ID as a string.
	*/
	id: function () {
		return this.getset("id");
	},

	/**
	 * Gets or sets whether the widget is enabled. 
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {Boolean} [val] - Sets the enabled state when specified.
	 * @returns {Boolean} - The enabled state, when nothing is passed, or true/false based on if setting is succeeded or failed.
	*/
	enabled: function (val) {
		var res = this.getset("enabled", val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire "changed" event
		if (this.trigger) this.trigger("change", { property: "enabled", value: val });

		return true;
	},

	/**
	 * Gets whether the widget is connected to a parent page. 
	 * If true, it means the page initialized the widget and is listening for events.
	 * If false, it means the widget was loaded independently and/or outside of of the control of the framework (standalone mode).
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {Boolean} - Whether the widget is connected
	*/
	connected: function () {
		return this.getset("connected");
	},

	/**
	 * Gets whether the widget has started. This is true once the DOM is loaded.
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {boolean} - Whether the widget is started.
	*/
	started: function () {
		var val = this.getset("started");
		return val;
	},

	// REGION: Communication

	/**
	 * Serializes the Widget object for transport across a window boundary.
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {boolean} - A generic serialized object representing the Widget.
	*/
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

	// private
	toParamsTransport: function () {
		var col = this.params();
		var ps = col.select(function (p) { return p.toTransport(); }).toArray();
		return ps;
	},

	// private
	toActionsTransport: function () {
		var col = this.actions();
		var acs = col.select(function (a) { return a.toTransport(); }).toArray();
		return acs;
	},

	// private
	toEventsTransport: function () {
		var col = this.events();
		var evs = col.select(function (e) { return e.toTransport(); }).toArray();
		return evs;
	},

	/**
	* Adds an event handler for the "paramadd" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onparamadd: function (data, name, handler) {
		return this.on("paramadd", data, name, handler);
	},

	ondeclaredparamadd: function (handler) {
		return this.onparamadd(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "paramadd" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offparamadd: function (handlerOrName) {
		return this.off("paramadd", handlerOrName);
	},

	offdeclaredparamadd: function () {
		return this.offparamadd(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "paramremove" event. 
	 * @method
	 * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @param {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onparamremove: function (data, name, handler) {
		return this.on("paramremove", data, name, handler);
	},

	ondeclaredparamremove: function (handler) {
		return this.onparamremove(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "paramremove" event. 
	* @method
	* @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offparamremove: function (handlerOrName) {
		return this.off("paramremove", handlerOrName);
	},

	offdeclaredparamremove: function () {
		return this.offparamremove(Svidget.declaredHandlerName);
	},

	/**
* Adds an event handler for the "actionadd" event. 
 * @method
 * @action {object} [data] - Arbirary data to initialize Event object with when event is triggered.
 * @action {string} [name] - The name of the handler. Useful when removing the handler for the event.
 * @action {Function} handler - The event handler.
 * @returns {boolean} - True if the event handler was successfully added.
*/
	onactionadd: function (data, name, handler) {
		return this.on("actionadd", data, name, handler);
	},

	ondeclaredactionadd: function (handler) {
		return this.onactionadd(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "actionadd" event. 
	* @method
	* @action {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offactionadd: function (handlerOrName) {
		return this.off("actionadd", handlerOrName);
	},

	offdeclaredactionadd: function () {
		return this.offactionadd(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "actionremove" event. 
	 * @method
	 * @action {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @action {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @action {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	onactionremove: function (data, name, handler) {
		return this.on("actionremove", data, name, handler);
	},

	ondeclaredactionremove: function (handler) {
		return this.onactionremove(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "actionremove" event. 
	* @method
	* @action {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offactionremove: function (handlerOrName) {
		return this.off("actionremove", handlerOrName);
	},

	offdeclaredactionremove: function () {
		return this.offactionremove(Svidget.declaredHandlerName);
	},

	/**
* Adds an event handler for the "eventadd" event. 
* @method
* @event {object} [data] - Arbirary data to initialize Event object with when event is triggered.
* @event {string} [name] - The name of the handler. Useful when removing the handler for the event.
* @event {Function} handler - The event handler.
* @returns {boolean} - True if the event handler was successfully added.
*/
	oneventadd: function (data, name, handler) {
		return this.on("eventadd", data, name, handler);
	},

	ondeclaredeventadd: function (handler) {
		return this.oneventadd(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "eventadd" event. 
	* @method
	* @event {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offeventadd: function (handlerOrName) {
		return this.off("eventadd", handlerOrName);
	},

	offdeclaredeventadd: function () {
		return this.offeventadd(Svidget.declaredHandlerName);
	},

	/**
	* Adds an event handler for the "eventremove" event. 
	 * @method
	 * @event {object} [data] - Arbirary data to initialize Event object with when event is triggered.
	 * @event {string} [name] - The name of the handler. Useful when removing the handler for the event.
	 * @event {Function} handler - The event handler.
	 * @returns {boolean} - True if the event handler was successfully added.
	*/
	oneventremove: function (data, name, handler) {
		return this.on("eventremove", data, name, handler);
	},

	ondeclaredeventremove: function (handler) {
		return this.oneventremove(null, Svidget.declaredHandlerName, handler);
	},

	/**
	* Removes an event handler for the "eventremove" event. 
	* @method
	* @event {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
	* @returns {boolean} - True if the event handler was successfully removed.
	*/
	offeventremove: function (handlerOrName) {
		return this.off("eventremove", handlerOrName);
	},

	offdeclaredeventremove: function () {
		return this.offeventremove(Svidget.declaredHandlerName);
	},

	// overrides

	/**
	 * Gets a string representation of this object.
	 * @method
	 * @returns {string}
	*/
	toString: function () {
		return "[Svidget.Widget { id: \"" + this.id() + "\" }]";
	}

};

Svidget.Widget.eventTypes = ["change", "paramvaluechange", "paramchange", "paramadd", "paramremove", "actioninvoke", "actionchange", "actionadd", "actionremove", "eventtrigger", "eventadd", "eventremove"];


Svidget.extend(Svidget.Widget, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Widget, new Svidget.EventPrototype(Svidget.Widget.eventTypes));
