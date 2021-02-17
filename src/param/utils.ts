namespace Svidget {
    export function transformToParamProps(options: ParamOptions, name: string, value: unknown): ParamProps {
        const c = Conversion;
        // infer type from value/defvalue if type is null/undefined
        const type = resolveType(options.type, value, options.defvalue);
        // note: this was commented out, find out why (2021)
        const subtype = resolveSubtype(type, options.subtype); // resolveSubtype(type, options.subtype);
        const typedata = c.toString(options.typedata);
        const coerce = c.toBool(options.coerce); // default is false
        const binding = c.toString(options.binding);
        return {
            name: c.toString(name),
            external: options.external ? c.toBool(options.external) : true,
            shortname: c.toString(options.shortname),
            description: c.toString(options.description),
            enabled: options.enabled != null ? c.toBool(options.enabled) : true,
            type: type,
            subtype: subtype,
            typedata: typedata,
            coerce: coerce,
            group: c.toString(options.group),
            value: coerce
                ? resolveValue(value, type, subtype, typedata)
                : value,
            defvalue: options.defvalue, // note: only coerced to type when used as a value
            sanitizer: resolveSanitizer(options.sanitizer),
            //parent: parent;
            binding: c.toString(options.binding),
            bindingQuery: Svidget.DOM.select(binding),
        };
    }

    export function transformToParamProxyProps(options: ParamProxyOptions, name: string, value: unknown): ParamProxyProps {
        const paramProps = transformToParamProps(options, name, value);
        return {...paramProps, connected: true } as ParamProxyProps;
    }

    function resolveType(type, value, defvalue) {
        // infer the type from the value or defvalue
        value = value != null ? value : defvalue;
        if (type == null) type = Svidget.getType(value);
        else type = Svidget.resolveType(type); // normalize type to a valid type
        return type;
    }

    function resolveSubtype(type, subtype) {
        return Svidget.resolveSubType(type, subtype);
    }

    function resolveValue(val, type, subtype, typedata) {
        return Svidget.convert(val, type, subtype, typedata);
    }

    function resolveSanitizer(
        sanitizer: SanitizerFunc | string | undefined
    ): SanitizerFunc | string {
        const c = Svidget.Conversion;
        if (sanitizer == null) return;
        Svidget.isFunction(sanitizer)
            ? sanitizer
            : Svidget.findFunction(sanitizer as string);
        return !Svidget.isFunction(sanitizer)
            ? c.toString(sanitizer)
            : sanitizer;
    }
}
