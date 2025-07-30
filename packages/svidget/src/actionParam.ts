import { EventHandler } from './eventableBase';
import { ParamBase, ParamBaseOptions } from './paramBase';
import { ActionParamTransport } from './transports';
import { WidgetEvent } from './widgetEvent';

/**
 * ActionOptions interface
 * Represents the attributes on the <svidget:action> element.
 * @module Action
 */
export interface ActionParamOptions extends ParamBaseOptions {}

export const ActionParamOptionProperties = [
    'type',
    'subType',
    'typeData',
    'description',
    'defaultValue'
];

// ActionParam Events
export const ActionParamEventTypes = ['change'] as const;
export type ActionParamEventType = (typeof ActionParamEventTypes)[number];

export type ActionParamEventNotifier = (type: ActionParamEventType, event: WidgetEvent, target: ActionParam) => void;

/**
 * ActionParam class
 * Represents a parameter for an action in a widget.
 * @module ActionParam
 */
export class ActionParam extends ParamBase<ActionParamEventType, ActionParamOptions> {
    private _actionName: string;
    /**
     * Constructs an ActionParam instance.
     * @param name Name of the parameter
     * @param type Type of the parameter
     * @param value Value of the parameter
     * @param defaultValue Default value of the parameter
     * @param description Description of the parameter
     * @param subType Subtype of the parameter
     * @param typedata Choices for the parameter
     */
    constructor(name: string, actionName: string, options: ActionParamOptions, eventNotifier?: ActionParamEventNotifier) {
        super(name, options);
        this._actionName = actionName;
        this.registerEventNotifier(eventNotifier);
    }

    private registerEventNotifier(eventNotifier?: ActionParamEventNotifier) {
        if (eventNotifier) {
            this.registerBubbleCallback(Array.from(ActionParamEventTypes), eventNotifier);
        }
    }

    /**
     * Serializes the ActionParam for transport.
     */
    serialize(): ActionParamTransport {
        return {
            name: this.name,
            actionName: this._actionName, // Include action name if applicable
            type: this.type,
            defaultValue: this.defaultValue,
            // Optionally add description, subType, typedata if needed for proxy
        };
    }

    /** Registers a handler for the 'change' event. */
    onChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('change', handler, name, data);
    }
    /** Unregisters a handler for the 'change' event. */
    offChange(handler: EventHandler, name?: string): void {
        this.off('change', handler, name);
    }
}
