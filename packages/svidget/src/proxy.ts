import { SignalSubscriber } from './communication';
import { CommunicatorEventType } from './communication';
import { EventableBase } from './eventableBase';

export type PropertyChangeReceiver<TOptionsType extends {} = {}> = (name: keyof TOptionsType, value: any) => void;

/**
 * Encapsulates logic for a proxy object that is meant to shadow a concrete one.
 * @class
 * @abstract
 * @module proxy
 * @extends Svidget.EventableBase
 * @param {object} parent - The parent to this object. Usually a Svidget.WidgetReference instance.
 * @param {object} options - An object containing values to initialize properties. Example: { enabled: true, description: "An event" }
 * @param {Array} propList - An array of all properties that the underlying object exposes to the proxy.
 * @param {Array} writePropList - An array of all writable properties that the underlying object exposes to the proxy. A subset of propList.
 * @param {Array} eventList - An array of all event types that this proxy listens for and/or response to based on the underlying object.
 */
/*
// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value
*/
export class Proxy<
    TEventType extends string = string,
    TOptionsType extends {} = {}
> extends EventableBase<TEventType> {
    private _connected: boolean = false;
    private _subscriber?: string | object;

    constructor(signalSubscriber?: string | object) {
        super();
        // if (signalSubscriber) {
        //     signalSubscriber(this.receiveSignal.bind(this));
        // }
        this._subscriber = signalSubscriber;
    }

    /**
     * Gets whether the proxy object is attached to its parent.
     * @method
     * @returns {boolean}
     */
    get attached(): boolean {
        return false;
    }

    /**
     * Gets whether the proxy is connected to its underlying widget counterpart.
     * Note: used by ParamProxy to determine if params from <params> elements or from Widget
     * @method
     * @returns {boolean}
     */
    get connected(): boolean {
        return this._connected;
    }

    /**
     * Gets whether the proxy object is connected to its underlying object.
     * @method
     * @returns {boolean}
     */
    connect(): void {
        this._connected = true;
    }

    // protected receiveSignal(signal: CommunicatorEventType, payload: any): void {
    //     // This method is called when the underlying object communicates a property change.
    //     // The implementor should handle the property change accordingly.
    // }

    // Returns a callback bound to the private receiveSignal method
    // The subscriber object must match the one used during construction.
    public getPropertyChangeReceiver(
        subscriber: string | object
    ): PropertyChangeReceiver<TOptionsType> | undefined {
        if (subscriber !== this._subscriber) return;
        return this.receivePropertyChange.bind(this);
    }

    protected receivePropertyChange(name: keyof TOptionsType, value: any): void {
        // This method is called when the underlying object communicates a property change.
        // The implementor should handle the property change accordingly.
    }

    // private
    // this is invoked when the widget communicates that a property was changed
    // notifyPropertyChange(name: string, val: any): void {
    //     // notifies this proxy that property changed on widget
    //     if (name == null) return;
    //     // update value to match source
    //     this.getset(name, val);
    //     // trigger change event
    //     this.triggerFromWidget('change', { property: name, value: val }, this);
    // }

    // Note: no access to trigger() object events here, only from widget
    // this is invoked from the widget to signal that the event was triggered
    // triggerFromWidget(type: TEventType, value: any, originalTarget: any): void {
    //     this.trigger(type, value, originalTarget);
    // }

    // registerBubbleCallback(types: string | string[], bubbleTarget: any, callback: Function): void {
    //     this.registerBubbleCallback(types, bubbleTarget, callback);
    // }
}
