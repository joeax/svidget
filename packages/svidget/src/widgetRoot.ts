import { Widget } from './widget';
import { Param, ParamOptionProperties, ParamOptions } from './param';
import { Action, ActionOptionProperties, ActionOptions } from './action';
import { EventDesc, EventDescOptionProperties } from './eventDesc';
import { RootBase } from './rootBase';
import { logInfo } from './logging';
import { DOM } from './dom';
import { fixSVGSizing, getByNameSVG, getSvidgetElement, isValidSvidgetElement, parseQueryString } from './utils';
import {
    Params,
    ParentActionInvokePayload,
    ParentEventTriggerPayload,
    ParentPropertyChangePayload,
    ParentStartPayload,
} from './payloads';
import { Optional } from './types';
import { findFunction, isFunction } from './core';
import { EventableBase } from './eventableBase';
import { ActionParam, ActionParamOptionProperties, ActionParamOptions } from './actionParam';
import { WidgetCommunicator, MessageData } from './widgetCommunicator';

const declaredHandlerName = '_declared';

// Root Events
export const WidgetRootEventTypes = ['load'] as const;
export type WidgetRootEventType = (typeof WidgetRootEventTypes)[number];

/**
 * WidgetRoot class
 * Main controller for the SVG/widget context. Singleton.
 */
export class WidgetRoot extends RootBase<WidgetRootEventType> {
    /** Singleton instance */
    // static current: WidgetRoot | null = null;
    /** The Widget instance for this SVG */
    readonly widget: Widget;
    private _connectedParamValues: Optional<Params>; // used to store query string values before widget starts
    private _communicator?: WidgetCommunicator;

    constructor() {
        super();
        // Set singleton
        this.widget = new Widget();
        this.readyWidget();
    }

    /**
     * Shortcut to the widget instance (for svidget.$)
     */
    get $(): Widget {
        return this.widget;
    }

    /**
     * Shortcut to the widget instance (for svidget.current)
     */
    get current(): Widget {
        return this.widget;
    }

    private readyWidget() {
        logInfo('widget: readyWidget');
        // create communicator
        this.readyCommunicator();
        // start widget
        this.startWidget();
        // notify parent that widget is loaded
        this.markLoaded();
    }

    private readyCommunicator() {
        this._communicator = new WidgetCommunicator(
            this.widget.id,
            this.routeFromParent.bind(this)
        );
        this.widget.setCommunicator(this._communicator);
    }

    private startWidget() {
        // Parse <svidget:params>, <svidget:actions>, <svidget:events>
        this.parseElements();
        // set up widget as either standalone or connected
        if (!this.connected) this.startWidgetStandalone();
        else this.startWidgetConnected();
    }

    private startWidgetStandalone() {
        logInfo('startWidgetStandalone');
        // read values from query string and populate params
        var paramValues = this.getParamValuesFromQueryString() as Params;
        this.setParamValues(paramValues, true);
        this.widget.start();
    }

    private startWidgetConnected() {
        logInfo('startWidgetConnected');
        if (this._connectedParamValues != null) {
            this.setParamValues(this._connectedParamValues);
            // this._connectedParamValues = null; // clear this out, we don't need it anymore
            this.widget.setPopulatedFromPage();
        }
        this.widget.start();
    }

    // Gets the param values from the query string.
    private getParamValuesFromQueryString() {
        var qs = parseQueryString();
        return qs;
    }
    /**
     * Connects the widget to a parent page.
     * @param id - The widget ID.
     * @param paramValues - Optional initial parameter values.
     * @param connected - Whether the widget is connected.
     */
    private routeFromParent(data: MessageData): void {
        const { name, payload } = data;
        logInfo('widget: routeFromParent {name: ' + name + '}');
        if (name == 'start') this.handleReceiveParentStart(payload as ParentStartPayload);
        else if (name == 'actioninvoke')
            this.handleReceiveParentActionInvoke(payload as ParentActionInvokePayload);
        else if (name == 'eventtrigger')
            this.handleReceiveParentEventTrigger(payload as ParentEventTriggerPayload);
        else if (name == 'propertychange')
            this.handleReceiveParentPropertyChange(payload as ParentPropertyChangePayload);
    }

    // SUMMARY
    // Sets the param values for every param using the values from the specified object. This object can be from the query string or parent.
    // Params initialized with a value will be skipped if there is no matching entry in the values object.
    private setParamValues(paramValues: Params, qsMode: boolean = false) {
        // note: can only be called internally
        // loop through all params, if value in paramValues then overwrite, if value not yet populated on param then use default value, otherwise skip
        //var widget = this.current();
        var col = this.widget.params;
        if (col == null) return;
        col.forEach((p) => {
            var key = qsMode ? p.shortName || p.name : p.name;
            var val = paramValues[key]; // query string value present so use it
            if (val === undefined) val = paramValues[p.name]; // 0.3.4: fallback on name if used instead of shortname
            if (val === undefined) val = p.defaultValue; // 0.1.3: query string value not present, so use defvalue
            if (key !== undefined) {
                // value is present in query string or defvalue attr
                p.value = val; // set value
            }
        });
    }

    /** Element Parsing */
    /* Parse Elements as Declared Objects */

    /** Parses <svidget:params>, <svidget:actions>, <svidget:events> elements and populates the widget. */
    private parseElements(): void {
        // parse <title> and set widget title
        const title = getByNameSVG('title');
        if (title && title.length > 0) {
            this.widget.title = DOM.getText(title[0]) ?? '';
        }
        // parse <desc> and set description
        const desc = getByNameSVG('desc');
        if (desc && desc.length > 0) {
            this.widget.description = DOM.getText(desc[0]) ?? '';
        }
        // get <svidget:params> xml element
        const paramsElement = getSvidgetElement('params');
        // populate params
        this.populateParams(paramsElement);
        // get <svidget:actions> xml element
        const actionsElement = getSvidgetElement('actions');
        // populate actions
        this.populateActions(actionsElement);
        // get <svidget:events> xml element
        const eventsElement = getSvidgetElement('events');
        // populate events
        this.populateEvents(eventsElement);
    }

    // Populates Params into the widget based on the <svidget:params> element
    private populateParams(xele: Element | null): void {
        if (xele == null) return; // param element missing
        const widget = this.current;
        this.populateElementObjects(xele, (nextEle, widget) => {
            const param = this.buildParam(nextEle, widget);
            if (param != null) widget.addParam(param);
        });
        // wire declared add/remove handlers if needed
        this.wireDeclaredHandler(widget, widget.onParamAdd, DOM.attrValue(xele, 'onadd'));
        this.wireDeclaredHandler(widget, widget.onParamRemove, DOM.attrValue(xele, 'onremove'));
    }

    private buildParam(xele: Element, widget: Widget): Param | null {
        if (!isValidSvidgetElement(xele, 'param')) return null;
        const name = DOM.attrValue(xele, 'name');
        if (name == null) return null; // don't allow a param without a name
        const value = DOM.attrValue(xele, 'value');
        const options = this.buildOptions<ParamOptions>(xele, ParamOptionProperties);
        const param = widget.newParam(name, value, options);
        // wire declared change/set handlers if needed
        this.wireDeclaredHandler(param, param.onChange, DOM.attrValue(xele, 'onchange'));
        this.wireDeclaredHandler(param, param.onSet, DOM.attrValue(xele, 'onset'));
        return param;
    }

    private populateActions(xele: Element | null): void {
        if (xele == null) return; // action element missing
        const widget = this.current;
        this.populateElementObjects(xele, (nextEle, widget) => {
            const action = this.buildAction(nextEle, widget);
            if (action != null) {
                widget.addAction(action);
                this.populateActionParams(nextEle, action);
            }
        });
        // wire declared add/remove handlers
        this.wireDeclaredHandler(widget, widget.onActionAdd, DOM.attrValue(xele, 'onadd'));
        this.wireDeclaredHandler(widget, widget.onActionRemove, DOM.attrValue(xele, 'onremove'));
    }

    // Populates action params into the action
    private populateActionParams(actionEle: Element, action: Action): void {
        if (actionEle == null) return;
        this.populateElementObjects(actionEle, (nextEle) => {
            const param = this.buildActionParam(nextEle, action);
            if (param != null) action.addParam(param);
        });
    }

    private buildAction(xele: Element, widget: Widget): Action | null {
        if (!isValidSvidgetElement(xele, 'action')) return null;
        const name = DOM.attrValue(xele, 'name');
        if (name == null) return null;
        const options = this.buildOptions<ActionOptions>(xele, ActionOptionProperties);
        const action = widget.newAction(name, options);
        // wire declared action handlers
        this.wireDeclaredHandler(action, widget.onActionChange, DOM.attrValue(xele, 'onchange'));
        this.wireDeclaredHandler(action, widget.onActionInvoke, DOM.attrValue(xele, 'oninvoke'));
        this.wireDeclaredHandler(
            action,
            widget.onActionParamAdd,
            DOM.attrValue(xele, 'onparamadd')
        );
        this.wireDeclaredHandler(
            action,
            widget.onActionParamRemove,
            DOM.attrValue(xele, 'onparamremove')
        );
        this.wireDeclaredHandler(
            action,
            widget.onActionParamChange,
            DOM.attrValue(xele, 'onparamchange')
        );
        return action;
    }

    private buildActionParam(xele: Element, action: Action): ActionParam | null {
        if (!isValidSvidgetElement(xele, 'actionparam')) return null;
        const name = DOM.attrValue(xele, 'name');
        if (name == null) return null;
        const options = this.buildOptions<ActionParamOptions>(xele, ActionParamOptionProperties); // Use ActionParam.optionProperties if available
        const param = action.newParam(name, options);
        // wire declared change handler
        this.wireDeclaredHandler(param, param.onChange, DOM.attrValue(xele, 'onchange'));
        return param;
    }

    // Populates Events into the widget based on the <svidget:events> element
    private populateEvents(xele: Element | null): void {
        if (xele == null) return; // event element missing
        const widget = this.current;
        this.populateElementObjects(xele, (nextEle, widget) => {
            const ev = this.buildEvent(nextEle, widget);
            if (ev != null) widget.addEvent(ev);
        });
        // 0.1.3: wire declared add/remove handlers
        this.wireDeclaredHandler(widget, widget.onEventAdd, DOM.attrValue(xele, 'onadd'));
        this.wireDeclaredHandler(widget, widget.onEventRemove, DOM.attrValue(xele, 'onremove'));
    }

    private buildEvent(xele: Element, widget: Widget): EventDesc | null {
        if (!isValidSvidgetElement(xele, 'event')) return null;
        const name = DOM.attrValue(xele, 'name');
        if (name == null) return null;
        const options = this.buildOptions(xele, EventDescOptionProperties);
        const ev = widget.newEvent(name, options);
        // wire declared change/trigger handlers
        this.wireDeclaredHandler(ev, ev.onChange, DOM.attrValue(xele, 'onchange'));
        this.wireDeclaredHandler(ev, ev.onTrigger, DOM.attrValue(xele, 'ontrigger'));

        return ev;
    }

    private populateElementObjects(
        xele: Element | null,
        eachAction: (nextEle: Element, widget: Widget) => void
    ): void {
        if (xele == null || !xele.children) return;
        const widget = this.current;
        let nextEle = xele.firstElementChild as Element | null;
        while (nextEle != null) {
            if (eachAction) eachAction(nextEle, widget);
            nextEle = nextEle.nextElementSibling as Element | null;
        }
    }

    private buildOptions<TOptions extends Record<string, any>>(
        xele: Element,
        optionProps?: string[]
    ): TOptions {
        const options: TOptions = {} as TOptions;
        if (!optionProps || !Array.isArray(optionProps)) return options;
        for (let i = 0; i < optionProps.length; i++) {
            const optName = optionProps[i];
            const optVal = DOM.attrValue(xele, optName);
            if (optVal != null) (options as Record<string, any>)[optName] = optVal;
        }
        return options;
    }

    /**
     * Wires a handler declared on the XML element directly to an object based on the function string.
     * Looks for the function name in global scope.
     * Example: <svidget:action name="myAction" oninvoke="myInvokeHandler" />, "myInvokeHandler" is declared event handler
     * @param obj - The object containing the "on" event handler
     * @param onEventFunc - The "on" event handler function
     * @param funcStr - The function name as a string to find in global scope
     */
    private wireDeclaredHandler<TEventType extends string>(
        obj: EventableBase<TEventType>,
        onEventFunc: Function | null,
        funcStr: string
    ) {
        if (onEventFunc == null) return;
        var func = findFunction(funcStr);
        if (func == null || !isFunction(func)) return;
        onEventFunc.call(obj, func, declaredHandlerName);
        // removed "declared" handlers and just invoke directly
        // ondeclaredparamadd: function (handler) {
        //     return this.onparamadd(null, declaredHandlerName, handler);
        // }
    }

    /* Signal Handlers */

    // payload == { id: widgetRef.id(), params: paramValues };
    private handleReceiveParentStart(payload: ParentStartPayload) {
        payload = payload ?? {};
        // wire up data from parent
        var connected = payload.connected !== false;
        this.connectWidget(payload.id, payload.params, connected); // we default to connected, so if undefined then true
        // tell the parent that we got the start signal -  before we set anything on widget from parent
        if (connected) this._communicator?.signalStartAck(this.widget.serialize());
        // if widget already started, update param values with ones passed from page
        this.startWidgetWithPageParams();
    }

    private handleReceiveParentPropertyChange(payload: ParentPropertyChangePayload) {
        payload = payload || {};
        var objType = payload.type;
        // only support param.value for now
        if (payload.type == 'param' && payload.propertyName == 'value' && payload.name != null) {
            var param = this.widget.getParam(payload.name);
            if (param != null) {
                param.value(payload.value);
            }
        }
    }

    // payload == { action: actionProxy.name(), args: argList }
    private handleReceiveParentActionInvoke(payload: ParentActionInvokePayload) {
        payload = payload || {};
        var actionName = payload.action;
        var action = this.widget.getAction(actionName);
        if (action == null || !action.external) return; // todo: maybe send some fail message?
        action.invoke(payload.args);
    }

    private handleReceiveParentEventTrigger(payload: ParentEventTriggerPayload) {
        payload = payload || {};
        var eventName = payload.event;
        var ev = this.widget.getEvent(eventName);
        if (ev == null || !ev.external) return; // todo: maybe send some fail message?
        ev.dispatch(payload.data);
    }

    // Called by parent (via global object) to signal that is has established its relationship with the parent page.
    // Params:
    //   id: the ID assigned to this widget
    //   paramValues: the param values as they were declared on the page, or provided if widget declared programmatically
    //   connected: whether the widget is connected to its parent, if false it will remain in standalone mode and cease any further communication with the parent
    // Remarks:
    //   start() may be called at any point during the DOM lifecycle for this widget, i.e. while DOM is still parsing or when completed
    private connectWidget(id: string, paramValues: Params | undefined, connected: boolean) {
        var widget = this.widget;
        if (widget.connected) return;
        // connect, setting id
        if (connected) {
            logInfo('widget: connect {id: ' + id + '}');
            widget.connect(id);
            this._connected = true;
        } else {
            logInfo('widget: standalone {id: ' + id + '}');
        }

        this._connectedParamValues = paramValues ?? {};
        fixSVGSizing();
        /* if ready() was called first, widget in standalone mode, so switch to connected mode
		//if (!widget.connected()) this.connect();
		//this.startConnected(); */
    }

    private startWidgetWithPageParams() {
        //Svidget.log("startWidgetWithPageParams");
        var widget = this.widget;
        if (widget.started) {
            this.setParamValues(this._connectedParamValues!);
            widget.setPopulatedFromPage();
        }
    }
}
