import { ActionEventNotifier, ActionEventType, ActionOptions, ActionEventTypes } from './action';
import { ActionParam, ActionParamEventType, ActionParamOptions } from './actionParam';
import { ActionParamProxy } from './actionParamProxy';
import { select, selectFirst } from './collections';
import { toBool } from './conversion';
import { EventHandler } from './eventableBase';
import {
    WidgetActionInvokedPayload,
    WidgetActionParamAddedPayload,
    WidgetActionParamRemovedPayload,
    WidgetPropertyChangePayload,
} from './payloads';
import { Proxy, SignalSubscriber } from './proxy';
import { ParamSubType, ParamType } from './types';
import { WidgetEvent } from './widgetEvent';

export type ActionProxyInvokeCallback = (action: ActionProxy, args: any[]) => void;

export interface NewActionParam {
    name: string;
    type?: ParamType;
    subType?: ParamSubType;
    typeData?: string;
    description?: string;
    defaultValue?: any;
}

/**
 * ActionProxy class
 * Proxy for widget action in the web context.
 * @module ActionProxy
 */
export class ActionProxy extends Proxy<ActionEventType, ActionOptions> {
    // Private fields for action properties
    private _name: string;
    private _external?: boolean;
    private _enabled?: boolean;
    private _description?: string;
    private _params: ActionParamProxy[] = [];
    private _invokeCallback: ActionProxyInvokeCallback | undefined;

    constructor(
        name: string,
        options: ActionOptions,
        eventNotifier?: ActionEventNotifier,
        invokeCallback?: ActionProxyInvokeCallback,
        signalSubscriber?: SignalSubscriber
    ) {
        super(signalSubscriber);
        this._name = name;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
        this._invokeCallback = invokeCallback;
    }

    private setOptionProperties(options: ActionOptions): void {
        this._external = options.external;
        this._enabled = toBool(options.enabled);
        this._description = options.description;
    }

    private registerEventNotifier(eventNotifier: ActionEventNotifier | undefined) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ActionEventTypes), eventNotifier);
        }
    }

    // Get accessors
    get name(): string {
        return this._name;
    }
    get external(): boolean | undefined {
        return this._external;
    }
    get enabled(): boolean | undefined {
        return this._enabled;
    }
    get description(): string | undefined {
        return this._description;
    }
    /** Params **/
    get params(): ActionParamProxy[] {
        return this._params;
    }

    // Action Params handling

    /**
     * Gets a collection of all ActionParam objects, or a sub-collection based on the selector.
     * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
     * Examples:
     * getParams(0)
     * getParams("color")
     * @method
     * @param {(string|number|function)} [selector] - The param name, index, or search function (with signature function (param) returns boolean).
     * @returns {Svidget.Collection} - A collection based on the selector, or the entire collection.
     */
    getParams(
        selector: number | string | ((param: ActionParamProxy) => boolean)
    ): ActionParamProxy | undefined {
        var col = this._params;
        return select(col, selector);
    }

    /**
     * Gets the ActionParam based on the selector.
     * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
     * Examples:
     * getParam(0)
     * getParam("color")
     * @method
     * @param {(string|number|function)} selector - The param name, index, or search function (with signature function (param) returns boolean).
     * @returns {Svidget.ActionParam} - The ActionParam based on the selector. If selector is invalid, null is returned.
     */
    getParam(
        selector: number | string | ((param: ActionParamProxy) => boolean)
    ): ActionParamProxy | undefined {
        var col = this._params;
        var item = selectFirst(col, selector);
        return item;
    }

    private newParam(name: string, options: ActionParamOptions): ActionParamProxy {
        const param = new ActionParamProxy(
            name,
            this.name,
            options,
            this.paramBubbleHandler.bind(this)
        );
        return param;
    }

    // internal
    // called from param to bubble event
    private paramBubbleHandler(
        type: ActionParamEventType,
        event: WidgetEvent,
        param: ActionParam
    ): void {
        if (type === 'change') this.trigger('paramchange', event.value, param);
    }

    // Invocation handling

    /**
     * Invokes the action. The params passes in will be passed to the action params in order.
     * @method
     * @param {...object} args - The arguments that correspond to action params.
     * @returns {boolean} - True if invoke succeeds.
     */
    invoke(...args: any[]): boolean {
        // build args obj from arguments
        if (!this.canInvoke()) return false;
        this._invokeCallback?.(this, args);
        return true;
    }

    canInvoke(): boolean {
        return this._external ?? true;
    }

    // Event registration shortcuts
    onInvoke(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('invoke', handler, name, data);
    }
    offInvoke(handler: EventHandler, name?: string): boolean {
        return this.off('invoke', handler, name);
    }
    onChange(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('change', handler, name, data);
    }
    offChange(handler: EventHandler, name?: string): boolean {
        return this.off('change', handler, name);
    }
    onParamChange(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('paramchange', handler, name, data);
    }
    offParamChange(handler: EventHandler, name?: string): boolean {
        return this.off('paramchange', handler, name);
    }
    onParamAdd(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('paramadd', handler, name, data);
    }
    offParamAdd(handler: EventHandler, name?: string): boolean {
        return this.off('paramadd', handler, name);
    }
    onParamRemove(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('paramremove', handler, name, data);
    }
    offParamRemove(handler: EventHandler, name?: string): boolean {
        return this.off('paramremove', handler, name);
    }

    // --- Send/receive Handling ---

    protected receiveSignal<TPayload>(signal: string, payload: TPayload): void {
        // Handle incoming communication messages
        if (signal === 'change') {
            const { propertyName, value } = payload as WidgetPropertyChangePayload;
            this.receivePropertyChange(propertyName as keyof ActionOptions, value);
        } else if (signal === 'actioninvoked') {
            const { returnValue } = payload as WidgetActionInvokedPayload;
            this.receiveInvoke(returnValue);
        } else if (signal === 'paramadded') {
            const { param } = payload as WidgetActionParamAddedPayload;
            this.receiveParamAdd(param);
        } else if (signal === 'paramremoved') {
            const { name } = payload as WidgetActionParamRemovedPayload;
            this.receiveParamRemove(name);
        } else {
            super.receiveSignal(signal, payload);
        }
    }

    protected receivePropertyChange(name: keyof ActionOptions, value: any): void {
        if (this.handlePropertyChange(name, value)) {
            this.trigger('change', { property: name, value: value });
        }
    }

    private receiveInvoke(returnVal: any): void {
        this.trigger('invoke', { returnValue: returnVal });
    }

    private receiveParamAdd(param: NewActionParam): void {
        if (this.handleAddParam(param)) {
            this.trigger('paramadd', param);
        }
    }

    private receiveParamRemove(name: string): void {
        if (this.handleRemoveParam(name)) {
            this.trigger('paramremove', name);
        }
    }

    // Property change handling
    private handlePropertyChange(name: keyof ActionOptions, value: any): boolean {
        const fieldMap: Record<keyof ActionOptions, string> = {
            external: '_external',
            enabled: '_enabled',
            description: '_description',
            binding: '',
        };
        const field = fieldMap[name];
        if (field) {
            (this as any)[field] = value;
            return true;
        }
        return false;
    }

    /**
     * Adds a parameter to the action.
     */
    private handleAddParam(param: NewActionParam): boolean {
        if (this.getParam(param.name)) return false;
        const newParam = this.newParam(param.name, param);
        this.params.push(newParam);
        return true;
    }

    /** Removes a parameter by name. */
    private handleRemoveParam(name: string): boolean {
        if (!this.getParam(name)) return false;
        const idx = this.params.findIndex((p) => p.name === name);
        if (idx === -1) return false;
        this.params.splice(idx, 1);
        return true;
    }

    /**
     * Gets a string representation of this object.
     * @method
     * @returns {string}
     */
    toString() {
        return '[ActionProxy { name: "' + this.name + '" }]';
    }
}
