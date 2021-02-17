/*****************************************
svidget.collection.js

Defines a generic collection that extends JavaScript Array.

Last Updated: 03-Sep-2014

Dependencies:
svidget.core.js


******************************************/

namespace Svidget {
    export type CollectionIterateFunc<T> = (item: T) => unknown;
    export type CollectionPredicateFunc<T> = (item: T) => boolean;

    /**
     * Represents a structured collection. Extends Array by providing additional methods to select, tranverse, and modify an array.
     * @constructor
     * @augments Array
     * @param {Array} array - The initial elements of the collection.
     */
    export class Collection<T> extends Array<T> {
        public readonly __type = "Svidget.Collection";

        constructor(array?: Array<T>) {
            super();
            if (
                array &&
                (Array.isArray(array) || Array.prototype.isPrototypeOf(array))
            ) {
                this.push.apply(this, array);
            }
        }

        /**
         * Iterates on each item in the collection and performs the operation.
         * Similar to forEach, except that if the function returns false it will break.
         * @method
         * @param {Function} operation - A function that accepts an item as input.
         */
        iterate(operation: CollectionIterateFunc<T>): void {
            for (var i = 0; i < this.length; i++) {
                var res = operation(this[i]);
                if (res === false) break; // if function returns false, it is requesting a break
            }
        }

        /**
         * Returns the first item in the collection that satisfies the condition in the specified predicate function.
         * @method
         * @param {Function} predicate - A function that accepts an item as input and returns true/false.
         * @returns {object} - The item in the collection.
         */
        first(predicate?: CollectionPredicateFunc<T>): T | undefined {
            if (this.length == 0) return;
            if (predicate == null || typeof predicate !== "function")
                return this[0];
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) return this[i];
            }
        }

        /**
         * Returns the last item in the collection that satisfies the condition in the specified predicate function.
         * @method
         * @param {Function} predicate - A function that accepts an item as input and returns true/false.
         * @returns {object} - The item in the collection.
         */
        last(predicate?: CollectionPredicateFunc<T>): T | undefined {
            if (this.length == 0) return;
            if (predicate == null || typeof predicate !== "function")
                return this[0];
            for (var i = this.length - 1; i >= 0; i--) {
                if (predicate(this[i])) return this[i];
            }
            return null;
        }

        /**
         * Returns the last item in the collection that satisfies the condition in the specified predicate function.
         * @method
         * @param {Function} predicate - A function that accepts an item as input and returns true/false.
         * @returns {object} - The item in the collection.
         */
        where(predicate?: CollectionPredicateFunc<T>): Collection<T> {
            if (predicate == null || typeof predicate !== "function")
                return new Collection(this);
            else {
                const items = this.filter(predicate);
                return new Collection(items);
            }
        }

        /*
	// others, if needed:
	// average
	// min
	// max
	// sum
	// agg (generic aggregate function)
	// concat
	// union
	// intersect
	// zip
	*/

        // modifiers

        /**
         * Adds an item to the collection, verifying uniqueness.
         * @method
         * @param {object} obj - The item to add.
         * @returns {boolean} - True if add succeeds.
         */
        add(item: T): boolean {
            var pos = this.indexOf(item);
            if (pos >= 0) return false;
            this.push(item);
            return true;
        }

        /**
         * Adds an array of items to the collection.
         * @method
         * @param {Array} array - The items to add.
         * @returns {boolean} - True if add succeeds.
         */
        addRange(array: Array<T>): boolean {
            if (!Array.isArray(array)) return false;
            this.add.apply(this, array);
            return true;
        }

        /**
         * Inserts an item to the collection at the specified index.
         * @method
         * @param {object} obj - The item to add.
         * @param {number} index - The items to add.
         * @returns {boolean} - True if add succeeds.
         */
        insert(item: T, index: number): boolean {
            if (!isNaN(index) && (index < 0 || index > this.length))
                return false;
            this.splice(index, 0, item);
            return true;
        }

        /**
         * Removes an item from the collection. Only removes the first instance of the item found.
         * @method
         * @param {object} obj - The item to remove.
         * @returns {boolean} - True if remove succeeds.
         */
        remove(item: T): boolean {
            var pos = this.indexOf(item);
            if (pos < 0) return false;
            this.splice(pos, 1);
            return true;
        }

        /**
         * Removes an item from the collection. Removes all instances of the item.
         * @method
         * @param {object} obj - The item to remove.
         * @returns {boolean} - True if remove succeeds.
         */
        removeAll(item: T): boolean {
            var removed = false;
            while (this.remove(item)) {
                removed = true;
            }
            return removed;
        }

        /**
         * Clears all items in the collection.
         * @method
         * @returns {boolean} - True after collection cleared.
         */
        clear(): boolean {
            this.splice(0, this.length);
            return true;
        }

        /**
         * Removes an item from the collection based on the specified predicate function.
         * @method
         * @param {Function} predicate - A function that accepts an item as input and returns true/false.
         * @returns {boolean} - True if remove succeeds.
         */
        removeWhere(predicate: CollectionPredicateFunc<T>): boolean {
            const result = [];
            let removed = false;
            for (var i = 0; i < this.length; i++) {
                if (predicate(this[i])) result.push(this[i]);
            }
            for (var i = 0; i < result.length; i++) {
                removed = this.remove(result[i]) || removed;
            }
            return removed;
        }

        // misc

        clone(): Collection<T> {
            return new Collection(this);
        }

        /**
         * Returns a new array based on items in the collection.
         * @method
         * @returns {Array}
         */
        toArray(): Array<T> {
            return [...this];
        }
    }
}
