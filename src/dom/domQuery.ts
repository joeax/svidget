/*****************************************
svidget.domquery.js

Contains the definition of the DOMQuery object, which acts as a container of one or more attributes or elements returned from a select query.

Dependencies:
Svidget.Core
Svidget.DOM
Svidget.DOMItem

******************************************/

namespace Svidget {
    /**
     * Represents the result of a DOM query. Chainable. Behaves similar to a jQuery object.
     * @class
     * @param {Array} domItemCollection - An array or array-like collection of DOMItem objects.
     * @param {string} selector - The selector used to get the items for this query.
     */
    export class DOMQuery {
        private readonly __type = "Svidget.DOMQuery";
        private readonly _items: Collection<DOMItem>;
        private readonly _selector: string;

        //function (domItemCollection, selector) {
        constructor(nodes: Collection<DOMNode>, selector: string) {
            // wrap nodes as collection of DOMItem objects
            this._items = new Collection(
                nodes.map((node) => new DOMItem(node))
            );
            this._selector = selector;
        }

        /**
         * Gets the collection of items that are the result of the query.
         * @method
         * @returns {Svidget.Collection<DOMItem>}
         */
        get items(): Collection<DOMItem> {
            return this._items;
        }

        /**
         * Gets the number of items in the query.
         * @method
         * @returns {Svidget.Collection<DOMItem>}
         */
        get length(): number {
            return this._items.length;
		}
		
		/**
         * Gets the selector string used for this query.
         * @method
         * @returns {string}
         */
        get selector(): string {
            return this._selector;
        }

        /**
         * Gets the item in the collection at the specified index.
         * @method
         * @param {number} index - The index
         * @returns {Svidget.Collection}
         */
        item(index) {
            return this._items?.[index];
        }

        /**
         * Gets whether the collection has any items.
         * @method
         * @returns {boolean}
         */
        hasItems() {
            //return this.items().length > 0;
            return this.length > 0;
        }



        /**
         * Sets the value of each item in the collection.
         * @method
         * @returns {string}
         */
        setValue(val): void {
            this._items.iterate((item) => (item.value = val));
        }

        /**
         * Gets a string representation of this object.
         * @method
         * @returns {string}
         */
        toString(): string {
            return (
                `[Svidget.DOMQuery { selector: "${this.selector}", items length: ${this.items.length}}]`
            );
        }
    }
}
