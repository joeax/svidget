/**
 * Collections utilities
 * Utility functions for working with collections of widgets, params, actions, and events.
 * @module collections
 */

interface Nameable {
  name: string;
}

/**
 * Finds an item in a collection by name.
 * @param collection Array of items with a 'name' property
 * @param name Name to search for
 */
export function findByName<T extends Nameable>(collection: T[], name: string): T | undefined {
    return collection.find((item) => item.name === name);
}

/**
 * Adds an item to a collection if not already present by name.
 * @param collection Array of items with a 'name' property
 * @param item Item to add
 */
export function addUniqueByName<T extends Nameable>(collection: T[], item: T): boolean {
    if (!findByName(collection, item.name)) {
        collection.push(item);
        return true;
    }
    return false;
}

/**
 * Removes an item from a collection by name.
 * @param collection Array of items with a 'name' property
 * @param name Name of item to remove
 */
export function removeByName<T extends Nameable>(collection: T[], name: string): boolean {
    const idx = collection.findIndex((item) => item.name === name);
    if (idx >= 0) {
        collection.splice(idx, 1);
        return true;
    }
    return false;
}

/**
 * Gets an item in the collection by its index.
 * @method
 * @param {number} selector - The index.
 * @returns {object} - The object in the collection.
 */
export function getByIndex<T extends Nameable>(col: T[], index: number | string): T | null {
    if (index == null || typeof index !== 'number' || isNaN(index)) return null;
    const numIndex = parseInt(index.toString()) as number;
    var res = col[numIndex];
    return res == null ? null : res; // return null if not found
}

/**
 * Gets an item in the collection by its name.
 * @method
 * @param {string} selector - The name.
 * @returns {object} - The object in the collection.
 */
export function getByName<T extends Nameable>(col: T[], name: string): T | null {
    return col.find((item) => item.name === name) || null;
}

/**
 * Selects items from a collection based on a selector, either
 * Should always return a collection.
 * @param col The collection object with wrap, getByIndex, where, getByName methods.
 * @param selector The selector, can be number, function, or string.
 */
export function select<T extends Nameable>(col: T[], selector: number | string | ((item: any) => boolean)): any {
    if (typeof selector === 'number') {
        const idx = parseInt(selector.toString()); // coerce to integer
        return [getByIndex(col, idx)];
    } else if (typeof selector === 'function') {
        return col.filter(selector);
    }
    if (selector !== undefined) return [getByName(col, selector + '')];
    // todo: should we clone collection?
    return col;
}

/**
 * Selects the first item from a collection based on a selector.
 * Should always return a single item.
 * @param col The collection object with getByIndex, first, getByName methods.
 * @param selector The selector, can be number, function, or string.
 */
export function selectFirst<T extends Nameable>(col: T[], selector: number | string | ((item: any) => boolean)): any {
    if (typeof selector === 'number') {
        const idx = parseInt(selector.toString()); // coerce to integer
        return getByIndex(col, idx);
    } else if (typeof selector === 'function') {
        return col.find(selector);
    }
    if (selector !== undefined) return getByName(col, selector + '');
    return col[0] || null;
}
