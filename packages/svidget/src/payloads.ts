/**
 * Payloads
 * This file defines the structure of payloads used in communication between the widget and its parent.
 * It includes interfaces for various payload types that are exchanged during widget operations.
 */

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
export interface ParentPropertyChangePayload {
    type: string;
    propertyName?: string;
    name?: string;
    value?: any;
}

// Payload for handleReceiveParentActionInvoke
export interface ParentActionInvokePayload {
    action: string;
    args?: any[];
}

// Payload for handleReceiveParentEventTrigger
export interface ParentEventTriggerPayload {
    event: string;
    data?: any;
}
