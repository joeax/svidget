/*****************************************
svidget.objectprototype.js

Contains common prototype functionality for all common Svidget objects.

Dependencies:
svidget.core.js


******************************************/

/// <reference path="types.ts" />
/// <reference path="../core/collection.ts" />
/// <reference path="../core/enums.ts" />
/// <reference path="../core/objectBase.ts" />

namespace Svidget {

    export class ParamBase implements ParamCore, BaseMixin<ParamProps, ParamEventTypes> {
        //private readonly getter: GetterFunc;
        private base: Base<ParamProps, ParamEventTypes>;
        //private getset: GetSetFunc<ParamProps>;
        //private on: OnEventFunc<ParamEventTypes>;
        //private off: OffEventFunc<ParamEventTypes>;
        //private trigger: TriggerFunc<ParamEventTypes>;
        //private readonly setter: SetterFunc;
        //private readonly onEvent: OnEventFunc<ParamEventTypes>;
        //private readonly offEvent: OffEventFunc<ParamEventTypes>;
        //private readonly props: PropContainer<TProps>;
        //private readonly events: EventContainer<TEventTypes>; // = new EventContainer(eventTypes);

        /*constructor(getter: GetterFunc, setter: SetterFunc, onEvent: OnEventFunc<ParamEventTypes>, offEvent: OffEventFunc<ParamEventTypes>) {
            //this.getter = getter;
            this.setter = setter;
            this.onEvent = onEvent;
            this.offEvent = offEvent;
        }*/

        __configure(base: Base<ParamProps, ParamEventTypes>) {
            if (base !== undefined) return;
            this.base = base;
            configureBaseMixin(this, base);
        }

        get value(): unknown {
            return this.getset("value");
        }

        set value(input: unknown) {
            this.getset("value", input);
        }

        get description(): string {
            return this.getset("description") as string;
        }

        get type(): ParamTypeName {
            return this.getset("type") as ParamTypeName;
        }

        get subtype(): ParamSubTypeName {
            return this.getset("subtype") as ParamSubTypeName;
        }

        get enabled(): boolean {
            return this.getset("enabled") as boolean;
        }

        get shortname(): string {
            return this.getset("shortname") as string;
        }

        get defvalue(): unknown {
            return this.getset("defvalue");
        }

        get typedata(): string {
            return this.getset("typedata") as string;
        }

        get coerce(): boolean {
            return this.getset("coerce") as boolean;
        }

        get group(): string {
            return this.getset("group") as string;
        }

        /**
         * Gets the serialized param value.
         * @method
         * @returns {string} - The serialized/stringified value.
         */
        serializedValue(): string {
            const val = this.value;
            return Svidget.Conversion.toString(val);
        }

        /**
         * Adds an event handler for the "change" event.
         * @method
         * @param {Function} handler - The event handler.
         * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
         * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
         * @returns {boolean} - True if the event handler was successfully added.
         */
        onChange(
            handler: EventHandlerFunc,
            data?: unknown,
            name?: string
        ): boolean {
            return this.on("change", handler, data, name);
        }

        /**
         * Removes an event handler for the "change" event.
         * @method
         * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
         * @returns {boolean} - True if the event handler was successfully removed.
         */
        offChange(handlerOrName: EventHandlerFunc | string): boolean {
            return this.off("change", handlerOrName);
        }

        /**
         * Adds an event handler for the "set" event.
         * @method
         * @param {object} [data] - Arbirary data to initialize Event object with when event is triggered.
         * @param {string} [name] - The name of the handler. Useful when removing the handler for the event.
         * @param {Function} handler - The event handler.
         * @returns {boolean} - True if the event handler was successfully added.
         */
        onSet(
            handler: EventHandlerFunc,
            data?: unknown,
            name?: string
        ): boolean {
            return this.on("set", handler, data, name);
        }

        /**
         * Removes an event handler for the "set" event.
         * @method
         * @param {(Function|string)} handlerOrName - The handler function and/or the handler name used when calling on().
         * @returns {boolean} - True if the event handler was successfully removed.
         */
        offSet(handlerOrName: EventHandlerFunc | string): boolean {
            return this.off("set", handlerOrName);
        }

    }

    export interface ParamBase extends ObjectBase<ParamProps, ParamEventTypes> {};
}

//Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", 
//    "coerce", "group"]; // 0.1.3: removed "binding", 
//Svidget.Param.writableProxyProperties = ["value"];
