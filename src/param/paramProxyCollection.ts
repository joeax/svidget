/*****************************************
svidget.paramcollection.js

Defines a collection for Param objects.

Last Updated: 03-Sep-2014

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectCollection
Svidget.Action

******************************************/

namespace Svidget {
    /**
     * Represents a collection of Param objects.
     * @constructor
     * @augments ObjectCollection
     * @memberof Svidget
     * @param {array} array - An array of Param objects.
     * @param {Svidget.Widget} parent - The Widget instance that is the parent for this Param collection.
     */
    export class ParamProxyCollection extends ObjectCollection<ParamProxy> {
        constructor(items: Array<ParamProxy>, parent: WidgetReference) {
            super(items, parent, "Svidget.ParamProxyCollection");
        }

        //Svidget.ParamCollection.prototype = new Svidget.ObjectCollection;
        //Svidget.extend(Svidget.ParamCollection, {

        create(...args: any[]): undefined;
        create(
            name: string,
            value: unknown,
            options: ParamProxyOptions,
            parent: WidgetReference
        ): ParamProxy | undefined {
            // create param
            // call addObject
            if (name == null || typeof name !== "string") return;
            // ensure no other parameter exists in the collection by that name
            if (this.getByName(name) != null) return;
            // create obj
            var obj = new Svidget.ParamProxy(name, value, options, parent);
            //this.push(obj);
            return obj;
        }
    }
}
