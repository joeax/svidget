/*****************************************
svidget.paramproxy.js

Represents a wrapper to an actual param contained within a widget. Contains a cache of the properties of the param,
and maintains a constant sync between itself and its underlying param.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype
Svidget.Param
Svidget.Proxy

******************************************/
/// <reference path="paramBase.ts" />
/// <reference path="types.ts" />
/// <reference path="utils.ts" />
/// <reference path="../core/helpers.ts" />
/// <reference path="../core/objectBase.ts" />
/// <reference path="../core/proxy.ts" />

namespace Svidget {

    /**
     * Represents a proxy to an Param object.
     * @class
     * @augments Svidget.Proxy
     * @memberof Svidget
     * @param {string} name - The name of the param proxy.
     * @param {object} value - The value for the param proxy.
     * @param {object} options - The options for the param proxy. Example: { enabled: true, description: "An event" }
     * @param {Svidget.WidgetReference} parent - The widget reference that is the parent for this param.
     */
    export class ParamProxy extends Proxy<
        ParamProxyProps,
        ParamProxyEventTypes
    > {
        // = function (name, value, options, parent) {

        constructor(
            name: string,
            value: unknown,
            options: ParamProxyOptions,
            parent: WidgetReference
        ) {
            super(
                transformToParamProxyProps(options, name, value),
                parent,
                "Svidget.ParamProxy"
            );

            // register callback from action to widget, for event bubbles
            this.registerBubbleCallback(
                ParamProxyEventTypes,
                parent,
                parent.paramProxyBubble
            );
        }

        // overrides
        handlePropertyChange(name: keyof ParamProxyProps, val: unknown): void {
            if (name == "value") {
                this.parent.updateParamValue(this.name, val);
                svidget.signalPropertyChange(
                    this.parent,
                    this,
                    "param",
                    name,
                    val
                );
            }
        }

        // private
        // this is invoked when the widget communicates that a property was changed
        notifyValueChange(val: unknown): void {
            // notifies this proxy that property changed on widget
            // update value to match source
            this.getset("value", val);
            // trigger change event
            this.triggerFromWidget("valuechange", { value: val }, this); // deprecated: set is the official event
            this.triggerFromWidget("set", { value: val }, this);
        }

        /**
         * Gets a string representation of this object.
         * @method
         * @returns {string}
         */
        toString() {
            return `[Svidget.ParamProxy { name: "${this.name}" }]`;
        }
	}
    
    //export interface ParamProxy extends ParamBase {}

	Svidget.extend(ParamProxy, ParamBase, false);
}
