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

    // Represents the intersection of properties for Param, ParamProxy, and ParamOptions
    export interface WidgetCore {
        id: string;
        enabled: boolean;
        connected: boolean;
        started: boolean;
    }

    // Represents the props that are stored internally by Params
    export interface WidgetProps extends Partial<WidgetCore>, ArtifactProps {
        //binding?: string;
        //bindingQuery?: DOMQuery;
        //sanitizer?: SanitizerFunc | string;
        populatedFromPage: boolean;
    }

    // Represents the interface that describes the Param
    export interface WidgetArtifact extends WidgetProps, Artifact {
        //readonly bindingQuery: DOMQuery;
    }

    // Represents the object that the Param is initialized with
    export interface WidgetOptions extends Partial<Omit<ParamCore, "name" | "value">>, BaseOptions {
        sanitizer?: SanitizerFunc | string;
        binding?: string;
    }

    export interface WidgetReferenceOptions extends ParamCore, BaseOptions {}



    // Represents the props that are exposed by the proxy to the actual Param
    export interface WidgetReferenceProps extends Readonly<Omit<ParamCore, "value">>, ProxyProps {
        value: unknown;
    }

    export type WidgetEventTypes = "change" | "set";
    export type WidgetReferenceEventTypes = ParamEventTypes | ProxyEventTypes;


}
