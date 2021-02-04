/*****************************************
svidget.domitem.js

Wraps a DOM element or attribute.

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype

******************************************/

namespace Svidget {
    /**
     * Encapsulates a single DOM element or attribute.
     * @class
     * @param {object} source - A DOM element or attribute. Can be null
     */
    /*
	// An actual DOM element need not be provided.
	// source can be an actual DOM element or attribute, or a object describing one. Object properties must match names.
	*/
    export class DOMItem {
        private readonly __type = "Svidget.DOMItem";
        private readonly _source: DOMAny;
        private readonly _attached: boolean;
        private readonly _typeCode: NodeTypes;
        private readonly _type: string;
        private readonly _name: string;
        private readonly _namespace: string;
        private readonly _namespaceType: NamespaceName;
        private _value: string;
        private cachedElements: Collection<DOMItem>;
        private cachedAttributes: Collection<DOMItem>;

        constructor(source: DOMAny) {
            const domNode = (source ?? {}) as DOMNode; // default source to empty object
            const domObject = (source ?? {}) as DOMObject;

            this._source = source;
            this._attached = DOM.isDOMNode(domNode);

            if (this._attached) {
                //this._typeCode = source.nodeType == 1 ? Svidget.NodeType.element : source.nodeType == 2 ? Svidget.NodeType.attribute : null;
                this._typeCode = domNode.nodeType;
                this._name = domNode.localName;
                this._namespace = domNode.namespaceURI;
            } else {
                this._typeCode = domObject.type;
                this._name = domObject.name;
                this._namespace = domObject.namespace;
            }
            this._value = DOM.getValue(domNode as Attr);
            this._type = DOM.fromDOMNodeType(this._typeCode);
            this._namespaceType = DOM.getNamespaceType(this._namespace);
        }

        /**
         * Gets the underlying DOM object that this DOMItem instance wraps.
         * @method
         * @returns {(HTMLElement|HTMLAttribute)} - the underlying DOM object
         */
        get source(): DOMAny {
            return this._source;
        }

        get typeCode(): NodeTypes {
            return this._typeCode;
        }

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
        get value(): string {
            return this._value;
        }

        set value(val: string) {
            const source = this._source;
            //if (val === undefined) return DOM.getValue(this._source);
            var strval = val + "";
            DOM.setValue(source, strval);
            this._value = DOM.getValue(source);
        }

        /**
         * Gets the namespace URI for the element or attribute item.
         * @method
         * @returns {string}
         */
        get namespace(): string {
            return this._namespace;
        }

        /**
         * Gets the namespace type i.e. html, svg, xlink, svidget, etc.
         * @method
         * @returns {string}
         */
        get namespaceType(): NamespaceName {
            return this._namespaceType;
        }

        /**
         * Returns a collection of DOMItem objects representing child elements. Returns null if item is an attribute.
         * @method
         * @returns {Svidget.Collection} - the collection of DOMItems
         */
        elements(): Svidget.Collection<DOMItem> {
            // lazy load
            if (
                this.cachedElements != null &&
                Array.isArray(this.cachedElements)
            )
                return this.cachedElements;
            const source = this._source;
            const isDOM = this._attached;
            let sourceArr: DOMAny[] = DOM.elementsOf(source);
            /*if (!isDOM) {
			if (!Array.isArray((source as DOMObject).elements)) return;
			sourceArr = (source as DOMObject).elements;
		}
		else {
			sourceArr = Svidget.array((source as Element).children);
		}*/
            if (sourceArr?.length == null) return;
            //var eles = new Svidget.Collection(Svidget.array(origcol));
            const col = new Svidget.Collection(
                sourceArr.map((ele) => new Svidget.DOMItem(ele))
            );
            this.cachedElements = col;
            return this.cachedElements;
        }

        /**
         * Returns a collection of DOMItem objects representing attributes. Returns null if item is an attribute.
         * @method
         * @returns {Svidget.Collection} - the collection of DOMItems
         */
        attributes() {
            // lazy load
            if (
                this.cachedAttributes != null &&
                Array.isArray(this.cachedAttributes)
            )
                return this.cachedAttributes;
            const source = this._source;
            const isDOM = this._attached;
            let sourceArr: Array<DOMAny>;
            if (!isDOM) {
                if (!Array.isArray((source as DOMObject).attributes)) return;
                sourceArr = (source as DOMObject).attributes;
            } else {
                sourceArr = Svidget.array((source as Element).attributes);
            }
            //var attrs = new Svidget.Collection(Svidget.array(origcol));
            //attrs = attrs.select(function (a) { return new Svidget.DOMItem(a); });
            const col = new Svidget.Collection(
                sourceArr.map((ele) => new Svidget.DOMItem(ele))
            );
            this.cachedAttributes = col;
            return this.cachedAttributes;
        }

        /**
         * Gets whether the item has child elements.
         * @method
         * @returns {boolean}
         */
        hasElements(): boolean {
            if (this.isAttribute()) return false;
            //const hasItems = isDOM ? ((source as Element).children?.length > 0) : ((source as DOMObject).elements?.length > 0);
            const hasItems = DOM.elementsOf(this._source)?.length > 0;
            return hasItems;
        }

        //_attachedSource<T extends boolean>(attached: T): T extends true ? DOMNode : DOMObject {
        //	return attached ? this._source as DOMNode : this._source as DOMObject;
        //}

        /**
         * Gets whether the item has attributes. False when the item is an attribute.
         * @method
         * @returns {boolean}
         */
        hasAttributes(): boolean {
            if (this.isAttribute()) return false;
            const hasItems = DOM.attributesOf(this._source)?.length > 0;
            return hasItems;
        }

        /**
         * Gets whether the item is an attribute.
         * @method
         * @returns {boolean}
         */
        isAttribute(): boolean {
            return this._typeCode == Svidget.NodeTypes.attribute;
        }

        /**
         * Returns whether the DOMItem actually wraps an underlying DOM object.
         * @method
         * @returns {Svidget.Collection} - the collection of DOMItems
         */
        isAttached(): boolean {
            return this._attached;
        }
    }
}
