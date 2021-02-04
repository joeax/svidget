/*****************************************
svidget.event.js

Contains common event functionality.

Dependencies:
(none)

******************************************/

namespace Svidget {

	/**
     * Creates a new Event. A helper function for newing a Svidget.Event object.
     * @function
     * @param {string} name - The name of the event as specified when registering a handler.
     * @param {string} type - The type of the event, like "actioninvoke", "eventtrigger" etc.
     * @param {object} data - An arbitrary object passed in when registering a handler.
     * @param {object} target - The framework object that is the latest object to trigger the event, i.e. do to an event bubble.
     * @param {object} origTarget - The framework object that originally triggered the event.
     * @param {object} value - The value associated with the event. This is specific to the type of event that was triggered.
     */
	export function newEvent(name: string, type: EventType, data: unknown, target: Base, origTarget: Base, value: unknown) {
		return new Event({ name, type, data, target, origTarget, value });
	}

    /**
     * Represents an event triggers by the framework.
     * @class
     */
    export class Event {
        private readonly _currentTarget: Base;
        private _data: unknown;
        private _name: string;
        private readonly _timestamp: number;
        private readonly _target: Base;
        private readonly _type: EventType;
        private readonly _value: unknown;
        private _isPropagationStopped: boolean = false;
        private _isImmediatePropagationStopped: boolean = false;

        constructor(options: EventOptions) {
            this._currentTarget = options.target;
            this._data = options.data;
            this._name = options.name;
            this._timestamp = Date.now();
            this._target = options.origTarget ?? options.target;
            this._type = options.type;
            this._value = options.value;
        }

        /**
         * Gets the name of the handler specified at bind time (writable).
         */
        get name(): string {
            return this._name;
		}
		
		set name(input: string) {
            this._name = input;
        }

        /**
         * Gets the value specified at trigger time.
         */
        get value(): unknown {
            return this._value;
        }

        /**
         * Gets the value specified at trigger time.
         */
        get type(): EventType {
            return this._type;
        }

        /**
         * Gets the object (param, action, etc) that triggered event.
         */
        get target(): Base {
            return this._target;
        }

        /**
         * Gets the current object (param, action, etc) that currently triggered event (either original or current bubble target).
         */
        get currentTarget(): Base {
            return this._currentTarget;
        }

        /**
         * Gets the data that was passed at bind time (writable).
         */
        get data(): unknown {
            return this._data;
		}
		
		set data(input: unknown) {
            this._data = input;
        }

        /**
         * Gets the date/time timestamp when the event was triggered.
         */
        get timestamp(): number {
            return this._timestamp;
        }

        /**
         * Gets whether propagation was stopped on this event. When true this event will not bubble to parent.
         * @method
         * @returns {boolean}
         */
        isPropagationStopped(): boolean {
            return this._isPropagationStopped;
        }

        /**
         * Gets whether immediate propagation was stopped on this event. When true, no futher handlers will be invoked and this event will not bubble to parent.
         * @method
         * @returns {boolean}
         */
        isImmediatePropagationStopped(): boolean {
            return false;
        }

        /**
         * Stops propagation for this event.
         * @method
         */
        stopPropagation(): void {
            this._isPropagationStopped = true;
        }

        /**
         * Stops immediate propagation for this event.
         * @method
         */
        stopImmediatePropagation(): void {
            this._isImmediatePropagationStopped = true;
            this.stopPropagation();
        }
    }
}
