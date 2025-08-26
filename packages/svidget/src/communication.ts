declare global {
    interface Window {
        svidget?: {
            routeFromWidget: <TEventType extends CommunicatorEventType, TPayload = any>(data: MessageData<TEventType, TPayload>) => void;
            // other properties can be added as needed
        };
    }
}

/**
 * Event names received from the parent page.
 */
export const ParentCommunicatorEventTypes = [
    'start',
    // 'propertychanged',
    'paramvaluechanged', // formerly propertychanged
    'actioninvoke',
    'eventtrigger',
] as const;
export type ParentCommunicatorEventType = (typeof ParentCommunicatorEventTypes)[number];

/**
 * Event names received from the widget.
 */
export const WidgetCommunicatorEventTypes = [
    'startack',
    'paramadded',
    'paramremoved',
    'paramchanged',
    'paramset',
    'actionadded',
    'actionremoved',
    'actionchanged',
    'actioninvoked',
    'actionparamadded',
    'actionparamremoved',
    'actionparamchanged',
    'eventadded',
    'eventremoved',
    'eventchanged',
    'eventtriggered',
] as const;
export type WidgetCommunicatorEventType = (typeof WidgetCommunicatorEventTypes)[number];

export type CommunicatorEventType = ParentCommunicatorEventType | WidgetCommunicatorEventType;

export const ParamCommunicatorEvents = ['paramchanged', 'paramset'] as const;
export type ParamCommunicatorEventType = (typeof ParamCommunicatorEvents)[number];


// todo: implement as TEventType
export interface MessageData<
    TEventType extends CommunicatorEventType,
    TPayload = any
> {
    name: TEventType;
    payload: TPayload;
    widget?: string;
}

export type MessageHandler<
    TEventType extends CommunicatorEventType
> = (data: MessageData<TEventType>) => void;

export type SignalReceiver<
    TEventType extends CommunicatorEventType,
    TPayload = any
> = (signal: TEventType, payload: TPayload) => void;

export type SignalSubscriber<
    TEventType extends CommunicatorEventType
> = (callback: SignalReceiver<TEventType>) => void;
