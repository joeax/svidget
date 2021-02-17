/*****************************************
svidget.DOM.js

Contains methods for working with DOM elements.

Dependencies:
Svidget.Core
Svidget.Collection

******************************************/

/*
// Valid Selectors
// element itself
// "someid" - reference to element
// "#someid" - reference to element
// ".someid" - reference to element class

// https://developer.mozilla.org/en-US/docs/Web/API/document.querySelectorAll
*/

/* Svidget.DOM */

namespace Svidget {
    /**
     * A collection of methods for working with DOM elements.
     * @static
     * @memberof Svidget
     */
    export class DOM {
        // REMARKS
        // Wrapper for getElementById
        static get(sel: string): HTMLElement | undefined {
            if (!document.getElementById) return;
			return document.getElementById(sel);
        }

		static getByName(tagName: string, asCollection: false): HTMLCollectionOf<Element>;
		static getByName(tagName: string, asCollection: true): Collection<HTMLElement>;
		static getByName(tagName: string, asCollection: boolean): HTMLCollectionOf<Element> | Collection<HTMLElement> {
			return this.getChildrenByName(document, tagName, asCollection);
		}

        static getByNameNS(
            namespace: Svidget.Namespaces,
            tagName: string,
            asCollection: boolean
        ) {
            if (!document.getElementsByTagNameNS) return null;
            var tags = document.getElementsByTagNameNS(namespace, tagName);
            if (asCollection) {
                return new Svidget.Collection(Svidget.array(tags));
            }
            return tags;
        }

        // Gets elements by tag name belonging to the svidget namespace
        static getByNameSvidget(tagName: string, asCollection: boolean) {
            return this.getByNameNS(
                Svidget.Namespaces.svidget,
                tagName,
                asCollection
            );
        }

        static getChildrenByName(
            source: HTMLDocument,
            tagName: string,
            asCollection: boolean
        ): HTMLCollectionOf<Element> | Collection<HTMLElement> {
            var tags = source.getElementsByTagName(tagName);
            if (asCollection) {
                return new Svidget.Collection(Svidget.array(tags));
            }
            return tags;
        }

        // if sel is a string calls get()
        static getElement(sel: string | HTMLElement): HTMLElement {
            if (typeof sel == "string") return this.get(sel);
            else return sel;
        }

        // gets an element by ID and returns a DomItem
        static getItem(sel) {
            return this.wrap(this.get(sel));
        }

        // returns a DomQuery object
        static select(sel: string): DOMQuery {
            // todo: support jQuery selector if querySelectorAll fails, it might be loaded on the page so we might as well use it if we can
            if (!document.querySelectorAll) return null;
            if (sel == null) return; // new Svidget.DomQuery();
            // use querySelectorAll
            var attrRX = /@[^=#\s]+/g;
            var hasAttr = attrRX.test(sel);
            var col = new Collection<DOMNode>();
            var res;
            // if selector has an attribute in it, split it first by comma
            if (hasAttr) {
                var parts = sel.split(",");
                for (var i = 0; i < parts.length; i++) {
                    res = selectSingle(parts[i]);
                    if (res) col.addRange(res);
                }
            } else {
                res = selectSingle(sel);
                // its possible selector was bad, in which case we get null, so check
                if (res) col.addRange(res);
            }

            const query = new DOMQuery(col, sel);
            return query;

            // given a selector string free from any commas, looks up the elements/attributes for it
            // and returns a collection.
            function selectSingle(s: string): Collection<DOMNode> | undefined {
                if (s == null) return;
                var attrRXEnd = /@([^=#\s]+)$/g;
                var sel = s;
                var attrName;
                var match = attrRXEnd.exec(s);
                if (match) {
                    attrName = match[1]; // match the subgroup
                    sel = sel.replace(match[0], ""); //strip out attr portion (i.e. @attr)
                }
                // query
                var eles;
                try {
                    eles = document.querySelectorAll(sel);
                } catch (ex) {
                    // seelctor was invalid, so just return null
                    return;
                }
                // build collection
                var col: DOMNode[] = [];
                for (var i = 0; i < eles.length; i++) {
                    var ele = eles[i];
                    var item;
                    if (attrName) {
                        var attr = DOM.attr(ele, attrName);
                        if (attr != null) {
                            item = new DOMItem(attr);
                        }
                    } else {
                        item = new DOMItem(ele);
                    }
                    if (item) {
                        col.push(item);
                    }
                }

                return new Collection(col);
            }
        }

        // Returns the first DOM element in a query
        static selectHTMLElement(sel): HTMLElement | undefined {
			if (this.isHTMLElement(sel)) return sel;
            if (typeof sel == "string") {
                var q = DOM.select(sel);
                if (q == null || q.length == 0) return;
                return q.item(0)?.source as HTMLElement;
            }
        }

        // returns a DomItem if ele is a element or attribute object
        // else returns the original item
        static wrap(ele): DOMItem {
            return new Svidget.DOMItem(ele);
        }

        // converts an HTML or SVG DOM node into a pure object literal used to transport
        static transportize(ele: DOMNode): DOMObject | undefined {
            if (ele == null) return;
            return {
                name: ele.localName,
                namespace: ele.namespaceURI,
				value: (ele as Attr).value,
				elements: undefined, // todo: this was never added in 0.3.5, so do here or in DOMItem (for one level)
				attributes: undefined, // todo: this was never added in 0.3.5
                type: ele.nodeType,
                /*    ele.nodeType == 1
                        ? Svidget.NodeTypes.element
                        : ele.nodeType == 2
                        ? Svidget.NodeTypes.attribute
						: null,
				*/
            };
        }

        // Elements

        static root(): HTMLElement {
            return document.documentElement;
        }

        static rootItem(): DOMItem {
            // should we cache?
            return this.wrap(this.root());
        }

        static attr(ele: Element, attrName: string): Attr {
            return ele.attributes[attrName];
        }

        static attrValue(ele: Element, attrName: string): string | undefined {
            var a = this.attr(ele, attrName);
            if (a) return a.value;
		}
		
		static elementsOf(source: DOMAny): DOMAny[] {
			return Svidget.array((source as Element).children) ?? (source as DOMObject).elements;
		}

		static attributesOf(source: DOMAny): DOMAny[] {
			return Svidget.array((source as Element).attributes); // ?? (source as DOMObject).attributes;
		}

        // determines if attribute is specified but empty/no value (i.e. <object data-crossdomain />
        static isAttrEmpty(ele, attrName): boolean {
            const av = this.attrValue(ele, attrName);
            return av != null && av.length == 0;
        }

        static clone(item: DOMItem): DOMItem {
			// todo
			return item;
        }

        static cloneDetached(item: DOMItem): DOMObject {
			// returns a clone DomItem without its underlying element/attribute, to be used as a transport
			return item.isAttached() ? DOM.transportize(item.source as DOMNode) : {...item} as DOMObject;
        }

        static isDOMNode(node: DOMNode): boolean {
            if (node == null) return false; // used to be null
            return (
                node.namespaceURI != null &&
                node.localName != null &&
                node.nodeType != null &&
                ((node as HTMLInputElement).value != null || node.textContent != null) &&
                (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.ATTRIBUTE_NODE)
            ); //!source.attributes ||
        }

        // todo: normalize with node type, where is this used?
        static fromDOMNodeType(type: number): NodeTypeName | undefined {
            switch (type) {
                case Node.ELEMENT_NODE:
                    return "element"; // 1
                case Node.ATTRIBUTE_NODE:
                    return "attribute"; // 2
                case Node.TEXT_NODE:
                    return "text"; // 3
            }
        }

        // use fromDOMNodeType instead, numbering is aligned with DOM
        /*function getType(typeCode) {
		if (typeCode == Svidget.NodeType.element) return "element";
		if (typeCode == Svidget.NodeType.attribute) return "attribute";
		return null;
	}*/

        static getNamespaceType(
            namespaceURI: string
        ): NamespaceName | undefined {
            for (let ns in Svidget.Namespaces) {
                if (namespaceURI === Svidget.Namespaces[ns])
                    return ns as NamespaceName;
            }
        }

        // TEXT

		// use getText/setText directly instead
        /*static text(sel: string, text?: string) {
            var obj = this.select(sel);
            if (text === undefined) return this.getText(obj);
            else this.setText(obj, text);
        }*/

        static getText(node: HTMLElement | SVGElement): string | undefined {
            if (node.textContent) return node.textContent;
            else if (node.innerHTML) return node.innerHTML;
        }

        static setText(node: HTMLElement | SVGElement, text: string): void {
            if (node.textContent) node.textContent = text + "";
            else if (node.innerHTML) node.innerHTML = text + "";
		}
		
		static getValue(node: DOMNode | DOMObject): string | undefined {
			return (node as DOMObject).value ?? (node as DOMNode).textContent;
        }

        static setValue(node: DOMNode | DOMObject, text: string) {
            if ((node as DOMObject).value) (node as DOMObject).value = text + "";
            if ((node as DOMNode).textContent) (node as DOMNode).textContent = text + "";
        }

        /* REGION Validation */

        // returns null - it means document hasn't loaded yet
        // returns undefined - it means document is loaded but not accessible due to security (cross domain) constraints
        static getDocument(objOrWinEle) {
            try {
                var doc = objOrWinEle.contentDocument;
                // 0.3.4: bug fix: FF doesn't throw exception when accessing contentDocument, so security check for contentWindow.document instead
                var doc2 =
                    objOrWinEle.contentWindow != null
                        ? objOrWinEle.contentWindow.document
                        : null;
                // certain browsers (Chrome) returns a blank document instead of null
                if (doc != null && doc.URL == "about:blank") return null;
                return doc;
            } catch (ex) {
                return undefined;
            }
        }

        // determines if document for <object> or <iframe> is loaded and ready
        static isElementDocumentReady(objOrWinEle): boolean {
            return this.getDocument(objOrWinEle) !== null;
        }

        static isHTMLElement(ele): boolean {
            // todo: fix this, won't work in node
            if (!HTMLElement) return undefined; //unknown
            return ele instanceof HTMLElement;
        }

        /* REGION Manipulation */
        // todo move to DomItem

        static attach(containerEle, eles) {}

        // detaches an element from the DOM
        // RETURNS
        // The elements that were detached
        static detach(sel) {}

        static disable(ele) {
            ele.disabled = true;
        }

        static enable(ele) {
            ele.disabled = false;
        }

        static show(ele, val) {
            ele.style.display = "initial";
            ele.style.visibility = "visible";
        }

        static hide(ele, val) {
            ele.style.display = "none";
            ele.style.visibility = "hidden";
        }

        /* REGION Events */

        // Note: todo: for on and off
        // wrap callback in compat layer with jQuery style event object

        // PARAMS
        // obj: object to attach listener to
        // name: type of event i.e. "click"
        // callbackto call back
        // capture: whether in capture/bubble
        // RETURNS
        // true if successful
        // REMARKS
        // Note: this is for DOM events

        // todo: support for event delegation?

        static on(obj: Element | Document | Window, type: string, callback: (...args) => any, options?: any) {
            //capture = !!capture; // normalize to bool (default == false)
            var attached = false;
            if (obj.addEventListener) {
                // Supports DOM spec
                document.addEventListener
                obj.addEventListener(type, callback, options);
                attached = true;
            } else if (obj.attachEvent) {
                // IE8 and below
                obj.attachEvent("on" + type, callback);
                attached = true;
            }
            // obj doesn't support events
            return attached;
        }

        static off(obj, type, callback, capture) {
            capture = !!capture; // normalize to bool (default == false)
            var detached = false;
            if (obj.removeEventListener) {
                obj.removeEventListener(type, callback, false);
				detached = true;
				// jquery implementation, commented out 2021 until further notice
            //} else if (document.detachEvent) {
            //    document.detachEvent("on" + type, callback);
            //    detached = true;
            }
            // obj doesn't support events
            return detached;
        }
    }
}
