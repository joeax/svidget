import { ActionProxy } from "./actionProxy";
import { CommunicatorEventType, WidgetCommunicatorEventType } from "./communication";
import { EventableBase } from "./eventableBase";
import { EventDescProxy } from "./eventDescProxy";
import { Proxy } from './proxy';
import { ParamProxy } from './paramProxy';
import { WidgetActionAddedPayload, WidgetActionInvokedPayload, WidgetActionRemovedPayload, WidgetEventAddedPayload, WidgetEventRemovedPayload, WidgetEventTriggeredPayload, WidgetObjectChangedPayload, WidgetParamAddedPayload, WidgetParamRemovedPayload, WidgetPropertyChangedPayload } from "./payloads";
import { SignalReceiver, SignalSubscriber } from "./communication"
import { ActionParamTransport, ActionTransport, EventDescTransport, ParamTransport, WidgetTransport } from "./transports";
import { Param, ParamEventType, ParamOptions } from "./param";
import { WidgetEvent } from "./widgetEvent";
import { logInfo } from "./logging";
import { removeElementByName } from "./utils";
import { Nameable } from "./types";
import { ActionOptions } from "./action";

export interface ParamObject {
    [key: string]: string | null;
}

/**
 * WidgetReference class
 * Represents a reference to a widget instance, used for proxying metadata and access.
 * @module WidgetReference
 */
export class WidgetReference extends EventableBase {
    private _id: string;
    private _title?: string;
    private _description?: string;
    private _url?: string;
    private _element?: HTMLElement;
    private _declaringElement?: HTMLElement;
    private _enabled: boolean = true;
    private _started: boolean = false;
    private _populated: boolean = false;
    private _connected: boolean = true;
    private _crossDomain: boolean = false;
    private _params: ParamProxy[] = [];
    private _actions: ActionProxy[] = [];
    private _events: EventDescProxy[] = [];
    private _paramValues: ParamObject = {};
    private _subscriber?: string | object;
    private _receiver?: SignalReceiver<WidgetCommunicatorEventType, any>;

    constructor(
        id: string,
        url: string,
        paramValues: ParamObject,
        declaringElement?: HTMLElement,
        element?: HTMLElement,
        connected: boolean = true,
        crossDomain: boolean = false,
        signalSubscriber?: string | object
    ) {
        super();
        this._id = id;
        // this._title = title;
        // this._description = description;
        this._paramValues = paramValues;
        this._connected = connected;
        this._crossDomain = crossDomain;
        this._element = element;
        this._declaringElement = declaringElement;
        this._url = url;
        this._subscriber = signalSubscriber;
        // this.wireSignalReceiver(signalSubscriber);
    }

    // private wireSignalReceiver(signalSubscriber?: SignalSubscriber): void {
    //     signalSubscriber?.(this.receiveSignal.bind(this), this);
    // }

    get id(): string {
        return this._id;
    }

    get title(): string | undefined {
        return this._title;
    }

    get description(): string | undefined {
        return this._description;
    }

    get connected(): boolean {
        return this._connected;
    }

    get crossDomain(): boolean {
        return this._crossDomain;
    }

    get url(): string | undefined {
        return this._url;
    }

    get element(): HTMLElement | undefined {
        return this._element;
    }

    get declaringElement(): HTMLElement | undefined {
        return this._declaringElement;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    get started(): boolean {
        return this._started;
    }

    get populated(): boolean {
        return this._populated;
    }

    get paramValues(): ParamObject {
        return this._paramValues;
    }

    // Collection accessors
    get params(): ParamProxy[] {
        return this._params;
    }

    get actions(): ActionProxy[] {
        return this._actions;
    }

    get events(): EventDescProxy[] {
        return this._events;
    }

    start(widgetTransport: WidgetTransport) {
        this.populate(widgetTransport);
        this._started = true;
    }

    // Selector helpers
    private select<T extends Nameable>(
        col: T[],
        selector: string | number | ((item: T) => boolean)
    ): T[] {
        if (selector == null) return col;
        if (typeof selector === 'number') return [col[selector]];
        if (typeof selector === 'string') return col.filter((item) => item.name === selector);
        if (typeof selector === 'function') return col.filter(selector);
        return col;
    }

    private selectFirst<T extends Nameable>(
        col: T[],
        selector: string | number | ((item: T) => boolean)
    ): T | undefined {
        const arr = this.select(col, selector);
        return arr.length > 0 ? arr[0] : undefined;
    }

    // Param methods
    getParam(name: string): ParamProxy | undefined {
        return this.selectFirst(this._params, name);
    }
    findParam(selector: string): ParamProxy[] {
        return this.select(this._params, selector);
    }

    // Action methods
    getAction(name: string): any {
        return this.selectFirst(this._actions, name);
    }
    findAction(selector: string): ActionProxy[] {
        return this.select(this._actions, selector);
    }

    // Event methods
    getEvent(name: string): any {
        return this.selectFirst(this._events, name);
    }
    findEvent(selector: string): EventDescProxy[] {
        return this.select(this._events, selector);
    }

    // Receivers

    // Returns a callback bound to the private receiveSignal method
    // The subscriber object must match the one used during construction.
    public getSignalReceiver(
        subscriber: string | object
    ): SignalReceiver<WidgetCommunicatorEventType, any> | undefined {
        if (subscriber !== this._subscriber) return;
        if (!this._receiver) {
            this._receiver = this.receiveSignal.bind(this);
        }
        return this._receiver;
    }

    private receiveSignal<TPayload>(signal: WidgetCommunicatorEventType, payload: TPayload): void {
        // This method is called when the underlying object communicates a property change.
        // The implementor should handle the property change accordingly.
        // Handle incoming communication messages
        if (signal === 'paramadded') {
            this.receiveParamAdded(payload as WidgetParamAddedPayload);
        } else if (signal === 'paramremoved') {
            this.receiveParamRemoved(payload as WidgetParamRemovedPayload);
        } else if (signal === 'paramchanged') {
            this.receiveParamChanged(payload as WidgetObjectChangedPayload);
        } else if (signal === 'actionadded') {
            this.receiveActionAdded(payload as WidgetActionAddedPayload);
        } else if (signal === 'actionremoved') {
            this.receiveActionRemoved(payload as WidgetActionRemovedPayload);
        } else if (signal === 'actionchanged') {
            this.receiveActionChanged(payload as WidgetObjectChangedPayload);
        } else if (signal === 'eventadded') {
            this.receiveEventAdded(payload as WidgetEventAddedPayload);
        } else if (signal === 'eventremoved') {
            this.receiveEventRemoved(payload as WidgetEventRemovedPayload);
        } else if (signal === 'eventchanged') {
            this.receiveEventChanged(payload as WidgetObjectChangedPayload);
        } else if (signal === 'paramset') {
            this.receiveParamSet(payload as WidgetObjectChangedPayload);
        } else if (signal === 'actioninvoked') {
            this.receiveActionInvoked(payload as WidgetActionInvokedPayload);
        } else if (signal === 'eventtriggered') {
            this.receiveEventTriggered(payload as WidgetEventTriggeredPayload);
        }
        // maybe throw an error if the signal is not recognized
    }

    private receiveParamAdded(payload: WidgetParamAddedPayload): void {
        // Handle the 'paramadd' signal
        if (!payload || !payload.param || !payload.param.name) return;
        this.addParamProxy(payload.param);
    }

    private receiveParamRemoved(payload: WidgetParamRemovedPayload): void {
        // Handle the 'paramremoved' signal
        if (!payload || !payload.name) return;
        this.removeParamProxy(payload.name);
    }

    private receiveParamChanged(payload: WidgetObjectChangedPayload): void {
        // Handle the 'paramchanged' signal
        if (!payload || !payload.name || !payload.propertyName) return;
        this.updateParamProxy(payload.name, payload.propertyName as keyof ParamOptions, payload.value);
    }

    private receiveParamSet(payload: WidgetParamSetPayload): void {
        // Handle the 'paramset' signal
        if (!payload || !payload.param || !payload.param.name) return;
        this.setParamProxy(payload.param.name, payload.param);
        // from old code:
        // param.notifyValueChange(setPayload.value);
    }

    private receiveActionAdded(payload: WidgetActionAddedPayload): void {
        // Handle the 'actionadded' signal
        if (!payload || !payload.action) return;
        this.addActionProxy(payload.action);
    }

    private receiveActionRemoved(payload: WidgetActionRemovedPayload): void {
        // Handle the 'actionremoved' signal
        if (!payload || !payload.name) return;
        this.removeActionProxy(payload.name);
    }

    private receiveActionChanged(payload: WidgetObjectChangedPayload): void {
        // Handle the 'actionchanged' signal
        if (!payload || !payload.action || !payload.action.name) return;
        this.updateActionProxy(payload.action.name, payload.action);
    }

    private receiveActionInvoked(payload: WidgetActionInvokedPayload): void {
        // Handle the 'actioninvoked' signal
        if (!payload || !payload.action || !payload.action.name) return;
        this.invokeActionProxy(payload.action.name, payload.action);
    }

    private receiveEventAdded(payload: WidgetEventAddedPayload): void {
        // Handle the 'eventadded' signal
        if (!payload || !payload.name) return;
        this.addEventProxy(payload.name, payload);
    }

    private receiveEventRemoved(payload: WidgetEventRemovedPayload): void {
        // Handle the 'eventremoved' signal
        if (!payload || !payload.name) return;
        this.removeEventProxy(payload.name);
    }

    private receiveEventChanged(payload: WidgetObjectChangedPayload): void {
        // Handle the 'eventchanged' signal
        if (!payload || !payload.event || !payload.event.name) return;
        this.updateEventProxy(payload.event.name, payload.event);
    }

    private receiveEventTriggered(payload: WidgetEventTriggeredPayload): void {
        // Handle the 'eventtriggered' signal
        if (!payload || !payload.data) return;
        this.triggerEvent(payload.data);
    }

    // Update functions

    private updateParamProxy(name: string, propertyName: keyof ParamOptions, value: any): void {
        const param = this.getParam(name);
        if (param) {
            this.notifyPropertyChange(param, propertyName, value);
        }
    }

    private updateActionProxy(name: string, propertyName: keyof ActionOptions, value: any): void {
        const action = this.getAction(name);
        if (action) {
            this.notifyPropertyChange(action, propertyName, value);
        }
    }

    private notifyPropertyChange<
        TEventType extends string,
        TOptionsType extends {} = {}
    >(proxy: Proxy<TEventType, TOptionsType>, name: keyof TOptionsType, value: any): void {
        const receiver = proxy.getPropertyChangeReceiver(this._id);
        if (receiver) {
            receiver(name, value);
        }
    }

    // Downstream Object Event Handlers

    // called from ParamProxy
    private handleParamProxyEvent(
        type: ParamEventType,
        event: WidgetEvent,
        target: ParamProxy
    ): void {
        logInfo('page: param proxy bubble: ' + target.name);
        if (type == 'change') this.paramProxyChanged(target, event.value);
        if (type == 'set') this.paramProxyValueChanged(target, event.value);
    }

    // private
    // eventValue ex = { property: "binding", value: bindValue }
    private paramProxyChanged(param: ParamProxy, eventValue: any): void {
        logInfo('page: param proxy change: ' + param.name);
        this.triggerFromWidget('paramchange', eventValue, param);
    }

    // private
    // eventValue ex = { value: "3" }
    private paramProxyValueChanged(param: ParamProxy, eventValue: any): void {
        logInfo('page: param proxy value change: ' + param.name);
        this.triggerFromWidget('paramset', eventValue, param);
    }

    // Populate methods

    private populate(widgetObj: WidgetTransport): void {
        if (this._populated) return;
        this._enabled = widgetObj.enabled;
        this.populateParams(widgetObj.params);
        this.populateActions(widgetObj.actions);
        this.populateEvents(widgetObj.events);
        this._populated = true;
    }

    private populateParams(params: ParamTransport[]): void {
        if (Array.isArray(params)) {
            for (const p of params) {
                const paramProxy = this.addParamProxy(p.name, p.value, p);
                // paramProxy.connect(); // If needed
            }
        }
    }
    private populateActions(actions: ActionTransport[]): void {
        if (Array.isArray(actions)) {
            for (const a of actions) {
                const action = this.addActionProxy(a.name, a);
                this.populateActionParams(a.params, action);
            }
        }
    }
    private populateActionParams(
        actionParams: ActionParamTransport[],
        action: ActionTransport
    ): void {
        if (Array.isArray(actionParams)) {
            for (const ap of actionParams) {
                if (action.params) action.params.push(ap);
            }
        }
    }
    private populateEvents(events: EventDescTransport[]): void {
        if (Array.isArray(events)) {
            for (const e of events) {
                this.addEventProxy(e.name, e);
            }
        }
    }

    // Add/remove param/action/event
    private addParamProxy(paramObj: ParamTransport): any {
        // Minimal implementation, can be expanded
        const { name, value } = paramObj;
        const eventNotifier = this.handleParamProxyEvent.bind(this);
        const param = new ParamProxy(name, value, paramObj, eventNotifier);
        this._params.push(param);
        return param;
    }

    private removeParamProxy(name: string): boolean {
        return removeElementByName(this._params, name);
    }

    private addActionProxy(action: ActionTransport): any {
        const { name } = action;
        const action = new ActionProxy(name, action);
        this._actions.push(action);
        return action;
    }
    private removeActionProxy(name: string): boolean {
        const idx = this._actions.findIndex((a) => a.name === name);
        if (idx === -1) return false;
        this._actions.splice(idx, 1);
        return true;
    }
    private addEventProxy(name: string, options?: any): any {
        const event = { name, ...options };
        this._events.push(event);
        return event;
    }
    private removeEventProxy(name: string): boolean {
        const idx = this._events.findIndex((e) => e.name === name);
        if (idx === -1) return false;
        this._events.splice(idx, 1);
        return true;
    }
}

