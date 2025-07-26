/**
 * Event class (modernized Svidget.Event)
 * Represents a DOM-like event triggered by the framework, with propagation control and event metadata.
 */
export class WidgetEvent<TEventType extends string = string> {
    /** Type of the event (e.g., "actioninvoke", "eventtrigger") */
    readonly type: TEventType;
    /** Name of the event, if applicable */
    readonly name: string | undefined;
    /** Arbitrary data passed in when registering a handler */
    readonly data: any;
    /** The current object (param, action, etc) that triggered the event (bubble target) */
    readonly currentTarget: any;
    /** The object that originally triggered the event */
    readonly target: any;
    /** The value associated with the event */
    readonly value: any;
    /** Timestamp when the event was triggered */
    readonly timeStamp: number;

    private _propagationStopped = false;
    private _immediatePropagationStopped = false;

    constructor(type: TEventType, name?: string, data?: any, currentTarget?: any, origTarget?: any, value?: any) {
        this.type = type;
        this.name = name;
        this.data = data;
        this.currentTarget = currentTarget;
        this.target = origTarget == null ? currentTarget : origTarget;
        this.value = value;
        this.timeStamp = Date.now();
    }

    /**
     * Gets whether propagation was stopped on this event.
     */
    isPropagationStopped(): boolean {
        return this._propagationStopped;
    }

    /**
     * Gets whether immediate propagation was stopped on this event.
     */
    isImmediatePropagationStopped(): boolean {
        return this._immediatePropagationStopped;
    }

    /**
     * Stops propagation for this event.
     */
    stopPropagation(): void {
        this._propagationStopped = true;
    }

    /**
     * Stops immediate propagation for this event.
     */
    stopImmediatePropagation(): void {
        this._immediatePropagationStopped = true;
        this.stopPropagation();
    }
}

