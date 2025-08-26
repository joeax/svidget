/**
 * DOM utilities
 * Utility functions and classes for working with the DOM in the widget context.
 * Contains DOMQuery and DOMItem classes.
 * @module dom
 */

import { isArray } from './core';

/**
 * Represents the item type for an xml node.
 * @enum
 * @readonly
 */
export const nodeTypes = {
    element: 0,
    attribute: 1,
    text: 2,
};

export type NodeTypes = 'element' | 'attribute' | 'text';
export type DOMElement = HTMLElement | SVGElement;

/**
 * Represents xml namespaces used by this framework.
 * @enum
 * @readonly
 */
export const namespaces = {
    html: 'http://www.w3.org/1999/xhtml', // also used for HTML5
    svidget: 'http://www.svidget.org/svidget',
    svg: 'http://www.w3.org/2000/svg',
    xlink: 'http://www.w3.org/1999/xlink',
};

export interface NodeLike {
    type: number;
    name: string | null;
    namespace: string | null;
    value: string | null;
    elements?: NodeLike[];
    attributes?: NodeLike[];
}

export class DOM {
    // Wrapper for getElementById
    static get(sel: string): HTMLElement | null {
        if (!document.getElementById) return null;
        return document.getElementById(sel);
    }

    static getByName(tagName: string, asArray?: boolean): ArrayLike<Element> | null {
        return DOM.getChildrenByName(document, tagName, asArray);
    }

    static getByNameNS(
        namespace: string,
        tagName: string,
        asArray?: boolean
    ): ArrayLike<Element> | null {
        if (!document.getElementsByTagNameNS) return null;
        const tags = document.getElementsByTagNameNS(namespace, tagName);
        if (asArray) {
            return Array.from(tags);
        }
        return tags;
    }

    static getChildrenByName(
        source: Document | Element,
        tagName: string,
        asArray?: boolean
    ): ArrayLike<Element> | null {
        const tags = source.getElementsByTagName(tagName);
        if (asArray) {
            return Array.from(tags);
        }
        return tags;
    }

    static getElement(sel: string | Element): HTMLElement | Element | null {
        if (typeof sel === 'string') return DOM.get(sel);
        else return sel;
    }

    static getItem(sel: string): any {
        return DOM.wrap(DOM.get(sel));
    }

    static select(sel: string): DOMQuery | undefined {
        // if (!document.querySelectorAll) return null;
        if (sel == null) return undefined;
        const attrRX = /@[^=#\s]+/g;
        const hasAttr = attrRX.test(sel);
        const col = [];
        let res;

        function selectSingle(s: string): DOMItem[] {
            if (s == null) return [];
            const attrRXEnd = /@([^=#\s]+)$/g;
            let selStr = s;
            let attrName;
            const match = attrRXEnd.exec(s);
            if (match) {
                attrName = match[1];
                selStr = selStr.replace(match[0], '');
            }
            let eles;
            try {
                eles = document.querySelectorAll(selStr);
            } catch (ex) {
                return [];
            }
            const colArr = [];
            for (let i = 0; i < eles.length; i++) {
                const ele = eles[i];
                let item;
                if (attrName) {
                    item = DOM.attr(ele, attrName);
                    if (item != null) {
                        item = new DOMItem(item);
                    }
                } else {
                    item = new DOMItem(ele);
                }
                if (item) {
                    colArr.push(item);
                }
            }
            return colArr;
        }
        if (hasAttr) {
            const parts = sel.split(',');
            for (let i = 0; i < parts.length; i++) {
                res = selectSingle(parts[i]);
                if (res) col.push(...res);
            }
        } else {
            res = selectSingle(sel);
            if (res) col.push(...res);
        }
        return new DOMQuery(sel, col);
    }

    // static selectElement(sel: string | Element): Element | null {
    //     if (typeof sel === 'string') {
    //         const query = DOM.select(sel);
    //         if (query == null || query.length == 0) return null;
    //         return query!.at(0)?.source;
    //     } else if (DOM.isElement(sel)) return sel;
    //     else return null;
    // }

    static wrap(ele: HTMLElement): DOMItem {
        return new DOMItem(ele);
    }

    // currently not in use
    // static transportize(ele: Element): any {
    //     if (ele == null) return null;
    //     return {
    //         name: ele.localName,
    //         namespace: ele.namespaceURI,
    //         value: ele.value,
    //         // @ts-ignore: Svidget.NodeType is legacy
    //         type: ele.nodeType == 1 ? nodeTypes.element : ele.nodeType == 2 ? nodeTypes.attribute : null,
    //     };
    // }

    static root<TElement extends HTMLHtmlElement | SVGSVGElement>(): TElement {
        return document.documentElement as TElement;
    }

    static rootItem(): any {
        return DOM.wrap(DOM.root());
    }

    static attr(ele: any, attrName: string): any {
        return ele.attributes[attrName];
    }

    static attrValue(ele: any, attrName: string): any {
        const a = DOM.attr(ele, attrName);
        if (a) return a.value;
        return null;
    }

    static isAttrEmpty(ele: any, attrName: string): boolean {
        const av = DOM.attrValue(ele, attrName);
        return av != null && av.length == 0;
    }

    // static clone(item: DOMItem): void {
    //     // todo
    // }

    // static cloneDetached(item: DOMItem): void {
    //     // todo
    // }

    static isDOMNode(node: any): boolean | null {
        if (node == null) return null;
        return (
            node.namespaceURI != null &&
            node.localName != null &&
            node.nodeType != null &&
            (node.value != null || node.textContent != null) &&
            (node.nodeType == 1 || node.nodeType == 2)
        );
    }

    static fromNodeType(type: number): string | null {
        if (type == 1) return 'element';
        if (type == 2) return 'attribute';
        if (type == 3) return 'text';
        return null;
    }

    // static text(sel: string, text?: string): any {
    //     const obj = DOM.select(sel);
    //     if (text === undefined) return DOM.getText(obj);
    //     else DOM.setText(obj, text);
    // }

    static getText(obj: DOMElement): string | null {
        if (obj.textContent) return obj.textContent;
        else if (obj.innerHTML) return obj.innerHTML;
        else return null;
    }

    static setText(obj: DOMElement, text: string): void {
        if (obj.textContent) obj.textContent = text + '';
        else if (obj.innerHTML) obj.innerHTML = text + '';
    }

    static getDocument(objOrWinEle: any): Document | null | undefined {
        try {
            const doc = objOrWinEle.contentDocument;
            const doc2 =
                objOrWinEle.contentWindow != null ? objOrWinEle.contentWindow.document : null;
            if (doc != null && doc.URL == 'about:blank') return null;
            return doc;
        } catch (ex) {
            return undefined;
        }
    }

    static isElementDocumentReady(objOrWinEle: any): boolean {
        return DOM.getDocument(objOrWinEle) !== null;
    }

    static isElement(ele: any): boolean | undefined {
        // todo: fix this, won't work in node
        if (typeof HTMLElement === 'undefined') return undefined;
        return ele instanceof HTMLElement;
    }

    // static attach(containerEle: any, eles: any): void {
    //     // todo
    // }

    // static detach(sel: any): void {
    //     // todo
    // }

    static disable(ele: any): void {
        ele.disabled = true;
    }

    static enable(ele: any): void {
        ele.disabled = false;
    }

    static show(ele: any, val?: any): void {
        ele.style.display = 'initial';
        ele.style.visibility = 'visible';
    }

    static hide(ele: any, val?: any): void {
        ele.style.display = 'none';
        ele.style.visibility = 'hidden';
    }

    static on(obj: Element, type: string, callback: EventListener, capture?: boolean): boolean {
        capture = !!capture;
        let attached = false;
        if (obj.addEventListener) {
            obj.addEventListener(type, callback, capture);
            attached = true;
        }
        return attached;
    }

    static off(obj: Element, type: string, callback: EventListener, capture?: boolean): boolean {
        capture = !!capture;
        let detached = false;
        if (obj.removeEventListener) {
            obj.removeEventListener(type, callback, false);
            detached = true;
        }
        return detached;
    }
}

/**
 * Represents a query result for DOM elements in the widget context.
 */
export class DOMQuery {
    private _items: DOMItem[];
    private _selector: string;

    constructor(selector: string, items: DOMItem[]) {
        this._items = items;
        this._selector = selector;
    }

    get length(): number {
        return this._items.length;
    }

    /**
     * Gets the collection of items that are the result of the query.
     * @method
     * @returns {DOMItem[]} - the collection of DOMItems
     */
    items() {
        return this._items;
    }

    /**
     * Gets the item in the collection at the specified index.
     * @method
     * @param {number} index - The index
     * @returns {DOMItem[]} - the DOMItem at the specified index
     */
    at(index: number): DOMItem | undefined {
        return this._items[index];
    }

    hasItems(): boolean {
        return this._items.length > 0;
    }

    /**
     * Sets the value of each item in the collection.
     * @method
     * @returns {string}
     */
    setValue(val: string) {
        this._items.forEach((i) => i.value(val));
    }

    /**
     * Gets a string representation of this object.
     * @method
     * @returns {string}
     */
    toString() {
        return '[DOMQuery { selector: "' + this._selector + '", items: ' + this._items.length + '}]';
    }
}

/**
 * Represents a single DOM element in the widget context.
 */
export class DOMItem {
    private _source: Element | Attr | NodeLike;
    private _type: NodeTypes | null = null;
    private _typeCode: number | null = null;
    // Define missing private fields
    private _name: string | null = null;
    private _namespace: string | null = null;
    private _value: any = null;
    private _namespaceType: string | null = null;
    private _isDOMNode: boolean = false;
    private _cachedElements?: DOMItem[];
    private _cachedAttributes?: DOMItem[];

    constructor(source: Element | Attr | NodeLike) {
        this._source = source;
        const sourceDOM = DOM.isDOMNode(source); // ? source : null;
        if (sourceDOM) {
            const node = source as Element | Attr;
            this._typeCode = node.nodeType == 1 ? nodeTypes.element : node.nodeType == 2 ? nodeTypes.attribute : null;
            this._name = node.localName;
            this._namespace = node.namespaceURI;
            this._isDOMNode = true;
        } else {
            const node = source as NodeLike;
            this._typeCode = node.type;
            this._name = node.name;
            this._namespace = node.namespace;
        }
        this._value = getNodeValue(source);
        this._type = getType(this._typeCode);
        this._namespaceType = getNamespaceType(this._namespace);
    }

    get typeCode() {
        return this._typeCode;
    }

    //	type: function () {
    //		var type = this.typeCode();
    //		if (type == Svidget.NodeType.element) return "element";
    //		if (type == Svidget.NodeType.attribute) return "attribute";
    //		return null;
    //	},

    /**
     * Gets the element or attribute name of the item.
     * @method
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * Gets the element text content or the attribute value.
     * @method
     * @returns {string}
     */
    get value() {
        const source = this._source;
        return getNodeValue(source);
    }
    set value(val: any) {
        const strval = val + '';
        const source = this._source as NodeLike;
        if (source.value) source.value = strval;
        else (this._source as SVGElement).textContent = strval;
    }

    /**
     * Gets the namespace URI for the element or attribute item.
     * @method
     * @returns {string}
     */
    get namespace() {
        return this._namespace;
    }

    /**
     * Gets the namespace type i.e. html, svg, xlink, svidget, etc.
     * @method
     * @returns {string}
     */
    get namespaceType() {
        return this._namespaceType;
    }

    /**
     * Gets whether the item has child elements.
     * @method
     * @returns {boolean}
     */
    get hasElements(): boolean {
        if (this.isAttribute) return false;
        const source = this._source as DOMElement;
        if (this.isAttached || (source.children && source.children.length)) {
            return source.children.length > 0;
        }
        return false;
    }

    /**
     * Gets whether the item has attributes. False when the item is an attribute.
     * @method
     * @returns {boolean}
     */
    hasAttributes() {
        if (this.isAttribute) return false;
        const source = this._source as DOMElement;
        if (this.isAttached) {
            if (source.attributes && source.attributes.length) {
                return source.attributes.length > 0;
            }
        }
        return false;
    }

    /**
     * Gets whether the item is an attribute.
     * @method
     * @returns {boolean}
     */
    get isAttribute(): boolean {
        return this._type == 'attribute';
    }

    /**
     * Returns a collection of DOMItem objects representing child elements. Returns null if item is an attribute.
     * @method
     * @returns {DOMItem[] | null} - the collection of DOMItems or null
     */
    get elements(): DOMItem[] | null {
        // lazy load
        if (this._cachedElements != null && isArray(this._cachedElements)) return this._cachedElements;
        const isDOM = this.isAttached;
        const node = this.source as NodeLike;
        if (!isDOM && (!node.elements || !node.elements.length)) return null;
        const element = this.source as DOMElement;
        const origCol = isDOM ? element.children : node.elements;
        if (origCol == null) return null;
        const eles = Array.from(origCol as ArrayLike<Element | Attr>);
        const items = eles.map((e) => new DOMItem(e));
        this._cachedElements = items;
        return this._cachedElements;
    }

    /**
     * Returns a collection of DOMItem objects representing attributes. Returns null if item is an attribute.
     * @method
     * @returns {DOMItem[] | null} - the collection of DOMItems or null
     */
    attributes() {
        // lazy load
        if (this._cachedAttributes != null && isArray(this._cachedAttributes)) return this._cachedAttributes;
        const isDOM = this.isAttached;
        const source = this._source;
        const node = this.source as NodeLike;
        if (!isDOM && (!node.attributes || !node.attributes.length)) return null;
        const origCol = node.attributes;
        if (origCol == null) return null;
        const attrs = Array.from(origCol);
        const items = attrs.map((a) => new DOMItem(a));
        this._cachedAttributes = items;
        return this._cachedAttributes;
    }

    /**
     * Gets the underlying DOM object that this DOMItem instance wraps.
     * @method
     * @returns {(HTMLElement|HTMLAttribute)} - the underlying DOM object
     */
    get source() {
        return this._source;
    }

    /**
     * Returns whether the DOMItem actually wraps an underlying DOM object.
     * @method
     * @returns {boolean} - whether the DOMItem is attached to a DOM object
     */
    get isAttached(): boolean {
        return this._isDOMNode;
    }
}

function getType(typeCode: number | null): NodeTypes | null {
    if (typeCode == null) return null;
    if (typeCode == nodeTypes.element) return 'element';
    if (typeCode == nodeTypes.attribute) return 'attribute';
    return null;
}

function getNamespaceType(namespace: string | null): string | null {
    if (namespace == null) return null;
    for (const n of Object.keys(namespaces) as Array<keyof typeof namespaces>) {
        if (namespace === namespaces[n]) return n;
    }
    return null;
}

function getNodeValue(node: Element | Attr | NodeLike): string | undefined {
    // Assign value: if source has 'value' property, use it; else use textContent if available
    if ('value' in node && typeof (node as any).value !== 'undefined') {
        return (node as any).value;
    } else if ('textContent' in node && typeof (node as any).textContent !== 'undefined') {
        return (node as any).textContent;
    } else {
        return undefined;
    }
}



// /**
//  * Creates a new DOM element with the specified tag and optional attributes.
//  */
// export function createElement(tag: string, attrs?: Record<string, string>): Element {
//     const el = document.createElement(tag);
//     if (attrs) {
//         for (const [key, value] of Object.entries(attrs)) {
//             el.setAttribute(key, value);
//         }
//     }
//     return el;
// }

// /**
//  * Removes the specified element from the DOM.
//  */
// export function removeElement(el: Element): void {
//     if (el.parentElement) {
//         el.parentElement.removeChild(el);
//     }
// }

// /**
//  * Adds an event listener to the element.
//  */
// export function addEventListener(el: Element, type: string, listener: EventListenerOrEventListenerObject): void {
//     el.addEventListener(type, listener);
// }

// /**
//  * Removes an event listener from the element.
//  */
// export function removeEventListener(el: Element, type: string, listener: EventListenerOrEventListenerObject): void {
//     el.removeEventListener(type, listener);
// }
//