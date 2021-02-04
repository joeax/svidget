/*****************************************
svidget.objectcollection.js

Encapsulates a generic collection inherited by a complex collection.

Dependencies:
Svidget.Collection


******************************************/

/// <reference path="types.ts" />

namespace Svidget {
    
    /**
     * Represents a specialized collection for framework objects.
     * @constructor
     * @mixes Svidget.PropManagerMixin
     * @augments Svidget.Collection
     * @param {Array} array - The initial elements of the collection.
     * @param {Function} type - The type of objects that the collection should hold.
     */
    export abstract class ObjectCollection<
        T extends Artifact
    > extends ObjectBase<ArtifactCollectionProps, never> {
        public readonly __type = "Svidget.ObjectCollection";
        private readonly col: Collection<T>;
        //= function (array, type) {
        // todo: filter input array by type specified

        constructor(array?: Array<T>, parent: Artifact, typeName: string) {
            // Svidget.Collection.apply(this, [array]);
            super(undefined, parent, typeName);
            this.col = new Collection<T>(array);

            // private fields
            /*var privates = new (function () {
			this.writable = ["addedFunc", "removedFunc"];
			this.type = type;
			this.addedFunc = null;
			this.removedFunc = null;
		})();*/
            // private accessors
        }

        /*
var base = new Svidget.Collection;
Svidget.ObjectCollection.prototype = base;
Svidget.ObjectCollection.prototype.base_add = base.add;
Svidget.ObjectCollection.prototype.base_remove = base.remove;
Svidget.extend(Svidget.ObjectCollection, {
*/

        get items(): Collection<T> {
            return this.col;
        }

        /**
         * Gets the object type that this collection holds.
         * @method
         * @returns {Function} - The type constructor that represents the type.
         */
        get type(): string {
            return this.getset("type");
        }

        /**
         * Gets an item in the collection by its index (if number passed) or id/name (if string passed).
         * @method
         * @param {(string|number)} selector - The selector.
         * @returns {object} - The object in the collection.
         */
        get(selector: string | number): T | undefined {
            if (typeof selector === "number") return this.getByIndex(selector);
            return this.getByName(selector);
        }

        /**
         * Gets an item in the collection by its index.
         * @method
         * @param {number} selector - The index.
         * @returns {object} - The object in the collection.
         */
        getByIndex(index: number): T | undefined {
            if (index == null || isNaN(index)) return null;
            index = parseInt(index);
            var res = this[index];
            return res; // return null if not found
        }

        /**
         * Gets an item in the collection by its name.
         * @method
         * @param {string} selector - The name.
         * @returns {object} - The object in the collection.
         */
        getByName(name: string) {
            return this.col.first((p) => p.name === name);
        }

        /**
         * Adds an item to the collection.
         * @method
         * @param {object} obj - The item to add.
         * @returns {boolean} - The item that was added.
         */
        add(item: string | T) {
            if (arguments.length == 0) return null;
            // call add overload
            var item;
            var arg0;
            var success;
            if (arguments.length >= 1) arg0 = arguments[0];
            if (typeof arg0 === "string") {
                item = this.create.apply(this, arguments);
                //success = item != null;
            } else {
                item = arg0;
                //success = this.addObject(arg0);
            }
            if (item == null) return null;
            success = this.addObject(item);
            if (!success) return null;
            // if succeeded, notify widget
            this.triggerOnAdded(item);

            return item;
        }

        addObject(obj: Base): Base | undefined {
            // ensure obj is a valid Param
            if (obj == null || !obj instanceof this.type) return;
            // ensure no other parameter exists in the collection by that name
            if (obj.name !== undefined && this.getByName(obj.name)) return;
            // add to collection
            this.col.push(obj);
            return obj;
        }

        /**
         * Creates and returns the item.
         * @abstract
         */
        create(...args: any[]): T | undefined {
            // override me
            return;
        }

        /*
		addCreate: function (name, value, options) {
			// create param
			// call addObject
			if (name == null || !typeof name === "string") return false;
			// ensure no other parameter exists in the collection by that name
			if (this.getByName(name) != null) return false;
			// create obj
			var obj = new Svidget.Param(name, value, options);
			this.push(obj);
			return true;
		},
*/

        /**
         * Removes an item from the collection. Only removes the first instance of the item found.
         * @method
         * @param {object} obj - The item to remove.
         * @returns {boolean} - True if remove succeeds.
         */
        remove(name) {
            var item = this.getByName(name);
            if (item == null) return false;
            var success = this.col.remove(item);
            if (!success) return false;
            // if succeeded, notify widget
            this.triggerOnRemoved(item);
            return true;
        }

        /**
         * Wraps the specified item in a new ObjectCollection.
         * @method
         * @param {object} item - The item to make a collection from.
         * @returns {Svidget.Collection} - The collection.
         */
        wrap(item: T) {
            var items = [item];
            if (item == null || !item instanceof this.type()) items = [];
            //var col = new this.constructor(items, this.parent);
            // 0.3.0: wrap as a plain jane collection
            var col = new Svidget.Collection(items); //, this.parent);
            return col;
        }

        /* REGION Events */

        // internal
        // wires up an internal handler when an item is added to the collection
        onAdded(func: DispatchFunc<T>) {
            this.getset("addedFunc", func);
        }

        // internal
        // wires up an internal handler when an item is removed from the collection
        onRemoved(func: DispatchFunc<T>) {
            this.getset("removedFunc", func);
        }

        // private
        triggerOnAdded(item: T) {
            var func = this.getset<DispatchFunc<T>>("addedFunc");
            if (func) func(item);
        }

        // private
        triggerOnRemoved(item: T) {
            var func = this.getset<DispatchFunc<T>>("removedFunc");
            if (func) func(item);
        }
    } //, true);   // overwrite base methods, copied above

    //Svidget.extend(Svidget.Collection, Svidget.ObjectPrototype);
}
