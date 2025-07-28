
import { toString, toBool } from "./conversion";
import { EventableBase, EventHandler } from "./eventableBase";
import { Optional } from './types';
import { WidgetEvent } from "./widgetEvent";

export interface EventDescTransport {
  name: string;
  description?: string;
  external: boolean;
  enabled: boolean;
}

export const EventDescOptionProperties = ['external', 'enabled', 'description'];

// EventDesc Events
export const EventDescEventTypes = ['trigger', 'change'] as const;
export type EventDescEventType = (typeof EventDescEventTypes)[number];


export type EventDescEventNotifier = (type: EventDescEventType, event: WidgetEvent, target: EventDesc) => void;

/**
 * EventDescOptions interface
 * Represents the attributes on the <svidget:event> element.
 * @module Action
 */
export interface EventDescOptions {
    external?: boolean;
    enabled?: boolean;
    description?: string;
}

/**
 * EventDesc class
 * Represents an event emitted by a widget.
 * @module event
 */
export class EventDesc extends EventableBase<EventDescEventType> {
    /** Name of the event (immutable) */
    readonly name: string;
    private _description: Optional<string>;
    private _external: boolean = true;
    private _enabled: boolean = true;

    constructor(name: string, options: EventDescOptions, eventNotifier?: EventDescEventNotifier) {
        super();
        this.name = name;
        this.setOptionProperties(options);
        this.registerEventNotifier(eventNotifier);
    }

    private setOptionProperties(options: EventDescOptions): void {
        this._description = toString(options.description);
        this._enabled = options.enabled != null ? toBool(options.enabled) : true;
        this._external = options.external != null ? toBool(options.external) : true;
    }

    private registerEventNotifier(eventNotifier?: EventDescEventNotifier) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(EventDescEventTypes), eventNotifier);
        }
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

    /** Gets or sets whether the event is external. Triggers change event on set. */
    get external(): boolean {
        return this._external;
    }
    set external(val: boolean) {
        if (this._external !== val) {
            this._external = val;
            this.trigger('change', { property: 'external', value: val });
        }
    }

    /** Gets or sets whether the event is enabled. Triggers change event on set. */
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(val: boolean) {
        if (this._enabled !== val) {
            this._enabled = val;
            this.trigger('change', { property: 'enabled', value: val });
        }
    }

    /** Triggers the event for the EventDesc object. */
    triggerEvent(value?: any): void {
        if (!this.enabled) return;
        this.trigger('trigger', value);
    }

    // --- Event Registration Shortcuts ---
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

    // --- Serialization ---
    serialize(): EventDescTransport {
        return {
            name: this.name,
            description: this.description ?? '',
            external: this.external,
            enabled: this.enabled,
        };
    }

    toString(): string {
        return `[EventDesc name="${this.name}"]`;
    }
}
