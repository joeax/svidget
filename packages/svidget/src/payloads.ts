/**
 * Payloads
 * This file defines the structure of payloads used in communication between the widget and its parent.
 * It includes interfaces for various payload types that are exchanged during widget operations.
 */

import { ActionParamTransport, EventDescTransport, ParamTransport, WidgetTransport } from "./transports";

export interface Params {
    [key: string]: string;
}

// Payload for handleReceiveParentStart
export interface ParentStartPayload {
    id: string;
    params?: Params;
    connected?: boolean;
}

// Payload for handleReceiveParentPropertyChange
export interface ParentPropertyChangedPayload {
    type: string;
    propertyName?: string;
    name?: string;
    value?: any;
}

// Payload for handleReceiveParentActionInvoke
export interface ParentActionInvokedPayload {
    action: string;
    args?: any[];
}

// Payload for handleReceiveParentEventTrigger
export interface ParentEventTriggeredPayload {
    event: string;
    data?: any;
}

export interface WidgetStartAckPayload {
    widget: WidgetTransport;
}

// used by Param, Action, Event, ActionParam
export interface WidgetObjectChangedPayload {
    /** The name of the object (param, action, etc) being changed. */
    name: string;
    propertyName: string;
    value?: any;
}

export interface WidgetActionInvokedPayload {
    action: string;
    returnValue?: any;
}

export interface WidgetEventTriggeredPayload {
    event: string;
    data?: any;
}

export interface WidgetParamAddedPayload {
    param: ParamTransport;
}

export interface WidgetParamRemovedPayload {
    name: string;
}

export interface WidgetActionAddedPayload {
    action: ActionParamTransport;
}

export interface WidgetActionRemovedPayload {
    name: string;
}

export interface WidgetActionParamAddedPayload {
    actionName: string;
    param: Omit<ActionParamTransport, 'actionName'>;
}

export interface WidgetActionParamRemovedPayload {
    actionName: string;
    name: string;
}

export interface WidgetEventAddedPayload {
    event: EventDescTransport;
}

export interface WidgetEventRemovedPayload {
    name: string;
}