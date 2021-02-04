/*****************************************
svidget.objectprototype.js

Contains common prototype functionality for all common Svidget objects.

Dependencies:
svidget.core.js


******************************************/

/// <reference path="collection.ts" />
/// <reference path="enums.ts" />
/// <reference path="helpers.ts" />
/// <reference path="types.ts" />

namespace Svidget {

    /**
     * Manages access to a single object containing all the props for the consumer.
     * @class
     * @memberof Svidget
     */
    export class PropContainer<TProps> {
        private readonly props: TProps;

        constructor(options: TProps) {
            this.props = options ?? {} as TProps;
        }

        // protected
        // as of 0.3.0: type argument converts val to type
        // as of 0.5.0: returns final value stored in set mode
        getset<TType extends unknown>(
            name: keyof TProps,
            val?: TType,
            type?: ParamTypeName
        ): TType {
            // ** get mode
            const curValue = this.props[name];
            if (val === undefined) return curValue as TType;
            // ** set mode
            let finalVal = val;
            // first, convert if needed
            if (type != null) finalVal = Svidget.convert(val, type);
            // if value is current value then do nothing
            if (finalVal === curValue) return;
            // then, validate
            // if (validator && !validator.call(this, finalVal)) return; // throw error?
            // finally, commit the value
            (this.props as Record<string, unknown>)[name as string] = finalVal as unknown;

            return finalVal;
        }

    }
}
