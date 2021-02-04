namespace Svidget {
    const enableLogging = true;

    export function readOnlyProperty(value: any): PropertyDescriptor {
        return {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value,
        };
    }

    export function fixedProperty(value: any): PropertyDescriptor {
        return {
            enumerable: true,
            configurable: false,
            writable: true,
            value: value,
        };
    }

    export function returnFalse(): boolean {
        return false;
    }

    export function returnTrue(): boolean {
        return true;
    }

    export function log(...items: any[]): void {
        if (!enableLogging) return;
        console.log(items);
    };

    /*
// SUMMARY
// Extends a class with members in the prototype object.
// REMARKS
// This is handle in a multiple prototype inheritance scenario. This function can be called for multiple prototypes.
// This is useful for extending native object prototypes as well.

export function extendOLD = function (objtype, prototype, overwrite) {
    for (var methodName in prototype) {
        // do we check for hasOwnProperty here?
        if (overwrite || objtype.prototype[methodName] === undefined) {
            objtype.prototype[methodName] = prototype[methodName];
        }
    }
};
*/
    export function extend(
        targetType: any,
        baseType: any,
        overwrite: boolean
    ): void {
        Object.getOwnPropertyNames(baseType.prototype).forEach((name) => {
            if (
                overwrite ||
                Object.getOwnPropertyDescriptor(targetType.prototype, name) ===
                    undefined
            ) {
                //targetType.prototype[name] === undefined) {
                Object.defineProperty(
                    targetType.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseType.prototype, name) ||
                        Object.create(null)
                );
            }
        });
    }

    // Find the function by name in the specified scope, or just return it if is already a function
    // By default scope == global scope
    export function findFunction(funcNameOrInstance: string | Function, scope?: unknown): Function {
        if (typeof funcNameOrInstance === "function") {
            return funcNameOrInstance;
        }
        if (scope == null) scope = window; // global scope
        if (funcNameOrInstance != null) {
            var bind = funcNameOrInstance + ""; //coerce to string
            var func = scope[bind];
            if (func == null && scope !== global) {
                func = global[bind];
            }
            if (func == null) return null;
            if (typeof func === "function") return func;
            // bind is an expression, so just wrap it in a function
            if (bind.substr(0, 7) != "return ")
                return new Function("return " + bind);
            else return new Function(bind);
        }
        return null;
    }

    export function array(anyCollection) {
        // oops, we need a collection with a length property
        if (!anyCollection || !anyCollection.length) return null;
        try {
            // this may blow up for IE8 and below and other less than modern browsers
            return Svidget.emptyArray.slice.call(anyCollection, 0);
        } catch (e) {
            // iterate the old fashioned way and push items onto array
            var res = [];
            for (var i = 0; i < anyCollection.length; i++) {
                res.push(anyCollection[i]);
            }
            return res;
        }
    }

    export function bind<TFunc extends Function>(func: TFunc, bindTarget: any): TFunc | undefined {
        if (!isFunction(func)) return;
        return func.bind(bindTarget);
    }

    export function isFunction(func): boolean {
        return typeof func === "function";
    }

    export function isString(str: any): boolean {
        return (
            typeof str === "string" || (str.length && str.trim && str.charAt)
        );
    }

    export function isColor(color: string) {
        // todo
        return false;
    }

    export function convert(val: unknown, type: ParamTypeName, subtype?: ParamSubTypeName, typedata?: string) {
        return Svidget.Conversion.to(val, type, subtype, typedata);
    }

    export function getType(val) {
        if (val == null) return Svidget.defaultType; // object is the default type (as of 0.3.0, formerly "string")
        if (Array.isArray(val)) return "array";
        var type = typeof val;
        // if (type === "boolean") return "bool"; // as of 0.3.0 using "boolean" not "bool"
        if (type === "string" || type === "number" || type === "boolean")
            return type;
        return "object";
    }

    // Given a type, determines if it is valid and if not returns the default type.
    export function resolveType(type: string): ParamTypeName {
        const resultType = Svidget.Conversion.toString(type);
        if (Svidget.ParamTypes[type] === undefined) return Svidget.defaultType;
        if (type === "bool") return "boolean";
        return resultType as ParamTypeName;
    }

    // Given a subtype, determines if it is valid and if not returns null.
    export function resolveSubType(type: string, subtype: string): ParamSubTypeName | undefined {
        const resolvedType = Svidget.resolveType(type);
        if (Svidget.ParamSubTypes[subtype] === undefined) return; //subtype is not valid, so return null
        if (
            resolvedType == "string" &&
            (subtype == "color" || subtype == "regex" || subtype == "color")
        )
            return subtype;
        if (resolvedType == "number" && subtype == "integer") return subtype;
    }

    export function configureBaseMixin<TProps, TEventTypes>(mixin: BaseMixin<TProps, TEventTypes>, base: Base<TProps, TEventTypes>) {
        if (base !== undefined) return;
        const basable = mixin as unknown as Base<TProps, TEventTypes>;
        basable.getset = base.getset.bind(mixin);
        basable.on = base.on.bind(mixin);
        basable.off = base.off.bind(mixin);
        basable.trigger = base.trigger.bind(mixin);
    }
}
