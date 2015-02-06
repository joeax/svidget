/*****************************************
svidget.root.widget.js

Contains the root object for SVG widgets.

Dependencies:
Svidget.Core
Svidget.Root

******************************************/



Svidget.Root.WidgetPrototype = {

	// ***********************************
	// REGION: Initializing

	initInternal: function () {
		// init widget object
		this.loadCurrent();
		// notify parent that widget is initialized and ready to be started
		// update: moved to sviget.start because we don't want to signal until svidget object created
		//this.signalInitialized();
		window._svidget = "widget";
	},

	/* Widget Mode */

	readyWidget: function () {
		Svidget.log('widget: readyWidget');
		//alert("widget");
		//this.loadCurrent();
		// start widget
		this.startWidget();
		// call ready on the widget for final setup
		//this.current().ready();
		// notify parent that widget is loaded
		//this.signalLoaded();
	},

	// ***********************************
	// REGION: Widget Element Loading

	// widget object should be instantiated before ready
	loadCurrent: function () {
		// load widget object
		var widget = new Svidget.Widget();
		this.setCurrent(widget);
		this.setCurrent = null; // destroy the setter, freeze this.current();
		// load widget objects:
		// params, actions
		//alert(doc.readyState);
		// assign a shortcut to current() i.e. svidget.$.param("text")
		Object.defineProperty(this, "$", Svidget.readOnlyProperty(widget));
	},

	startWidget: function () {
		var widget = this.current();
		// populate objects
		this.populateObjects();
		// set up widget as either standalone or connected
		if (!this.connected()) 
			this.startWidgetStandalone(widget);
		else
			this.startWidgetConnected(widget);
		// 0.1.3: fire loaded event
		//this.markLoaded();
	},

	startWidgetStandalone: function (widget) {
		//Svidget.log("startWidgetStandalone");
		// read values from query string and populate params
		var paramValues = this.getParamValuesFromQueryString();
		this.setParamValues(widget, paramValues, true);
		widget.start();
	},

	startWidgetConnected: function (widget) {
		//Svidget.log("startWidgetConnected");
		if (this.paramValues != null) {
			this.setParamValues(this.paramValues);
			this.paramValues = null; // clear this out, we dont need it anymore
			widget.setPopulatedFromPage();
		}
		widget.start();
	},
	
	/* Populate Declared Objects */

	populateObjects: function () {
		// get <svidget:params> xml element
		var paramsElement = this.getParamsElement();
		// populate params
		this.populateParams(paramsElement);
		// get <svidget:actions> xml element
		var actionsElement = this.getActionsElement();
		// populate actions
		this.populateActions(actionsElement);
		// get <svidget:events> xml element
		var eventsElement = this.getEventsElement();
		// populate events
		this.populateEvents(eventsElement);
	},

	getParamsElement: function () {
		return this.getSvidgetElement("params");
	},

	getActionsElement: function () {
		return this.getSvidgetElement("actions");
	},

	getEventsElement: function () {
		return this.getSvidgetElement("events");
	},

	getSvidgetElement: function (name) {
		var eles = Svidget.DOM.getByNameSvidget(name, true);
		if (eles.length == 0) return null;
		return eles[0];
	},

	// Populates Params into the widget based on the 
	// xele == <svidget:params> element
	populateParams: function (xele) {
		if (xele == null) return; // param element missing
		var that = this;
		var widget = this.current();
		this.populateElementObjects(xele, function (nextEle, widget) {
			var param = that.buildParam(nextEle, widget);
			if (param != null) widget.addParam(param);
		});
		// 0.1.3: wire declared add/remove handlers
		this.wireDeclaredHandler(widget, widget.ondeclaredparamadd, Svidget.DOM.attrValue(xele, "onadd"));
		this.wireDeclaredHandler(widget, widget.ondeclaredparamremove, Svidget.DOM.attrValue(xele, "onremove"));
	},

	buildParam: function (xele, widget) {
		if (!this.isValidSvidgetElement(xele, "param")) return null;
		var name = Svidget.DOM.attrValue(xele, "name"); //xele.attributes["name"];
		if (name == null) return null; // don't allow a param without a name
		var value = Svidget.DOM.attrValue(xele, "value"); //xele.attributes["value"];
		var options = this.buildOptions(xele, Svidget.Param.optionProperties);
		var param = new Svidget.Param(name, value, options, widget);
		this.wireDeclaredChangeHandler(param, Svidget.DOM.attrValue(xele, "onchange"));
		this.wireDeclaredSetHandler(param, Svidget.DOM.attrValue(xele, "onset"));
		return param;
	},

	populateActions: function (xele) {
		if (xele == null) return; // action element missing
		var that = this;
		var widget = this.current();
		this.populateElementObjects(xele, function (nextEle, widget) {
			var action = that.buildAction(nextEle, widget);
			if (action != null) {
				widget.addAction(action);
				that.populateActionParams(nextEle, action);
			}
		});
		// 0.1.3: wire declared add/remove handlers
		this.wireDeclaredHandler(widget, widget.ondeclaredactionadd, Svidget.DOM.attrValue(xele, "onadd"));
		this.wireDeclaredHandler(widget, widget.ondeclaredactionremove, Svidget.DOM.attrValue(xele, "onremove"));
	},

	// Populates action params into the action
	// actionEle == <svidget:action> element
	populateActionParams: function (actionEle, action) {
		if (actionEle == null) return; // actionparam element missing
		var that = this;
		this.populateElementObjects(actionEle, function (nextEle, widget) {
			var param = that.buildActionParam(nextEle, action);
			if (param != null) action.addParam(param);
		});

	},

	buildAction: function (xele, widget) {
		if (!this.isValidSvidgetElement(xele, "action")) return null;
		var name = Svidget.DOM.attrValue(xele, "name"); //xele.attributes["name"];
		if (name == null) return null; // don't allow a param without a name
		var options = this.buildOptions(xele, Svidget.Action.optionProperties);
		var action = new Svidget.Action(name, options, widget);
		// 0.1.3: wire declared add/remove handlers
		this.wireDeclaredChangeHandler(action, Svidget.DOM.attrValue(xele, "onchange"));
		this.wireDeclaredInvokeHandler(action, Svidget.DOM.attrValue(xele, "oninvoke"));		
		this.wireDeclaredParamAddHandler(action, Svidget.DOM.attrValue(xele, "onparamadd"));
		this.wireDeclaredParamRemoveHandler(action, Svidget.DOM.attrValue(xele, "onparamremove"));
		this.wireDeclaredParamChangeHandler(action, Svidget.DOM.attrValue(xele, "onparamchange"));
		return action;
	},

	buildActionParam: function (xele, action) {
		if (!this.isValidSvidgetElement(xele, "actionparam")) return null;
		var name = Svidget.DOM.attrValue(xele, "name"); //xele.attributes["name"];
		if (name == null) return null; // don't allow a param without a name
		var options = this.buildOptions(xele, Svidget.ActionParam.optionProperties);
		var param = new Svidget.ActionParam(name, options, action);
		this.wireDeclaredChangeHandler(param, Svidget.DOM.attrValue(xele, "onchange"));
		return param;
	},

	// Populates Params into the widget based on the 
	// xele == <svidget:events> element
	populateEvents: function (xele) {
		if (xele == null) return; // event element missing
		var that = this;
		var widget = this.current();
		this.populateElementObjects(xele, function (nextEle, widget) {
			var ev = that.buildEvent(nextEle, widget);
			if (ev != null) widget.addEvent(ev);
		});
		// 0.1.3: wire declared add/remove handlers
		this.wireDeclaredHandler(widget, widget.ondeclaredeventadd, Svidget.DOM.attrValue(xele, "onadd"));
		this.wireDeclaredHandler(widget, widget.ondeclaredeventremove, Svidget.DOM.attrValue(xele, "onremove"));
	},

	buildEvent: function (xele, widget) {
		if (!this.isValidSvidgetElement(xele, "event")) return null;
		var name = Svidget.DOM.attrValue(xele, "name"); //xele.attributes["name"];
		if (name == null) return null; // don't allow a param without a name
		var options = this.buildOptions(xele, Svidget.EventDesc.optionProperties);
		var ev = new Svidget.EventDesc(name, options, widget);
		this.wireDeclaredChangeHandler(ev, Svidget.DOM.attrValue(xele, "onchange"));
		this.wireDeclaredTriggerHandler(ev, Svidget.DOM.attrValue(xele, "ontrigger"));
		return ev;
	},

	populateElementObjects: function (xele, eachAction) {
		if (xele == null || xele.childNodes == null) return;
		var widget = this.current();
		var nextEle = xele.firstElementChild;
		while (nextEle != null) {
			if (eachAction) eachAction(nextEle, widget);
			nextEle = nextEle.nextElementSibling;
		}
	},

	buildOptions: function (xele, optionProps) {
		var options = {};
		if (optionProps == null || !Svidget.isArray(optionProps)) return options;
		for (var i = 0; i < optionProps.length; i++) {
			var optName = optionProps[i];
			var optVal = Svidget.DOM.attrValue(xele, optName);
			if (optVal != null) options[optName] = optVal;
		}
		return options;
	},

	wireDeclaredChangeHandler: function (obj, funcStr) {
		this.wireDeclaredHandler(obj, obj.ondeclaredchange, funcStr);
	},

	wireDeclaredSetHandler: function (param, funcStr) {
		this.wireDeclaredHandler(param, param.ondeclaredset, funcStr);
	},

	wireDeclaredInvokeHandler: function (action, funcStr) {
		this.wireDeclaredHandler(action, action.ondeclaredinvoke, funcStr);
	},

	wireDeclaredTriggerHandler: function (event, funcStr) {
		this.wireDeclaredHandler(event, event.ondeclaredtrigger, funcStr);
	},

	wireDeclaredParamAddHandler: function (action, funcStr) {
		this.wireDeclaredHandler(action, action.ondeclaredparamadd, funcStr);
	},

	wireDeclaredParamRemoveHandler: function (action, funcStr) {
		this.wireDeclaredHandler(action, action.ondeclaredparamremove, funcStr);
	},

	wireDeclaredParamChangeHandler: function (action, funcStr) {
		this.wireDeclaredHandler(action, action.ondeclaredparamchange, funcStr);
	},

	wireDeclaredHandler: function (obj, wireFunc, funcStr) {
		if (wireFunc == null) return;
		var func = Svidget.findFunction(funcStr);
		if (func == null || !Svidget.isFunction(func)) return;
		wireFunc.call(obj, func);
	},

	// Called by parent (via global object) to signal that is has established its relationship with the parent page.
	// Params:
	//   id: the ID assigned to this widget
	//   paramValues: the param values as they were declared on the page, or provided if widget declared programmatically
	//   connected: whether the widget is connected to its parent, if false it will remain in standalone mode and cease any further communication with the parent
	// Remarks:
	//   start() may be called at any point during the DOM lifecycle for this widget, i.e. while DOM is still parsing or when completed
	connectWidget: function (id, paramValues, connected) {
		var widget = this.current();
		if (widget.connected()) return;
		// connect, setting id
		if (connected) {
			Svidget.log("widget: connect {id: " + id + "}");
			widget.connect(id);
			this.getset("connected", true);
		}
		else {
			Svidget.log("widget: standalone {id: " + id + "}");
		}

		this.paramValues = paramValues || {};
		/* if ready() was called first, widget in standalone mode, so switch to connected mode
		//if (!widget.connected()) this.connect();
		//this.startConnected(); */
	},

	startWidgetWithPageParams: function () {
		//Svidget.log("startWidgetWithPageParams");
		var widget = this.current();
		if (widget.started()) {
			this.setParamValues(widget, this.paramValues);
			widget.setPopulatedFromPage();
		}
	},

	// Gets the param values from the query string.
	getParamValuesFromQueryString: function () {
		var qs = Svidget.Util.queryString();
		return qs;
	},

	// SUMMARY
	// Sets the param values for every param using the values from the specified object. This object can be from the query string or parent.
	// Params initialized with a value will be skipped if there is no matching entry in the values object.
	setParamValues: function (widget, paramValues, qsMode) {
		// note: can only be called internally
		// loop through all params, if value in paramValues then overwrite, if value not yet populated on param then use default value, otherwise skip
		//var widget = this.current();
		var col = widget.params();
		if (col == null) return;
		col.each(function (p) {
			var key = qsMode ? p.shortname() || p.name() : p.name();
			var val = paramValues[key]; // query string value present so use it
			if (val === undefined) val = p.defvalue(); // 0.1.3: query string value not present, so use defvalue
			if (key !== undefined) {
				// value is present in query string or defvalue attr
				p.value(val);
			}
		});
	},

	isValidSvidgetElement: function (xele, name) {
		return xele != null && xele.localName == name && xele.namespaceURI == Svidget.Namespaces.svidget;
	},

	// ***********************************
	// REGION: Public Properties

	/**
	 * Gets the current widget. 
	 * @method
	 * @memberof Svidget.Root
	 * @returns {Svidget.Widget} - The current widget.
	*/
	current: function () {
		return this.getset("current");
	},

	/**
	 * Gets whether the widget is connected to a parent page.
	 * @method
	 * @memberof Svidget.Root
	 * @returns {boolean}
	*/
	connected: function () {
		return this.getset("connected");
	},

	// ***********************************
	// REGION: Communications

	receiveFromParent: function (name, payload) {
		Svidget.log("widget: receiveFromParent {name: " + name + "}");
		if (name == "start")
			this.handleReceiveParentStart(payload);
		else if (name == "actioninvoke")
			this.handleReceiveParentActionInvoke(payload);
		else if (name == "eventtrigger")
			this.handleReceiveParentEventTrigger(payload);
		else if (name == "propertychange")
			this.handleReceiveParentPropertyChange(payload);
	},

	/* Signaling */

	/*
	// NOTE: Except for initialized and loaded, if widget is standalone don't not signal

	//signalInitialized: function () {
	//	Svidget.log("widget: signalInitialized");
	//	// at this stage we don't know our ID yet nor do we have any payload
	//	this.comm().signalParent("initialized", null, null); //this.current().toTransport());
	//},

	//signalLoaded: function () {
	//	// note: id can be null, it means it hasn't been assigned yet (widget DOM loaded before start called)
	//	Svidget.log("widget: signalLoaded {id: " + this.current().id() + "}");
	//	this.comm().signalParent("loaded", this.current().toTransport(), this.current().id());
	//},
	*/

	signalStartAck: function () {
		Svidget.log("widget: signalStartAck {id: " + this.current().id() + "}");
		var t = this.current().toTransport();
		this.comm().signalParent("startack", t, this.current().id());
	},

	// for any other signals, if widget isn't connected then don't signal

	// Params

	signalParamAdded: function (param) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalParamAdded {id: " + this.current().id() + "}");
		var transport = param.toTransport();
		this.comm().signalParent("paramadded", transport, this.current().id());
	},

	signalParamRemoved: function (paramName) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalParamRemoved {id: " + this.current().id() + "}");
		//var transport = param.name();
		this.comm().signalParent("paramremoved", paramName, this.current().id());
	},

	signalParamChanged: function (param, changeData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalParamChanged {id: " + this.current().id() + "}");
		changeData.name = param.name(); // add param name
		this.comm().signalParent("paramchanged", changeData, this.current().id());
	},

	signalParamSet: function (param, changeData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalParamSet {id: " + this.current().id() + "}");
		changeData.name = param.name(); // add param name
		this.comm().signalParent("paramset", changeData, this.current().id());
	},

	// Actions/Action Params

	signalActionAdded: function (action) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionAdded {id: " + this.current().id() + "}");
		var transport = action.toTransport();
		this.comm().signalParent("actionadded", transport, this.current().id());
	},

	signalActionRemoved: function (actionName) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionRemoved {id: " + this.current().id() + "}");
		//var t = action.name();
		this.comm().signalParent("actionremoved", actionName, this.current().id());
	},

	// changeData: { name: actionName, property: "enabled", value: val }
	signalActionChanged: function (action, changeData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionChanged {id: " + this.current().id() + "}");
		changeData.name = action.name(); // add action name
		this.comm().signalParent("actionchanged", changeData, this.current().id());
	},

	// returnData: { name: actionName, returnValue: "enabled", value: val }
	signalActionInvoked: function (action, returnData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionInvoked {id: " + this.current().id() + "}");
		//var transport = { name: action.name(), retu: argObj };
		returnData.name = action.name();
		this.comm().signalParent("actioninvoked", returnData, this.current().id());
	},

	signalActionParamAdded: function (actionParam, actionName) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionParamAdded {id: " + this.current().id() + "}");
		var transport = actionParam.toTransport();
		transport.actionName = actionName;
		this.comm().signalParent("actionparamadded", transport, this.current().id());
	},

	signalActionParamRemoved: function (actionParamName, actionName) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionParamRemoved {id: " + this.current().id() + "}");
		//var t = action.name();
		var transport = { name: actionParamName, actionName: actionName };
		this.comm().signalParent("actionparamremoved", transport, this.current().id());
	},

	signalActionParamChanged: function (actionParam, action, changeData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalActionParamChanged {id: " + this.current().id() + "}");
		changeData.name = actionParam.name(); // add actionparam name
		changeData.actionName = action.name(); // add actionparam name
		this.comm().signalParent("actionparamchanged", changeData, this.current().id());
	},

	// Events

	signalEventAdded: function (eventDesc) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalEventAdded {id: " + this.current().id() + "}");
		var transport = eventDesc.toTransport();
		this.comm().signalParent("eventadded", transport, this.current().id());
	},

	signalEventRemoved: function (eventDescName) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalEventRemoved {id: " + this.current().id() + "}");
		//var transport = eventDesc.name();
		this.comm().signalParent("eventremoved", eventDescName, this.current().id());
	},

	signalEventChanged: function (eventDesc, changeData) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalEventChanged {id: " + this.current().id() + "}");
		changeData.name = eventDesc.name(); // add event name
		this.comm().signalParent("eventchanged", changeData, this.current().id());
	},

	signalEventTriggered: function (eventDesc, value) {
		if (!this.connected()) return; // no signaling if not connected
		Svidget.log("widget: signalEventTriggered {id: " + this.current().id() + "}");
		var transport = { "name": eventDesc.name(), "value": value };
		this.comm().signalParent("eventtriggered", transport, this.current().id());
	},


	/* Signal Handlers */

	// payload == { id: widgetRef.id(), params: paramValues };
	handleReceiveParentStart: function (payload) {
		payload = payload || {};
		//this.current().start(payload.id, payload.params);
		// wire up data from parent
		var connected = payload.connected !== false;
		this.connectWidget(payload.id, payload.params, connected); // we default to connected, so if undefined then true
		// tell the parent that we got the start signal -  before we set anything on widget from parent
		if (connected) this.signalStartAck();
		// if widget already started, update param values with ones passed from page
		this.startWidgetWithPageParams();
	},

	handleReceiveParentPropertyChange: function (payload) {
		payload = payload || {};
		var objType = payload.type;
		// only support param.value for now
		if (payload.type == "param" && payload.propertyName == "value" && payload.name != null) {
			var param = this.current().param(payload.name);
			if (param != null) {
				param.value(payload.value);
			}
		}
	},

	// payload == { action: actionProxy.name(), args: argList }
	handleReceiveParentActionInvoke: function (payload) {
		payload = payload || {};
		var actionName = payload.action;
		var action = this.current().action(actionName);
		if (action == null || !action.external()) return; // todo: maybe send some fail message?
		action.invokeApply(payload.args);
//		//this.current().start(payload.id, payload.params);
//		this.connectWidget(payload.id, payload.params);
//		this.signalStartAck();
	},

	handleReceiveParentEventTrigger: function (payload) {
		payload = payload || {};
		var eventName = payload.event;
		var ev = this.current().event(eventName);
		if (ev == null || !ev.external()) return; // todo: maybe send some fail message?
		ev.trigger(payload.data);
	}

};

