import { WidgetCommunicatorEventType, SignalSubscriber, ParamCommunicatorEventType } from './communication';
import { toBool, toString } from './conversion';
import { EventHandler } from './eventableBase';
import { ParamEventType, ParamEventTypes, ParamOptions } from './param';
import { WidgetObjectChangedPayload } from './payloads';
import { Proxy } from './proxy';
import { WidgetEvent } from './widgetEvent';

export type ParamValueSetNotifier = (value: any, target: ParamProxy) => void;
export type ParamProxyEventNotifier = (type: ParamEventType, event: WidgetEvent, target: ParamProxy) => void;

// export type ParamChangeReceiver = (name: keyof ParamOptions, value: any) => void;
// export type ParamChangeSubscriber = (callback: ParamChangeReceiver) => void;

/**
 * ParamProxy class
 * Proxy for widget param in the web context.
 * @module ParamProxy
 */
export class ParamProxy extends Proxy<ParamEventType, ParamOptions> {
    // Get accessors for param properties
    private _name: string;
    private _value: any;
    private _type?: string;
    private _subType?: string;
    private _enabled?: boolean;
    private _shortName?: string;
    private _defaultValue?: any;
    private _typeData?: any;
    private _coerce?: boolean;
    private _group?: string;
    private _valueSetNotifier?: ParamValueSetNotifier;

    /*
     * @param {ParamEventType} eventType - The event type.
     * @param {ParamOptions} options - The event options.
     */
    constructor(
        name: string,
        value: any,
        options: ParamOptions,
        eventNotifier?: ParamProxyEventNotifier,
        valueSetNotifier?: ParamValueSetNotifier,
        signalSubscriber?: string | object
    ) {
        super(signalSubscriber);
        this._name = name;
        this._value = value;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
        this.registerValueSetNotifier(valueSetNotifier);
        // this.registerChangeSubscriber(changeSubscriber);
    }

    private setOptionProperties(options: ParamOptions): void {
        this._type = options.type;
        this._subType = options.subType;
        this._shortName = options.shortName;
        this._defaultValue = options.defaultValue;
        this._typeData = options.typeData;
        this._coerce = options.coerce;
        this._group = options.group;
        this._enabled = toBool(options.enabled);
    }

    private registerEventNotifier(eventNotifier: ParamProxyEventNotifier | undefined) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ParamEventTypes), eventNotifier);
        }
    }

    private registerValueSetNotifier(valueSetNotifier: ParamValueSetNotifier | undefined) {
        if (valueSetNotifier) {
            this._valueSetNotifier = valueSetNotifier;
        }
    }

    // private registerChangeSubscriber(changeSubscriber: ParamChangeSubscriber | undefined) {
    //     if (changeSubscriber) {
    //         changeSubscriber(this.receivePropertyChange.bind(this));
    //     }
    // }

    get name(): string {
        return this._name;
    }
    get value(): any {
        return this._value;
    }
    get type(): string | undefined {
        return this._type;
    }
    get subType(): string | undefined {
        return this._subType;
    }
    get enabled(): boolean | undefined {
        return this._enabled;
    }
    get shortName(): string | undefined {
        return this._shortName;
    }
    get defaultValue(): any {
        return this._defaultValue;
    }
    get typeData(): any {
        return this._typeData;
    }
    get coerce(): boolean | undefined {
        return this._coerce;
    }
    get group(): string | undefined {
        return this._group;
    }

    /**
     * Sets the value of the parameter. Called at the page level to set the value of the param.
     * @method
     * @param {any} value - The new value.
     * @returns {boolean} - True if the value was set successfully, false if the parameter is disabled.
     */
    setValue(value: any): boolean {
        if (this._enabled === false) return false;
        this._value = value;
        // Notify the event notifier if it exists
        if (this._valueSetNotifier) {
            this._valueSetNotifier(value, this);
        }
        return true;
    }

    /**
     * Gets the serialized param value.
     * @method
     * @returns {string} - The serialized/stringified value.
     */
    serializedValue() {
        return toString(this.value);
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

    // --- Send/receive Handling ---

    // protected receiveSignal<TPayload>(
    //     signal: WidgetCommunicatorEventType,
    //     payload: TPayload
    // ): void {
    //     // Handle incoming communication messages
    //     const { propertyName, value } = payload as WidgetObjectChangedPayload;
    //     if (signal === 'paramchanged') {
    //         this.receiveChange(propertyName as keyof ParamOptions, value);
    //     } else if (signal === 'paramset') {
    //         this.receiveSetValue(value);
    //     } else {
    //         super.receiveSignal(signal, payload);
    //     }
    // }

    protected receivePropertyChange(name: keyof ParamOptions, value: any): void {
        // This method is called when the underlying object communicates a property change.
        // The implementor should handle the property change accordingly.
        if (this.handlePropertyChange(name, value)) {
            // If the property change was handled, trigger the change event
            this.trigger('change', { property: name, value: value });
            if (name === 'value') {
                this.trigger('set', { value: value });
            }
        }
    }

    protected receiveSetValue(value?: any): void {
        // This method is called when the underlying object communicates a value set.
        this.handleSetValue(value);
    }

    private handlePropertyChange(name: keyof ParamOptions, value: any): boolean {
        const fieldMap: Record<keyof ParamOptions, string> = {
            value: '_value',
            type: '_type',
            subType: '_subType',
            enabled: '_enabled',
            shortName: '_shortName',
            defaultValue: '_defaultValue',
            typeData: '_typeData',
            coerce: '_coerce',
            group: '_group',
            binding: '',
            sanitizer: '',
            description: '',
        };
        const field = fieldMap[name];
        if (field) {
            (this as any)[field] = value;
            return true;
        }
        return false;
    }

    private handleSetValue(value: any): void {
        // This method is called when the underlying object communicates a value set.
        this._value = value;
    }

    /**
     * Gets a string representation of this object.
     * @method
     * @returns {string}
     */
    toString() {
        return '[ParamProxy { name: "' + this.name + '" }]';
    }
}
