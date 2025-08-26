import { CommunicatorEventType, SignalSubscriber } from './communication';
import { EventHandler } from './eventableBase';
import {
    EventDescEventNotifier,
    EventDescEventType,
    EventDescEventTypes,
    EventDescOptions,
} from './eventDesc';
import { WidgetEventTriggeredPayload, WidgetPropertyChangedPayload } from './payloads';
import { Proxy } from './proxy';

/**
 * EventDescProxy class
 * Proxy for widget event in the web context.
 * @module EventDescProxy
 */
export class EventDescProxy extends Proxy<EventDescEventType, EventDescOptions> {
    // Private fields for event properties
    private _name: string;
    // Remove _type, only use fields from EventDescOptions
    private _external: boolean | undefined;
    private _enabled?: boolean;
    private _description?: string;

    constructor(
        name: string,
        options: EventDescOptions,
        eventNotifier?: EventDescEventNotifier,
        signalSubscriber?: SignalSubscriber
    ) {
        super(signalSubscriber);
        this._name = name;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
    }

    private setOptionProperties(options: EventDescOptions): void {
        // Only assign fields that exist in EventDescOptions
        this._enabled = options.enabled != null ? options.enabled : true;
        this._description = options.description;
    }

    private registerEventNotifier(eventNotifier: EventDescEventNotifier | undefined) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(EventDescEventTypes), eventNotifier);
        }
    }

    // Get accessors
    get name(): string {
        return this._name;
    }
    get external(): boolean | undefined {
        // This should always be true in the proxy, otherwise we would never see this event (internal to widget)
        return this._external;
    }
    get enabled(): boolean | undefined {
        return this._enabled;
    }
    get description(): string | undefined {
        return this._description;
    }

    // Event registration shortcuts
    onTrigger(handler: EventHandler, name?: string, data?: any): boolean {
        return this.on('trigger', handler, name, data);
    }
    offTrigger(handler: EventHandler, name?: string): boolean {
        return this.off('trigger', handler, name);
    }
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
            const { propertyName, value } = payload as WidgetPropertyChangedPayload;
            this.receivePropertyChange(propertyName as keyof EventDescOptions, value);
        } else if (signal === 'eventtriggered') {
            this.receiveTriggered((payload as WidgetEventTriggeredPayload).data);
        } else {
            super.receiveSignal(signal, payload);
        }
    }

    protected receivePropertyChange(name: keyof EventDescOptions, value: any): void {
        if (this.handlePropertyChange(name, value)) {
            this.trigger('change', { property: name, value: value });
        }
    }

    private receiveTriggered(data?: any): void {
        // This method is called when the underlying object communicates an event trigger.
        this.trigger('trigger', data);
    }

    // Property change handling
    private handlePropertyChange(name: keyof EventDescOptions, value: any): boolean {
        const fieldMap: Record<keyof EventDescOptions, string> = {
            enabled: '_enabled',
            description: '_description',
            external: '_external',
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
        return '[EventDescProxy { name: "' + this.name + '" }]';
    }
}
