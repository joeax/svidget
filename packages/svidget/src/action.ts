import { ActionParam, ActionParamEventType, ActionParamOptions } from './actionParam';
import { select, selectFirst } from './collections';
import { toBool, toString } from './conversion';
import { resolveBinding } from './core';
import { EventableBase, EventHandler } from './eventableBase';
import { ActionTransport, ActionParamTransport } from './transports';
import { Binding, Optional } from './types';
import { WidgetEvent } from './widgetEvent';

/**
 * ActionOptions interface
 * Represents the attributes on the <svidget:action> element.
 * @module Action
 */
export interface ActionOptions {
    external?: boolean;
    binding?: Binding;
    enabled?: boolean;
    description?: string;
}

export const ActionOptionProperties = ['external', 'binding', 'enabled', 'description'];

// Action Events
export const ActionEventTypes = [
  "invoke",
  "change",
  "paramchange",
  "paramadd",
  "paramremove",
] as const;
export type ActionEventType = (typeof ActionEventTypes)[number];

export type ActionEventNotifier = (type: ActionEventType, event: WidgetEvent, target: Action) => void;

/**
 * Action class
 * Represents an action that can be invoked on a widget.
 * @module action
 */
export class Action extends EventableBase<ActionEventType> {
    /** Name of the action (immutable) */
    readonly name: string;
    /** Description of the action */
    private _description: Optional<string>;
    /** Array of parameters for the action */
    private _params: ActionParam[] = [];
    /** Handler function to execute when the action is invoked */
    // private _handler: (...args: any[]) => any;
    /** Whether the action is enabled */
    private _enabled: boolean = true;
    /** Whether the action is external facing */
    private _external: boolean = true;
    /** Binding (function or string) */
    private _binding: Optional<string | Function> = undefined;
    private _bindingFunc: Optional<Function> = undefined;
    private _eventNotifier: Optional<ActionEventNotifier>;

    /**
     * Constructs an Action instance.
     * @param name Name of the action
     * @param description Description of the action
     * @param params Array of parameters for the action
     * @param handler Function to execute when the action is invoked
     */
    constructor(
        name: string,
        options: ActionOptions,
        eventNotifier?: ActionEventNotifier
        // description: string = "",
        // params: ActionParam[] = [],
        // handler: (...args: any[]) => any = () => {},
        // enabled: boolean = true,
        // external: boolean = true,
        // binding: string | Function | null = null
    ) {
        super();
        this.name = name;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
    }

    private setOptionProperties(options: ActionOptions): void {
        this._description = toString(options.description);
        this._enabled = options.enabled != null ? toBool(options.enabled) : true;
        this._binding = resolveBinding(options.binding);
        this._external = options.external != null ? toBool(options.external) : true;
    }

    private registerEventNotifier(eventNotifier?: ActionEventNotifier) {
        this._eventNotifier = eventNotifier;
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ActionEventTypes), eventNotifier);
        }
    }

    get attached(): boolean {
        return !!this._eventNotifier;
    }

    /** Gets or sets the description. Triggers change event on set. */
    get description(): Optional<string> {
        return this._description;
    }
    set description(val: Optional<string>) {
        if (this._description !== val) {
            this._description = val;
            this.trigger('change', { property: 'description', value: val });
        }
    }

    /** Gets or sets whether the action is enabled. Triggers change event on set. */
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(val: boolean) {
        if (this._enabled !== val) {
            this._enabled = val;
            this.trigger('change', { property: 'enabled', value: val });
        }
    }

    /** Gets or sets whether the action is external. Triggers change event on set. */
    get external(): boolean {
        return this._external;
    }
    set external(val: boolean) {
        if (this._external !== val) {
            this._external = val;
            this.trigger('change', { property: 'external', value: val });
        }
    }

    /** Gets or sets the binding (function or string). Triggers change event on set. */
    get binding(): Optional<string | Function> {
        return this._binding;
    }
    set binding(val: Optional<string | Function>) {
        if (this._binding !== val) {
            this._binding = val;
            this.trigger('change', { property: 'binding', value: val });
        }
    }

    /** Params **/
    get params(): ActionParam[] {
        return this._params;
    }

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
        selector: number | string | ((param: ActionParam) => boolean)
    ): ActionParam | undefined {
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
        selector: number | string | ((param: ActionParam) => boolean)
    ): ActionParam | undefined {
        var col = this._params;
        var item = selectFirst(col, selector);
        return item;
    }

    newParam(name: string, options: ActionParamOptions): ActionParam {
        const param = new ActionParam(name, this.name, options, this.paramBubbleHandler.bind(this));
        return param;
    }

    /**
     * Adds a parameter to the action.
     */
    addParam(param: ActionParam): boolean {
        if (this.params.some((p) => p.name === param.name)) return false;
        this.params.push(param);
        this.trigger('paramadd', param);
        return true;
    }

    /** Removes a parameter by name. */
    removeParam(name: string): boolean {
        const idx = this.params.findIndex((p) => p.name === name);
        if (idx === -1) return false;
        const [removed] = this.params.splice(idx, 1);
        this.trigger('paramremove', removed.name);
        return true;
    }

    /** Clears all parameters. */
    clearParams(): void {
        this._params = [];
        this.trigger('change', { property: 'params', value: [] });
    }

    // internal
    // called from param to bubble event
    private paramBubbleHandler(type: ActionParamEventType, event: WidgetEvent, param: ActionParam): void {
        if (type === 'change') this.triggerActionParamChanged(param, event.value);
    }

    private triggerActionParamChanged(param: ActionParam, value: any): void {
        this.trigger('paramchange', value, param);
    }

    /**
     * Invokes the action binding function or handler with provided arguments, triggers 'invoke' event.
     * Uses default values for missing args.
     * @param args Arguments to pass to the handler
     */
    invoke(...args: any[]): any {
        // call invoke in the context of this action
        this.invokeInternal.apply(this, args);
    }

    private invokeInternal(...args: any[]): any {
        if (!this.enabled) return false;
        const func = this.invocableBindingFunc();
        if (!func) return false;
        const argArray = this.buildArgumentArray(args);
        const result = func.apply(null, argArray);
        this.trigger('invoke', { returnValue: result });
        return result;
    }

    /**
     * Returns the function to invoke (bindingFunc or handler).
     */
    invocableBindingFunc(): Function | null {
        if (this._bindingFunc && typeof this._bindingFunc === 'function') return this._bindingFunc;
        if (typeof this._binding === 'function') return this._binding;
        return null;
    }

    /**
     * Builds an array of arguments to use in invoke() based on the action params and provided args.
     * Uses default values for missing args.
     */
    buildArgumentArray(args: any[]): any[] {
        const argsArray: any[] = [];
        const col = this.params;
        for (let i = 0; i < col.length; i++) {
            const p = col[i];
            let arg = undefined;
            if (i < args.length) arg = args[i];
            if (arg === undefined && typeof p.defaultValue !== 'undefined') arg = p.defaultValue;
            argsArray.push(arg);
        }
        return argsArray;
    }

    /* Events */

    // --- Event Registration Shortcuts ---
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

    // --- Serialization ---
    serialize(): ActionTransport {
        return {
            name: this.name,
            description: this.description ?? '',
            external: this.external,
            enabled: this.enabled,
            params: this.params.map((p) => p.serialize()),
        };
    }

    toString(): string {
        return `[Action name="${this.name}"]`;
    }
}
