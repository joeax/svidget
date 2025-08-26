import { ActionParamEventNotifier, ActionParamEventType, ActionParamEventTypes, ActionParamOptions } from './actionParam';
import { CommunicatorEventType } from './communication';
import { toBool } from './conversion';
import { EventHandler } from './eventableBase';
import { WidgetPropertyChangePayload } from './payloads';
import { Proxy, SignalSubscriber } from './proxy';

/**
 * ActionParamProxy class
 * Proxy for action param in the web context.
 * @module ActionParamProxy
 */
export class ActionParamProxy extends Proxy<ActionParamEventType, ActionParamOptions> {
    // Private fields for action param properties
    private _name: string;
    private _type?: string;
    private _subType?: string;
    private _typeData?: any;
    private _description?: string;
    private _defaultValue?: any;
    private _actionName: string;

    constructor(
        name: string,
        actionName: string,
        options: ActionParamOptions,
        eventNotifier?: ActionParamEventNotifier,
        signalSubscriber?: SignalSubscriber
    ) {
        super(signalSubscriber);
        this._name = name;
        this._actionName = actionName;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
    }

    private setOptionProperties(options: ActionParamOptions): void {
        this._type = options.type;
        this._subType = options.subType;
        this._typeData = options.typeData;
        this._description = options.description;
        this._defaultValue = options.defaultValue;
    }

    private registerEventNotifier(eventNotifier: ActionParamEventNotifier | undefined) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ActionParamEventTypes), eventNotifier);
        }
    }

    // Get accessors
    get name(): string {
        return this._name;
    }
    get type(): string | undefined {
        return this._type;
    }
    get subType(): string | undefined {
        return this._subType;
    }
    get typeData(): any {
        return this._typeData;
    }
    get description(): string | undefined {
        return this._description;
    }
    get defaultValue(): any {
        return this._defaultValue;
    }

    // Event registration shortcuts
    onChange(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('change', handler, name, data);
    }
    offChange(handler: EventHandler, name?: string): boolean {
        return this.off('change', handler, name);
    }

    // --- Send/receive Handling ---

    protected receiveSignal<TPayload>(signal: CommunicatorEventType, payload: TPayload): void {
        // Handle incoming communication messages
        if (signal === 'propertychanged') {
            const { propertyName, value } = payload as WidgetPropertyChangePayload;
            this.receivePropertyChange(propertyName as keyof ActionParamOptions, value);
        } else {
            super.receiveSignal(signal, payload);
        }
    }

    protected receivePropertyChange(name: keyof ActionParamOptions, value: any): void {
        if (this.handlePropertyChange(name, value)) {
            this.trigger('change', { property: name, value: value });
        }
    }

    // Property change handling
    private handlePropertyChange(name: keyof ActionParamOptions, value: any): boolean {
        const fieldMap: Record<keyof ActionParamOptions, string> = {
            type: '_type',
            subType: '_subType',
            typeData: '_typeData',
            description: '_description',
            defaultValue: '_defaultValue',
        };
        const field = fieldMap[name];
        if (field) {
            (this as any)[field] = value;
            return true;
        }
        return false;
    }

    /**
     * Gets a string representation of this object.
     * @method
     * @returns {string}
     */
    toString() {
        return '[ActionParamProxy { name: "' + this.name + '" }]';
    }
}
