import { convertTo, toBool, toString } from './conversion';
import { WidgetEvent } from './widgetEvent';
import { ParamType, ParamSubType, Optional } from './types';
import { ParamBase, ParamBaseOptions } from './paramBase';
import { EventHandler } from './eventableBase';
import { findFunction, isFunction } from './core';
import { DOM } from './dom';

export interface ParamTransport {
    name: string;
    type?: ParamType;
    value: any;
    enabled?: boolean;
    shortName?: Optional<string>;
    coerce?: boolean;
    group?: Optional<string>;
    defaultValue?: any;
    description?: Optional<string>;
    subType?: ParamSubType;
    typeData?: Optional<string>;
}

export type SanitizerFunc = (val: any) => any;;

export interface ParamOptions extends ParamBaseOptions {
    value?: any;
    enabled?: boolean;
    shortName?: string;
    coerce?: boolean;
    group?: string;
    binding?: string;
    sanitizer?: SanitizerFunc | string;
}

export const ParamOptionProperties = [
    'type',
    'subType',
    'typeData',
    'description',
    'defaultValue',
    'enabled',
    'shortName',
    'coerce',
    'group',
    'sanitizer',
];

// Param Events
export const ParamEventTypes = ["change", "set"] as const;
export type ParamEventType = (typeof ParamEventTypes)[number];

export type ParamEventNotifier = (type: ParamEventType, event: WidgetEvent, target: Param) => void;



/**
 * Param class
 * Represents a parameter of a widget.
 * DO NOT CREATE DIRECTLY, use Widget.newParam() instead.
 * @module param
 */

export class Param extends ParamBase<ParamEventType, ParamOptions> {
    private _value: any;
    private _enabled: boolean = true;
    private _shortName?: Optional<string>;
    private _coerce?: boolean;
    private _group?: Optional<string>;
    private _binding?: Optional<string>;
    private _sanitizer?: Optional<SanitizerFunc | string>;
    private _eventNotifier: ParamEventNotifier | undefined;

    constructor(name: string, value: any, options: ParamOptions, eventNotifier?: ParamEventNotifier) {
        super(name, options);
        this._shortName = toString(options.shortName);
        this._coerce = toBool(options.coerce); // default is false
        this._group = toString(options.group);
        // todo: confirm that defaultValue used when value not provided (in page declaration)
        this._value = this._coerce ? convertTo(value, this.type, this.subType, this.typeData) : value;
        this._sanitizer = (!isFunction(options.sanitizer) ? toString(options.sanitizer) : options.sanitizer) || null;
        this._enabled = options.enabled != null ? toBool(options.enabled) : true;
        this._binding = toString(options.binding);
        this.registerEventNotifier(eventNotifier);
    }

    private registerEventNotifier(eventNotifier: ParamEventNotifier | undefined) {
        this._eventNotifier = eventNotifier;
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ParamEventTypes), eventNotifier);
        }
    }

    get attached(): boolean {
        return !!this._eventNotifier;
    }

    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(val: boolean) {
        if (this._enabled !== val) {
            this._enabled = val;
            this.trigger('change', { property: 'enabled', value: val });
        }
    }

    /**
     * Value of the parameter
     */
    get value(): any {
        return this._value;
    }
    set value(val: any) {
        if (this.enabled === false) return;
        let finalVal = val;
        if (this.coerce) {
            finalVal = this.coerceValue(finalVal);
        }
        finalVal = this.applySanitizer(finalVal);
        this._value = finalVal;
        this.applyBinding(finalVal);
        this.triggerChange('value', finalVal);
        // this.trigger('valuechange', { value: finalVal }); // legacy event DEPRECATED
        this.trigger('set', { value: finalVal });
    }

    /**
     * Gets or sets the short name for the parameter (used for query string param).
     */
    get shortName(): Optional<string> {
        return this._shortName;
    }
    set shortName(val: Optional<string>) {
        if (this._shortName !== val) {
            this._shortName = val;
            this.trigger('change', { property: 'shortName', value: val });
        }
    }

    get binding(): Optional<string> {
        return this._binding;
    }
    set binding(val: Optional<string>) {
        if (this._binding !== val) {
            this._binding = val;
            this.trigger('change', { property: 'binding', value: val });
        }
    }

    /**
     * Gets or sets whether to coerce the value to the specified type.
     */
    get coerce(): boolean | undefined {
        return this._coerce;
    }
    set coerce(val: boolean | undefined) {
        if (this._coerce !== val) {
            this._coerce = val;
            this.trigger('change', { property: 'coerce', value: val });
        }
    }

    /**
     * Gets or sets the group name for organizing parameters.
     */
    get group(): Optional<string> {
        return this._group;
    }
    set group(val: Optional<string>) {
        if (this._group !== val) {
            this._group = val;
            this.trigger('change', { property: 'group', value: val });
        }
    }

    /**
     * Gets or sets the sanitizer function or name.
     */
    get sanitizer(): Optional<SanitizerFunc | string> {
        return this._sanitizer;
    }
    set sanitizer(val: Optional<SanitizerFunc | string>) {
        if (this._sanitizer !== val) {
            this._sanitizer = val;
            this.trigger('change', { property: 'sanitizer', value: val });
        }
    }

    // --- Event Registration Shortcuts ---
    onChange(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('change', handler, name, data);
    }
    offChange(handler: EventHandler, name?: string): boolean {
        return this.off('change', handler, name);
    }
    onSet(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('set', handler, name, data);
    }
    offSet(handler: EventHandler, name?: string): boolean {
        return this.off('set', handler, name);
    }

    /**
     * Gets the serialized param value.
     */
    get serializedValue(): string {
        return String(this.value);
    }

    /**
     * Applies sanitizer function if present.
     */
    applySanitizer(val: any): any {
        const func = this.sanitizerFunc();
        if (!func) return val;
        const returnVal = func.call(null, this, val);
        return returnVal === undefined ? val : returnVal;
    }

    /**
     * Returns the sanitizer function if set, or tries to resolve it if a string is provided.
     */
    sanitizerFunc(): Optional<Function> {
        // if (typeof this.sanitizer === 'function') return this.sanitizer as (param: Param, val: any) => any;
        // return undefined;
        if (!this.sanitizer) return undefined;
        var func = findFunction(this.sanitizer);
        return func;
    }

    /**
     * Coerces the value to the param's type/subtype if needed.
     */
    coerceValue(val: any): any {
        return convertTo(val, this.type, this.subType, this.typeData);
    }

    /**
     * Applies the value to the binding target if binding is set.
     */
    applyBinding(val: any): void {
        if (this.binding == null) return;
        const bindingQuery = DOM.select(this.binding);
        if (bindingQuery == null) return;
        bindingQuery.setValue(val);
    }

    /**
     * Serializes the Param object for transport across a window boundary.
     */
    serialize(): ParamTransport {
        return {
            name: this.name,
            shortName: this.shortName,
            enabled: this.enabled,
            type: this.type,
            subType: this.subType,
            typeData: this.typeData,
            coerce: this.coerce,
            defaultValue: this.defaultValue,
            value: this.value,
            group: this.group,
            description: this.description ?? undefined,
        };
    }

    /**
     * Gets a string representation of this object.
     */
    toString(): string {
        return `[Param { name: "${this.name}" }]`;
    }
}
