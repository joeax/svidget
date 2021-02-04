/*****************************************
svidget.param.js

Defines a param for the widget.

Dependencies:
Svidget.Core
Svidget.EventPrototype
Svidget.ObjectPrototype
Svidget.ParamPrototype


******************************************/
/// <reference path="paramBase.ts" />
/// <reference path="types.ts" />
/// <reference path="../core/index.ts" />
/// <reference path="../core/helpers.ts" />
/// <reference path="../core/objectBase.ts" />
/// <reference path="../dom/index.ts" />
/// <reference path="../utils/conversion.ts" />

namespace Svidget {
    //const eventTypes = ["change", "set"];
    //const optionProperties = keyof ParamOptions;
    //Svidget.Param.optionProperties = ["type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"];
    //Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"]; // 0.1.3: removed "binding",
    //Svidget.Param.writableProxyProperties = ["value"];

    /**
     * Represents param for a widget, defined by <svidget:param>
     * @constructor
     * @mixes ObjectPrototype
     * @mixes ParamPrototype
     * @augments EventPrototype
     * @memberof Svidget
     * @param {string} name - The name of the param.
     * @param {object} value - The value for the param.
     * @param {object} options - The options for the param. Example: { enabled: true, description: "An event" }
     * @param {Svidget.Widget} parent - The widget that is the parent for this param.
     */
    // example usage: widget1.param("backgroundColor").value();
    export class Param
        extends ObjectBase<ParamProps, ParamEventTypes>
        implements ParamArtifact {
        //extends ObjectBase<ParamProps> {
        //= function (name, value, options, parent) {
        //private readonly _writableProps: Array<string> =
        //	["shortname", "binding", "enabled", "type", "subtype", "value", "description", "defvalue", "typedata", "coerce", "group"];
        //private readonly _parent: Widget;
        //private readonly events: EventContainer<ParamEventType>; // = new EventContainer(eventTypes);
        //private readonly props: PropContainer<ParamProps>;

        constructor(
            name: string,
            value: unknown,
            options: ParamOptions,
            parent: Widget
        ) {
            super(
                transformToProps(options, name, value),
                validateParent(parent),
                "Svidget.Param"
            );
            // todo: if name is not null, generate
            //if (name == null)
			//const initOps: Partial<ParamOptions> = options ?? {};

            // wire up event bubble parent
            this.registerBubbleCallback(
                Svidget.Param.eventTypes,
                parent,
                parent.paramBubble
            );

            // target or binding
            //private get bindingQuery() => Svidget.DOM.select(privates.binding);
            // create sanitizerFunc from sanitizer
            // sanitizer can be string or function
            //privates.sanitizerFunc = Svidget.findFunction(privates.sanitizer);

            // validate parent
            function validateParent(parent: Base): Widget {
                if (parent && !(parent instanceof Widget)) {
                    throw new Error("Param parent must be a Widget");
                }
                return parent;
            }

            (this as BaseMixin<ParamProps, ParamEventTypes>).__configure(this);
        }

        /**
         * Gets or sets the param value.
         * @method
         * @param {boolean} [val] - Sets the enabled state when specified.
         * @returns {boolean} - The enabled state when nothing is passed, or true/false if succeeded or failed when setting.
         */
        get value(): unknown {
            return this.getset("value");
        }
        set value(input: unknown) {
            if (!this.enabled) return;
            //var res = this.props.getset("value", val, null, this.validateValue);
            // if undefined then validation failed
            //if (res === undefined) return;
            // check enabled
            let finalVal = input;
            // coerce val if coerce === true
            if (this.getset("coerce") === true) {
                finalVal = this.coerceValue(finalVal);
            }
            // sanitize val using param.sanitizer
            finalVal = this.applySanitizer(finalVal);
            // commit update
            const res = this.getset("value", finalVal);
            // apply to binding
            if (res !== undefined) {
                this.applyBinding(finalVal);
                // fire "set" event
                //this.trigger("valuechange", { value: finalVal }); // for backwards compatibility
                this.trigger("set", { value: finalVal }); // 0.1.3: replaces "valuechange"
            }
        }

        /**
         * Gets or sets the shortname value. This is used for params passed from the query string.
         * @method
         * @param {boolean} [val] - Sets the shortname when specified.
         * @returns {boolean} - The shortname when nothing is passed, or true/false if succeeded or failed when setting.
         */
        //get shortname(): string {
        //    return this.getset<string>("shortname");
        //}
        set shortname(input: string) {
            const val = this.getset("shortname", input, "string");
            // fire "changed" event
            this.triggerChange("shortname", val);
        }

        /**
         * Gets or sets the description.
         */
        get description(): string {
            return this.getset<string>("description");
        }
        set description(input: string) {
            const val = this.getset("description", input, "string");
            // fire "changed" event
            this.triggerChange("description", val);
        }

        /**
         * Gets or sets whether the param is enabled.
         */
        get enabled(): boolean {
            return this.getset<boolean>("enabled");
        }
        set enabled(input: boolean) {
            const val = this.getset("enabled", input, "boolean");
            // fire "changed" event
            this.triggerChange("enabled", val);
        }

        /**
         * Gets or sets the param data type.
         */
        get type(): ParamTypeName {
            return this.getset<ParamTypeName>("type");
        }
        set type(input: ParamTypeName) {
            const val = this.getset("type", input, "string");
            // fire "changed" event
            this.triggerChange("type", val);
        }

        /**
         * Gets or sets the param data subtype.
         */
        get subtype(): ParamSubTypeName {
            return this.getset<ParamSubTypeName>("type");
        }
        set subtype(input: ParamSubTypeName) {
            const val = this.getset("subtype", input, "string");
            // fire "changed" event
            this.triggerChange("subtype", val);
        }

        /**
         * Gets or sets the group value. This is used to group/categorize params into groups.
         */
        get typedata(): string {
            return this.getset<string>("typedata");
        }
        set typedata(input: string) {
            const val = this.getset("typedata", input, "string");
            // fire "changed" event
            this.triggerChange("typedata", val);
        }

        /**
         * Gets or sets whether the value should be coerced, using the type, subtype, and typedata values.
         */
        get coerce(): boolean {
            return this.getset<boolean>("coerce");
        }
        set coerce(input: boolean) {
            const val = this.getset("coerce", input, "boolean");
            // fire "changed" event
            this.triggerChange("coerce", val);
        }

        /**
         * Gets or sets whether the value should be coerced, using the type, subtype, and typedata values.
         */
        get defvalue(): unknown {
            return this.getset<unknown>("defvalue");
        }
        set defvalue(input: unknown) {
            const val = this.getset("defvalue", input);
            // fire "changed" event
            this.triggerChange("defvalue", val);
        }

        /**
         * Gets or sets the group value. This is used to group/categorize params into groups.
         */
        get group(): string {
            return this.getset<string>("group");
        }
        set group(input: string) {
            const val = this.getset("group", input, "string");
            // fire "changed" event
            this.triggerChange("group", val);
        }

        /**
         * Gets or sets the param binding. This is a CSS+Attributes selector.
         */
        get binding(): string {
            return this.getset<string>("binding");
        }
        set binding(input: string) {
            const val = this.getset("binding", input, "string");
            // fire "changed" event
            if (val !== undefined) {
                // update bindingQuery
                this.getset("bindingQuery", Svidget.DOM.select(val));
                this.triggerChange("group", val);
            }
        }

        get bindingQuery(): DOMQuery {
            return this.getset<DOMQuery>("bindingQuery");
        }

        /**
         * Gets or sets the sanitizer function for the param. The sanitizer function is called on set.
         * The sanitizer function takes a param and value (param, value) and returns the result value.
         * This can be a global function name, or a function.
         * @method
         * @param {Boolean} [val] - Sets the value when specified.
         * @returns {Boolean} - The value for a get, or true/false if succeeded or failed for a set.
         */
        get sanitizer(): string | SanitizerFunc {
            return this.getset<SanitizerFunc>("sanitizer");
        }
        set sanitizer(input: string | SanitizerFunc) {
            // bind can be string or function, so check for both, enforce
            let funcName: string;
            let func: SanitizerFunc;
            if (typeof input !== "function") {
                funcName = Svidget.convert(funcName, "string"); // coerce to string
                // update bindingFunc
                func = Svidget.findFunction(funcName) as SanitizerFunc;
            } else {
                func = input;
            }
            const val = this.getset("sanitizer", func);
            if (val !== undefined) {
                this.triggerChange("sanitizer", val);
            }
        }

        /**
         * Gets whether the param is attached to the widget.
         * @method
         * @returns {boolean}
         */
        get attached() {
            return this.parent != null && this.parent instanceof Widget;
        }

        // helpers

        private applyBinding(val: unknown): void {
            var bind = this.bindingQuery;
            if (bind == null) return;
            bind.setValue(val);
        }

        private applySanitizer(val: unknown): unknown {
            const func = this.sanitizer as SanitizerFunc;
            if (!func) return val;
            const returnVal = func.call(null, this, val);
            if (returnVal === undefined) return val; // if they didn't specify a return value, then just revert back to original val
            return returnVal;
        }

        private triggerChange(prop: keyof ParamProps, val: unknown): void {
            if (val !== undefined) {
                this.trigger("change", { property: prop, value: val });
            }
        }

        private validateValue(val: unknown): boolean {
            return true;
        }

        private coerceValue(val: unknown): unknown {
            return Svidget.convert(val, this.type, this.subtype, this.typedata);
        }

        /* REGION Events */

        onDeclaredChange(handler: EventHandlerFunc): boolean {
            return this.onChange(handler, null, Svidget.declaredHandlerName);
        }

        offDeclaredChange(): boolean {
            return this.offChange(Svidget.declaredHandlerName);
        }

        onDeclaredSet(handler: EventHandlerFunc): boolean {
            return this.onSet(handler, null, Svidget.declaredHandlerName);
        }

        offDeclaredSet(): boolean {
            return this.offSet(Svidget.declaredHandlerName);
        }

        /* REGION Misc */

        /**
         * Serializes the Param object for transport across a window boundary.
         * @method
         * @returns {boolean} - A generic serialized object representing the Param object.
         */
        toTransport(): ParamCore {
            // todo: use allProxyProperties and automate this
            var transport = {
                name: this.name,
                description: this.description,
                shortname: this.shortname,
                enabled: this.enabled,
                type: this.type,
                subtype: this.subtype,
                typedata: this.typedata,
                coerce: this.coerce,
                defvalue: this.defvalue,
                group: this.group,
                value: this.value,
                // binding: this.binding() // not accessible by proxy
            };
            return transport;
        }

        // overrides

        /**
         * Gets a string representation of this object.
         * @method
         * @returns {string}
         */
        toString(): string {
            return `[Svidget.Param { name: "${this.name}" }]`;
        }

        // todo: reactive version valueR returns function that always returns its live value
    }

    // todo: convert these to functions so that users can't manipulate
    /*
Svidget.Param.eventTypes = ["change", "set"];
Svidget.Param.optionProperties = ["type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"];
Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"]; // 0.1.3: removed "binding", 
Svidget.Param.writableProxyProperties = ["value"];

Svidget.extend(Svidget.Param, Svidget.ObjectPrototype);
Svidget.extend(Svidget.Param, Svidget.ParamPrototype);
Svidget.extend(Svidget.Param, new Svidget.EventPrototype(Svidget.Param.eventTypes));
*/

	export interface Param extends ParamBase {}
	
	Svidget.extend(Param, ParamBase, false);
}
