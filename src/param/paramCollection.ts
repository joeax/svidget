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
    export class ParamCollection extends ObjectCollection<Param> {
        constructor(items: Array<Param>, parent: Widget) {
            super(items, parent, "Svidget.ParamCollection");
        }

        //Svidget.ParamCollection.prototype = new Svidget.ObjectCollection;
        //Svidget.extend(Svidget.ParamCollection, {

        create(...args: any[]): undefined;
        create(
            name: string,
            value: unknown,
            options: ParamOptions,
            parent: Widget
        ): Param | undefined {
            // create param
            // call addObject
            if (name == null || typeof name !== "string") return;
            // ensure no other parameter exists in the collection by that name
            if (this.getByName(name) != null) return;
            // create obj
            var obj = new Svidget.Param(name, value, options, parent);
            //this.push(obj);
            return obj;
        }
    }
}
