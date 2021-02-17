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
/// <reference path="../core/types.ts" />
/// <reference path="../dom/domQuery.ts" />

namespace Svidget {
    export type SanitizerFunc = (input: string) => unknown;

    // Represents the intersection of properties for Param, ParamProxy, and ParamOptions
    export interface ParamCore {
        //name: string;
        value: unknown;
        shortname: string;
        description: string;
        enabled: boolean;
        type: ParamTypeName;
        subtype: ParamSubTypeName;
        typedata: string;
        coerce: boolean;
        group: string;
        defvalue: unknown;
    }

    export interface ParamTransport extends ParamCore, Transport {}

    // Represents the props that are stored internally by Params
    export interface ParamProps extends Partial<Omit<ParamCore, "name">>, ArtifactProps {
        binding?: string;
        bindingQuery?: DOMQuery;
        sanitizer?: SanitizerFunc | string;
    }

    // Represents the interface that describes the Param
    export interface ParamArtifact extends Omit<ParamProps, "name">, WidgetArtifact {
        readonly bindingQuery: DOMQuery;
    }

    // Represents the object that the Param is initialized with
    export interface ParamOptions extends Partial<Omit<ParamCore, "name" | "value">>, BaseOptions {
        sanitizer?: SanitizerFunc | string;
        binding?: string;
    }

    export interface ParamProxyOptions extends ParamCore, BaseOptions {}

    // Represents the props that are exposed by the proxy to the actual Param
    export interface ParamProxyProps extends Readonly<Omit<ParamCore, "value">>, ProxyProps {
        value: unknown;
    }

    /*export interface ParamProxyPropsXXX extends ProxyProps {
        readonly shortname: string;
        readonly description?: string;
        readonly enabled?: boolean;
        readonly type: ParamTypeName;
        readonly subtype?: ParamSubTypeName;
        readonly typedata?: string;
        readonly coerce?: boolean;
        readonly group: string;
        readonly defvalue?: string;
        value: unknown;
    }*/

    export type ParamEventTypes = "change" | "set";
    export type ParamProxyEventTypes = ParamEventTypes | ProxyEventTypes;

    export const ParamDescriptor: ArtifactDescriptor<ParamCore> = {
        value: null,
        shortname: undefined,
        description: undefined,
        enabled: undefined,
        type: undefined,
        subtype: undefined,
        typedata: undefined,
        coerce: undefined,
        group: undefined,
        defvalue: undefined,
    }
}

/*

	//Svidget.Param.optionProperties = ["type", "subtype", "binding", "sanitizer", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"];
	//Svidget.Param.allProxyProperties = ["name", "value", "type", "subtype", "enabled", "shortname", "defvalue", "typedata", "coerce", "group"]; // 0.1.3: removed "binding", 
	//Svidget.Param.writableProxyProperties = ["value"];


		this.writable = ["shortname", "binding", "enabled", "type", "subtype", "value", "description", "defvalue", "typedata", "coerce", "group"];
		this.name = c.toString(name);
		this.shortname = c.toString(options.shortname);
		this.description = c.toString(options.description);
		this.enabled = options.enabled != null ? c.toBool(options.enabled) : true;
		this.type = resolveType(options.type, value, options.defvalue); // infer type from value/defvalue if type is null/undefined
		this.subtype = c.toString(options.subtype); // resolveSubtype(this.type, options.subtype);
		this.typedata = c.toString(options.typedata);
		this.coerce = c.toBool(options.coerce); // default is false
		this.group = c.toString(options.group);
		this.value = this.coerce ? resolveValue(value, this.type, this.subtype, this.typedata) : value;
		this.defvalue = options.defvalue; // note: only coerced to type when used as a value
		this.sanitizer = (!Svidget.isFunction(options.sanitizer) ? c.toString(options.sanitizer) : options.sanitizer) || null;
		this.parent = parent;
		this.binding = c.toString(options.binding);
		this.bindingQuery = null;

*/
