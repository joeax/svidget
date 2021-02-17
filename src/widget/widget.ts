/*****************************************
svidget.widget.js

Contains the core framework elements.

******************************************/

namespace Svidget {

    const INITIAL_PROPS: WidgetProps = {
        enabled: true,
        connected: false,
        started: false
    };

    /**
     * Represents the widget on an HTML page.
     * @class
     * @mixes Svidget.ObjectPrototype
     * @augments Svidget.EventPrototype
     * @memberof Svidget
     */
    /*
// note: Widget class should be decoupled from the DOM
*/
    export class Widget extends ObjectBase<WidgetProps, WidgetEventTypes>
    implements WidgetArtifact {
        private readonly _params: ParamCollection;
        private readonly _actions: ParamCollection;
        private readonly _events: ParamCollection;

        constructor() {
            super(INITIAL_PROPS, undefined, "Svidget.Widget");

            this._params = new Svidget.ParamCollection([], this);
            this._actions = new Svidget.ActionCollection([], this);
            this._events = new Svidget.EventDescCollection([], this);
            this.populatedFromPage = false;
            this.id = null; // provided by parent
            this.page = null; // todo: get a reference to an object containing details about the page (determine if we need)
            this.parentElement = null; // todo: gets a DomItem describing the parent element <object> or <iframe>
  
            // wire events for params add/remove and bubbles
            this.wireCollectionAddRemoveHandlers(privates.params, this.paramAdded, this.paramRemoved);
        
            // wire events for actions add/remove and bubbles
            this.wireCollectionAddRemoveHandlers(privates.actions, this.actionAdded, this.actionRemoved);
        
            // wire events for events add/remove
            this.wireCollectionAddRemoveHandlers(privates.events, this.eventAdded, this.eventRemoved);
        }


        /**
         * Gets or sets whether the param is enabled.
         */
        set enabled(input: boolean) {
            const val = this.getset("enabled", input, "boolean");
            // fire "changed" event
            this.triggerChange("enabled", val);
        }

        /**
	 * Gets whether the widget has had his params populated from the page. 
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {boolean} - Whether the widget had his params populated from the page.
	*/
	get populatedFromPage: boolean {
		return this.getset<boolean>("populatedFromPage");
	}
	
	// REGION
	// Public Methods
	
	start(): void {
		// if DOM not ready then readyConnected(0 will be called when ready()
		//if (this.loaded) this.readyConnected();
		this.getset("started", true);
	}

	connect(id: string): void {
		// if DOM not ready then readyConnected(0 will be called when ready()
		//if (this.loaded) this.readyConnected();
		if (this.connected) return;
		this.getset("id", id);
		this.getset("connected", true);
	}

	setPopulatedFromPage() {
		this.getset("populatedFromPage", true);
		this.trigger("pagepopulate", this);
	}

	// REGION: Parent

	// internal
	// called from the root to signal that the parent element has changed, so we update there
	updateParentElement(item): void {
        // todo: implement?
	}


	// REGION: Params

	/**
	 * Gets a collection of all Param objects in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * params(0)
	 * params("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} [selector] - The param name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.ParamCollection} - A collection based on the selector, or the entire collection.
	*/
	params(selector: string): Collection<Param> {
		return this._params.select(selector);
	}

	/**
	 * Gets the Param based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * param(0)
	 * param("color")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} [selector] - The param name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.Param} - The Param based on the selector. If selector is invalid, null is returned.
	*/
	param(selector: string): Param {
		var item = this._params.selectFirst(selector);
		return item;
	}

	// internal
	// called from param
	paramBubble(type, event, param) {
		if (type == "change") this.paramChanged(param, event.value);
		if (type == "valuechange" || type == "set") this.paramSet(param, event.value);
	}

	// private
	// eventValue ex = { property: "binding", value: bindValue }
	paramChanged(param, eventValue) {
		this.trigger("paramchange", eventValue, param);
		// signal parent
		Svidget.root.signalParamChanged(param, eventValue);
	}

	// private
	// eventValue ex = { value: "3" }
	paramSet(param, eventValue) {
		this.trigger("paramset", eventValue, param);
		this.trigger("paramvaluechange", eventValue, param);
		// signal parent
		Svidget.root.signalParamSet(param, eventValue);
	}

	// REGION: Actions

	/**
	 * Gets a collection of all actions in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * actions(0)
	 * actions("doSomething")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} [selector] - The action name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.ActionCollection} - A collection based on the selector, or the entire collection.
	*/
	actions(selector) {
		var col = this.getset("actions");
		return this.select(col, selector);
	}

	/**
	 * Gets the action object based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * action(1)
	 * action("doSomething")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} selector - The action name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.Action} - The action based on the selector. If selector is invalid, null is returned.
	*/
	action(selector) {
		//var item = this.actions(selector).first();
		var col = this.getset("actions");
		var item = this.selectFirst(col, selector);
		return item;
	}

	// private
	// internal, called from action
	actionBubble(type, event, action) {
		if (type == "invoke") this.actionInvoked(action, event.value);
		if (type == "change") this.actionChanged(action, event.value);
		// event.target is actionParam that was changed
		if (type == "paramchange") this.actionParamChanged(action, event.target, event.value);
		// for add/remove, event.value == actionParam added or removed
		if (type == "paramadd") this.actionParamAdded(action, event.value);
		if (type == "paramremove") this.actionParamRemoved(action, event.value);
	}

	// private
	actionInvoked(action, returnData) {
		this.trigger("actioninvoke", returnData, action);
		// signal parent
		Svidget.root.signalActionInvoked(action, returnData);
	}

	// private
	// eventValue ex = { property: "binding", value: bindValue }
	actionChanged(action, eventValue) {
		this.trigger("actionchange", eventValue, action);
		// signal parent
		Svidget.root.signalActionChanged(action, eventValue);
	}

	// private
	actionParamChanged(action, actionParam, eventValue) {
		this.trigger("actionparamchange", eventValue, actionParam);
		// signal parent
		Svidget.root.signalActionParamChanged(actionParam, action, eventValue);
	}

	// private
	actionParamAdded(action, actionParam) {
		this.trigger("actionparamadd", actionParam, action);
		// signal parent
		Svidget.root.signalActionParamAdded(actionParam, action.name());
	}

	// private
	actionParamRemoved(action, actionParamName) {
		this.trigger("actionparamremove", actionParamName, action);
		// signal parent
		Svidget.root.signalActionParamRemoved(actionParamName, action.name());
	}
	

	// REGION: Events 

	/**
	 * Gets a collection of all events in the widget, or a sub-collection based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * events(0)
	 * events("somethingHappened")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} selector - The event name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.EventDescCollection} - A collection based on the selector, or the entire collection.
	*/
	events(selector) {
		var col = this.getset("events");
		return this.select(col, selector);
	}

	/**
	 * Gets the event object based on the selector.
	 * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
	 * Examples:
	 * event(0)
	 * event("somethingHappened")
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @param {(string|number|function)} selector - The event name, index, or search function (with signature function (param) returns boolean).
	 * @returns {Svidget.EventDesc} - The event based on the selector. If selector is invalid, null is returned.
	*/
	event(selector) {
		var col = this.getset("events");
		var item = this.selectFirst(col, selector);
		return item;
	}
	
	// internal, called from eventdesc.EventPrototype
	eventBubble(type, event, eventDesc) {
		if (type == "trigger") this.eventTrigger(eventDesc, event);
		if (type == "change") this.eventChanged(eventDesc, event.value);
	}

	// private
	eventTrigger(eventDesc, event) {
		Svidget.log('widget: event trigger: ' + eventDesc.name());
		this.trigger("eventtrigger", event.value, eventDesc);
		// FYI: event.target == eventDesc
		Svidget.root.signalEventTriggered(event.target, event.value);
	}

	// private
	eventChanged(eventDesc, eventValue) {
		this.trigger("eventchange", eventValue, eventDesc);
		// signal parent
		Svidget.root.signalEventChanged(eventDesc, eventValue);
	}

	// REGION: Misc

	/**
	 * Serializes the Widget object for transport across a window boundary.
	 * @method
	 * @memberof Svidget.Widget.prototype
	 * @returns {boolean} - A generic serialized object representing the Widget.
	*/
	// todo: rename to serialize()
	toTransport(): WidgetTransport {
		var transport = {
			id: this.id,
			enabled: this.enabled,
			params: toCollectionTransport(this.params),
			actions: toCollectionTransport(this.actions),
			events: toCollectionTransport(this.events),
		};
		return transport;
	}



    }
}
