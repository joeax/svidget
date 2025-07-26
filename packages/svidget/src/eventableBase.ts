import { logInfo } from './logging';
import { WidgetEvent } from './widgetEvent';

export type EventHandler = (event: WidgetEvent) => void;

export interface EventHandlerInfo {
    handler: EventHandler;
    name?: string;
    data?: any;
}

type BubbleParentHandler<TEventType extends string> = (type: TEventType, sourceEvent: WidgetEvent, target: any) => void;

interface BubbleParents<TEventType extends string> {
    [type: string]: BubbleParentHandler<TEventType>;
}

type EventHandlers<TEventType extends string> = Map<TEventType, Array<EventHandlerInfo>>;

/**
 * EventableBase class
 * Provides basic event handling functionality for classes that fire events.
 */
export class EventableBase<TEventType extends string = string> {
    /** Event handler registry */
    protected handlers: EventHandlers<TEventType> = new Map();
    private bubbleParents: BubbleParents<TEventType> = {};

    /**
     * Registers an event handler for a widget event.
     * @param event Event name
     * @param handler Handler function
     */
    on(event: TEventType, handler: EventHandler, name?: string, data?: any): boolean {
        // if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
        // this.eventHandlers.get(event)?.push(handler);
        return this.addHandler(event, handler, name, data);
    }

    /**
     * Unregisters an event handler for a widget event.
     * @param event Event name
     * @param handler Handler function
     */
    off(event: TEventType, handler: EventHandler, name?: string): boolean {
        // if (!this.handlers.has(event)) return;
        // this.handlers.get(event)?.filter((h) => h !== handler);
        return this.removeHandler(event, handler, name);
    }

    /**
     * Triggers a widget event and calls all registered handlers.
     * @param event Event name
     * @param args Arguments to pass to handlers
     */
    // trigger(event: TEventType, ...args: any[]): void {
    //     if (!this.eventHandlers.has(event)) return;
    //     this.eventHandlers.get(event)?.forEach((h) => h(...args));
    // }
    trigger(type: TEventType, value: any, originalTarget?: any): void {
        // if (type == null) return; // nothing to do
        // get event object from handlers
        var e = this.triggerHandlers(type, value, originalTarget);
        logInfo('trigger: ' + type);
        // if not stopPropagation call bubble
        if (!e.isPropagationStopped()) {
            this.bubble(type, e);
        }
        //alert('trigger: ' + type);
    }

    private triggerHandlers(type: TEventType, value: any, originalTarget?: any): WidgetEvent {
        // generate event object
        var e = new WidgetEvent(type, undefined, this.getTarget(), originalTarget, value);
        if (type == null || this.handlers == null || !this.handlers.has(type)) return e; // nothing to do
        var handlers = this.handlers.get(type);
        // loop through each handler (make sure it is a function)
        // h == { handler: handler, name: name, data: data }
        handlers?.forEach((h) => {
            if (e.isImmediatePropagationStopped()) return false; // if stopImmediatePropagation, then exit loop by returning false
            // if (h == null || h.handler == null || typeof h.handler !== 'function') return; // handler is not a function
            // set name/data
            // e.name = h.name;
            // e.data = h.data;
            // invoke handler
            h.handler.call(null, this.cloneWidgetEvent(e, h.name, h.data));
        });

        return e;
    }

    private cloneWidgetEvent(e: WidgetEvent, name?: string, data?: any): WidgetEvent {
        return new WidgetEvent(e.type, name, data, e.currentTarget, e.target, e.value);
    }

    // Helper methods for managing event handlers (converted from object literal to class methods)
    private addHandler(type: TEventType, handler: EventHandler, name?: string, data?: any): boolean {
        if (!this.handlers.has(type)) this.handlers.set(type, []);
        const handlers = this.handlers.get(type)!;
        // if (handlers.some((h) => this.handlerMatch(h, handler, name))) return false;
        if (this.handlerExists(type, handler, name)) return false;
        handlers.push({ handler, name, data });
        return true;
    }

    private removeHandler(type: TEventType, handler: EventHandler, name?: string): boolean {
        if (!this.handlers.has(type)) return false;
        const handlers = this.handlers.get(type)!;
        const initialLength = handlers.length;
        this.handlers.set(
            type,
            handlers.filter((h) => !this.handlerMatch(h, handler, name))
        );
        return handlers.length !== initialLength;
    }

    private handlerExists(type: TEventType, handler: EventHandler, name?: string): boolean {
        if (!this.handlers.has(type)) return false;
        const handlers = this.handlers.get(type)!;
        return handlers.some((h) => this.handlerMatch(h, handler, name));
    }

    private handlerMatch(handlerObj: EventHandlerInfo, handler: EventHandler, name?: string): boolean {
        if (name != null && handlerObj.name === name) return true;
        if (handler === handlerObj.handler) return true;
        return false;
    }

    private bubble(type: TEventType, sourceEvent: WidgetEvent) {
        // invoked from child
        this.ensureBubbleParents();
        const newEvent = this.cloneWidgetEvent(sourceEvent);
        if (this.bubbleParents[type]) this.bubbleParents[type](type, newEvent, this.getTarget());
    }

    private ensureBubbleParents() {
        if (!this.bubbleParents) this.bubbleParents = {};
    }

    private setBubbleParent(eventType: TEventType, callback: BubbleParentHandler<TEventType>) {
        this.ensureBubbleParents();
        this.bubbleParents[eventType] = callback;
    }

    // private, called by the object to register a single callback for all its event types
    // bubbleTarget: usually a parent object
    registerBubbleCallback(
        types: TEventType[],
        // bubbleTarget: any, // this changed the context of the event handler, not needed for now
        callback: BubbleParentHandler<TEventType>
    ): void {
        types.forEach((type) => {
            // const wrappedCallback = wrap(callback, bubbleTarget);
            // if (wrappedCallback) {
            //   this.setBubbleParent(type, wrappedCallback as BubbleParentHandler);
            // }
            this.setBubbleParent(type, callback);
        });
    }

    protected getTarget(): any {
        return this;
    }

    /**
     * Serializes the object for transport across a window boundary.
     * @method
     * @virtual
     * @returns {boolean} - A generic serialized object representing the Param object.
     */
    serialize(): object {
        return {};
    }

    /**
     * Gets a string representation of this object.
     * @method
     * @virtual
     * @returns {string}
     */
    toString(): string {
        return '[EventableBase]';
    }
}
