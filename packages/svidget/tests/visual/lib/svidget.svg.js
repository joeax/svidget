"use strict";
var Svidget = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.svg.ts
  var index_svg_exports = {};

  // src/conversion.ts
  function convertTo(val, type, subType, typeData) {
    switch (type) {
      case "string":
        return toString(val, subType, typeData);
      case "number":
        return toNumber(val, subType === "integer");
      case "boolean":
        return toBool(val);
      case "array":
        return toArray(val);
      default:
        return toObject(val);
    }
  }
  function toString(val, subType, typeData) {
    if (val == null) return val;
    if (subType === "choice") return toChoiceString(val, typeData);
    if (Array.isArray(val) || typeof val === "object") return JSON.stringify(val);
    return val + "";
  }
  function toChoiceString(val, typeData) {
    val = val + "";
    if (!typeData) return val;
    const choices = typeData.split("|");
    if (!choices || choices.length === 0) return null;
    if (choices.indexOf(val) >= 0) return val;
    return choices[0];
  }
  function toNumber(val, isInt) {
    if (!val) return 0;
    if (val === true) return 1;
    if (isInt) return parseInt(val + "");
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }
  function toBool(val) {
    const strval = (val + "").toLowerCase();
    if (strval === "false") return false;
    if (+val === 0) return false;
    return !!val;
  }
  function toArray(val) {
    if (val == null) return val;
    if (Array.isArray(val)) return val;
    if (isArrayString(val)) {
      const a = parseArray(val);
      if (a != null) return a;
    }
    return [val];
  }
  function toObject(val) {
    if (val == null) return val;
    if (isJSONString(val)) {
      const newVal = jsonifyString(val);
      try {
        return JSON.parse(newVal);
      } catch {
      }
    }
    return val;
  }
  function isJSONString(val) {
    if (!val) return false;
    val = (val + "").trim();
    return val.length > 0 && typeof val === "string" && val.charAt(0) === "{" && val.charAt(val.length - 1) === "}";
  }
  function isArrayString(val) {
    if (val == null) return false;
    val = (val + "").trim();
    return val.length > 0 && val.charAt(0) === "[" && val.charAt(val.length - 1) === "]";
  }
  function parseArray(val) {
    val = jsonifyString(val);
    const wrap = `{"d":${val}}`;
    try {
      const result = JSON.parse(wrap);
      if (result && result.d) return result.d;
      return null;
    } catch {
      return null;
    }
  }
  function jsonifyString(val) {
    if (val == null || val.indexOf("'") < 0) return val;
    val = (val + "").trim();
    const SQ = "'";
    const DQ = '"';
    const BS = "\\";
    let result = "";
    let inQuotes = false;
    let quoteChar = null;
    let escaped = false;
    for (let i = 0; i < val.length; i++) {
      let char = val[i];
      let newChar = char;
      if (char === SQ || char === DQ) {
        if (escaped) {
          if (quoteChar === SQ && char === SQ)
            result = result.substring(0, result.length - 1);
          else if (quoteChar === SQ && char === DQ) newChar = BS + BS + DQ;
          escaped = false;
        } else {
          if (inQuotes && char === quoteChar) {
            inQuotes = false;
            quoteChar = null;
            newChar = DQ;
          } else if (inQuotes && char === DQ) {
            newChar = BS + DQ;
          } else if (!inQuotes) {
            quoteChar = char;
            inQuotes = true;
            newChar = DQ;
          }
        }
      } else if (char === BS) {
        escaped = true;
      }
      result += newChar;
    }
    return result;
  }

  // src/types.ts
  var ParamTypes = ["string", "number", "boolean", "object", "array"];
  var ParamSubTypes = ["color", "integer", "date", "time", "datetime", "regex", "choice"];

  // src/core.ts
  var defaultType = "object";
  function isArray(array) {
    return array != null && Array.isArray(array);
  }
  function isFunction(func) {
    return typeof func === "function";
  }
  function getType(val) {
    if (val == null) return defaultType;
    if (isArray(val)) return "array";
    const type = typeof val;
    if (type === "string" || type === "number" || type === "boolean") return type;
    return "object";
  }
  function resolveType(type) {
    const resolvedType = String(type).toLowerCase();
    if (ParamTypes.find((t) => t === resolvedType) === void 0) return defaultType;
    if (resolvedType === "bool") return "boolean";
    return resolvedType;
  }
  function resolveSubtype(type, subType) {
    const resolvedType = resolveType(type);
    if (ParamSubTypes.find((t) => t === subType) === void 0) return void 0;
    if (resolvedType === "string" && (subType === "color" || subType === "regex")) return subType;
    if (resolvedType === "number" && subType === "integer") return subType;
    return void 0;
  }
  function resolveBinding(binding) {
    if (binding == null) return binding;
    if (typeof binding !== "function") binding = toString(binding);
    return binding;
  }
  function findFunction(funcNameOrInstance, scope) {
    if (typeof funcNameOrInstance === "function") {
      return funcNameOrInstance;
    }
    if (!funcNameOrInstance) return void 0;
    const name = String(funcNameOrInstance);
    const searchScope = scope ?? globalThis;
    let func = searchScope?.[name];
    if (typeof func !== "function" && searchScope !== globalThis) {
      func = globalThis?.[name];
    }
    if (typeof func === "function") return func;
    if (!name.trim().startsWith("return ")) {
      return new Function("return " + name);
    } else {
      return new Function(name);
    }
  }

  // src/logging.ts
  function logInfo(message) {
  }

  // src/widgetEvent.ts
  var WidgetEvent = class {
    constructor(type, name, data, currentTarget, origTarget, value) {
      this._propagationStopped = false;
      this._immediatePropagationStopped = false;
      this.type = type;
      this.name = name;
      this.data = data;
      this.currentTarget = currentTarget;
      this.target = origTarget == null ? currentTarget : origTarget;
      this.value = value;
      this.timeStamp = Date.now();
    }
    /**
     * Gets whether propagation was stopped on this event.
     */
    isPropagationStopped() {
      return this._propagationStopped;
    }
    /**
     * Gets whether immediate propagation was stopped on this event.
     */
    isImmediatePropagationStopped() {
      return this._immediatePropagationStopped;
    }
    /**
     * Stops propagation for this event.
     */
    stopPropagation() {
      this._propagationStopped = true;
    }
    /**
     * Stops immediate propagation for this event.
     */
    stopImmediatePropagation() {
      this._immediatePropagationStopped = true;
      this.stopPropagation();
    }
  };

  // src/eventableBase.ts
  var EventableBase = class {
    constructor() {
      /** Event handler registry */
      this.handlers = /* @__PURE__ */ new Map();
      this.bubbleParents = {};
    }
    /**
     * Registers an event handler for a widget event.
     * @param event Event name
     * @param handler Handler function
     */
    on(event, handler, name, data) {
      return this.addHandler(event, handler, name, data);
    }
    /**
     * Unregisters an event handler for a widget event.
     * @param event Event name
     * @param handler Handler function
     */
    off(event, handler, name) {
      return this.removeHandler(event, handler, name);
    }
    /**
     * Triggers a widget event and calls all registered handlers.
     * @param event Event name
     * @param args Arguments to pass to handlers
     */
    // trigger(event: TEventType, ...args: any[]): void {
    //     if (!this.eventHandlers.has(event)) return;
    //     this.eventHandlers.get(event)?.forEach((h) => h(...args));
    // }
    trigger(type, value, originalTarget) {
      var e = this.triggerHandlers(type, value, originalTarget);
      logInfo("trigger: " + type);
      if (!e.isPropagationStopped()) {
        this.bubble(type, e);
      }
    }
    triggerHandlers(type, value, originalTarget) {
      var e = new WidgetEvent(type, void 0, this.getTarget(), originalTarget, value);
      if (type == null || this.handlers == null || !this.handlers.has(type)) return e;
      var handlers = this.handlers.get(type);
      handlers?.forEach((h) => {
        if (e.isImmediatePropagationStopped()) return false;
        h.handler.call(null, this.cloneWidgetEvent(e, h.name, h.data));
      });
      return e;
    }
    cloneWidgetEvent(e, name, data) {
      return new WidgetEvent(e.type, name, data, e.currentTarget, e.target, e.value);
    }
    // Helper methods for managing event handlers (converted from object literal to class methods)
    addHandler(type, handler, name, data) {
      if (!this.handlers.has(type)) this.handlers.set(type, []);
      const handlers = this.handlers.get(type);
      if (this.handlerExists(type, handler, name)) return false;
      handlers.push({ handler, name, data });
      return true;
    }
    removeHandler(type, handler, name) {
      if (!this.handlers.has(type)) return false;
      const handlers = this.handlers.get(type);
      const initialLength = handlers.length;
      this.handlers.set(
        type,
        handlers.filter((h) => !this.handlerMatch(h, handler, name))
      );
      return handlers.length !== initialLength;
    }
    handlerExists(type, handler, name) {
      if (!this.handlers.has(type)) return false;
      const handlers = this.handlers.get(type);
      return handlers.some((h) => this.handlerMatch(h, handler, name));
    }
    handlerMatch(handlerObj, handler, name) {
      if (name != null && handlerObj.name === name) return true;
      if (handler === handlerObj.handler) return true;
      return false;
    }
    bubble(type, sourceEvent) {
      this.ensureBubbleParents();
      const newEvent = this.cloneWidgetEvent(sourceEvent);
      if (this.bubbleParents[type]) this.bubbleParents[type](type, newEvent, this.getTarget());
    }
    ensureBubbleParents() {
      if (!this.bubbleParents) this.bubbleParents = {};
    }
    setBubbleParent(eventType, callback) {
      this.ensureBubbleParents();
      this.bubbleParents[eventType] = callback;
    }
    // private, called by the object to register a single callback for all its event types
    // bubbleTarget: usually a parent object
    registerBubbleCallback(types, callback) {
      types.forEach((type) => {
        this.setBubbleParent(type, callback);
      });
    }
    getTarget() {
      return this;
    }
    /**
     * Serializes the object for transport across a window boundary.
     * @method
     * @virtual
     * @returns {boolean} - A generic serialized object representing the Param object.
     */
    serialize() {
      return {};
    }
    /**
     * Gets a string representation of this object.
     * @method
     * @virtual
     * @returns {string}
     */
    toString() {
      return "[EventableBase]";
    }
  };

  // src/paramBase.ts
  var ParamBase = class extends EventableBase {
    /**
     * Constructs a ParamBase instance.
     * @param name Name of the parameter
     * @param type Type of the parameter
     * @param value Value of the parameter
     * @param defaultValue Default value of the parameter
     * @param description Description of the parameter
     */
    constructor(name, options) {
      super();
      this._type = "string";
      this._name = name;
      this.setOptionProperties(options);
    }
    setOptionProperties(options) {
      this._type = this.resolveType(options.type, options.defaultValue);
      this._subType = resolveSubtype(this._type, options.subType);
      this._typeData = toString(options.typeData);
      this._description = toString(options.description);
      this._defaultValue = options.defaultValue;
    }
    // Helper functions for local use
    resolveType(type, defaultValue) {
      if (type == null) type = getType(defaultValue);
      else type = resolveType(type);
      return type;
    }
    /**
     * Name of the parameter (immutable after creation)
     */
    get name() {
      return this._name;
    }
    /**
     * Description of the parameter
     */
    get description() {
      return this._description;
    }
    set description(val) {
      this._description = val;
      this.triggerChange("description", val);
    }
    /**
     * Type of the parameter (e.g., string, number, boolean)
     */
    get type() {
      return this._type;
    }
    set type(val) {
      this._type = val;
      this.triggerChange("type", val);
    }
    /**
     * Default value of the parameter
     */
    get defaultValue() {
      return this._defaultValue;
    }
    set defaultValue(val) {
      this._defaultValue = val;
      this.triggerChange("defaultValue", val);
    }
    /**
     * Subtype of the parameter (e.g., array, object)
     */
    get subType() {
      return this._subType;
    }
    set subType(val) {
      this._subType = val;
      this.triggerChange("subType", val);
    }
    /**
     * Pipe-delimited list of choices (if subType is choice)
     */
    get typedata() {
      return this._typeData;
    }
    set typeData(val) {
      this._typeData = val;
      this.triggerChange("typeData", val);
    }
    /**
     * Helper to trigger change event for property
     */
    triggerChange(property, value) {
      if (typeof this.trigger === "function") {
        this.trigger("change", { property, value });
      }
    }
  };

  // src/dom.ts
  var nodeTypes = {
    element: 0,
    attribute: 1,
    text: 2
  };
  var namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    // also used for HTML5
    svidget: "http://www.svidget.org/svidget",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink"
  };
  var DOM = class _DOM {
    // Wrapper for getElementById
    static get(sel) {
      if (!document.getElementById) return null;
      return document.getElementById(sel);
    }
    static getByName(tagName, asArray) {
      return _DOM.getChildrenByName(document, tagName, asArray);
    }
    static getByNameNS(namespace, tagName, asArray) {
      if (!document.getElementsByTagNameNS) return null;
      const tags = document.getElementsByTagNameNS(namespace, tagName);
      if (asArray) {
        return Array.from(tags);
      }
      return tags;
    }
    static getChildrenByName(source, tagName, asArray) {
      const tags = source.getElementsByTagName(tagName);
      if (asArray) {
        return Array.from(tags);
      }
      return tags;
    }
    static getElement(sel) {
      if (typeof sel === "string") return _DOM.get(sel);
      else return sel;
    }
    static getItem(sel) {
      return _DOM.wrap(_DOM.get(sel));
    }
    static select(sel) {
      if (sel == null) return void 0;
      const attrRX = /@[^=#\s]+/g;
      const hasAttr = attrRX.test(sel);
      const col = [];
      let res;
      function selectSingle(s) {
        if (s == null) return [];
        const attrRXEnd = /@([^=#\s]+)$/g;
        let selStr = s;
        let attrName;
        const match = attrRXEnd.exec(s);
        if (match) {
          attrName = match[1];
          selStr = selStr.replace(match[0], "");
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
            item = _DOM.attr(ele, attrName);
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
        const parts = sel.split(",");
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
    static wrap(ele) {
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
    static root() {
      return document.documentElement;
    }
    static rootItem() {
      return _DOM.wrap(_DOM.root());
    }
    static attr(ele, attrName) {
      return ele.attributes[attrName];
    }
    static attrValue(ele, attrName) {
      const a = _DOM.attr(ele, attrName);
      if (a) return a.value;
      return null;
    }
    static isAttrEmpty(ele, attrName) {
      const av = _DOM.attrValue(ele, attrName);
      return av != null && av.length == 0;
    }
    // static clone(item: DOMItem): void {
    //     // todo
    // }
    // static cloneDetached(item: DOMItem): void {
    //     // todo
    // }
    static isDOMNode(node) {
      if (node == null) return null;
      return node.namespaceURI != null && node.localName != null && node.nodeType != null && (node.value != null || node.textContent != null) && (node.nodeType == 1 || node.nodeType == 2);
    }
    static fromNodeType(type) {
      if (type == 1) return "element";
      if (type == 2) return "attribute";
      if (type == 3) return "text";
      return null;
    }
    static text(sel, text) {
      const obj = _DOM.select(sel);
      if (text === void 0) return _DOM.getText(obj);
      else _DOM.setText(obj, text);
    }
    static getText(obj) {
      if (obj.textContent) return obj.textContent;
      else if (obj.innerHTML) return obj.innerHTML;
      else return null;
    }
    static setText(obj, text) {
      if (obj.textContent) obj.textContent = text + "";
      else if (obj.innerHTML) obj.innerHTML = text + "";
    }
    static getDocument(objOrWinEle) {
      try {
        const doc = objOrWinEle.contentDocument;
        const doc2 = objOrWinEle.contentWindow != null ? objOrWinEle.contentWindow.document : null;
        if (doc != null && doc.URL == "about:blank") return null;
        return doc;
      } catch (ex) {
        return void 0;
      }
    }
    static isElementDocumentReady(objOrWinEle) {
      return _DOM.getDocument(objOrWinEle) !== null;
    }
    static isElement(ele) {
      if (typeof HTMLElement === "undefined") return void 0;
      return ele instanceof HTMLElement;
    }
    // static attach(containerEle: any, eles: any): void {
    //     // todo
    // }
    // static detach(sel: any): void {
    //     // todo
    // }
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
    static on(obj, type, callback, capture) {
      capture = !!capture;
      let attached = false;
      if (obj.addEventListener) {
        obj.addEventListener(type, callback, capture);
        attached = true;
      }
      return attached;
    }
    static off(obj, type, callback, capture) {
      capture = !!capture;
      let detached = false;
      if (obj.removeEventListener) {
        obj.removeEventListener(type, callback, false);
        detached = true;
      }
      return detached;
    }
  };
  var DOMQuery = class {
    constructor(selector, items) {
      this._items = items;
      this._selector = selector;
    }
    get length() {
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
    at(index) {
      return this._items[index];
    }
    hasItems() {
      return this._items.length > 0;
    }
    /**
     * Sets the value of each item in the collection.
     * @method
     * @returns {string}
     */
    setValue(val) {
      this._items.forEach((i) => i.value(val));
    }
    /**
     * Gets a string representation of this object.
     * @method
     * @returns {string}
     */
    toString() {
      return '[DOMQuery { selector: "' + this._selector + '", items: ' + this._items.length + "}]";
    }
  };
  var DOMItem = class _DOMItem {
    constructor(source) {
      this._type = null;
      this._typeCode = null;
      // Define missing private fields
      this._name = null;
      this._namespace = null;
      this._value = null;
      this._namespaceType = null;
      this._isDOMNode = false;
      this._source = source;
      const sourceDOM = DOM.isDOMNode(source);
      if (sourceDOM) {
        const node = source;
        this._typeCode = node.nodeType == 1 ? nodeTypes.element : node.nodeType == 2 ? nodeTypes.attribute : null;
        this._name = node.localName;
        this._namespace = node.namespaceURI;
        this._isDOMNode = true;
      } else {
        const node = source;
        this._typeCode = node.type;
        this._name = node.name;
        this._namespace = node.namespace;
      }
      this._value = getNodeValue(source);
      this._type = getType2(this._typeCode);
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
    set value(val) {
      const strval = val + "";
      const source = this._source;
      if (source.value) source.value = strval;
      else this._source.textContent = strval;
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
    get hasElements() {
      if (this.isAttribute) return false;
      const source = this._source;
      if (this.isAttached || source.children && source.children.length) {
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
      const source = this._source;
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
    get isAttribute() {
      return this._type == "attribute";
    }
    /**
     * Returns a collection of DOMItem objects representing child elements. Returns null if item is an attribute.
     * @method
     * @returns {DOMItem[] | null} - the collection of DOMItems or null
     */
    get elements() {
      if (this._cachedElements != null && isArray(this._cachedElements)) return this._cachedElements;
      const isDOM = this.isAttached;
      const node = this.source;
      if (!isDOM && (!node.elements || !node.elements.length)) return null;
      const element = this.source;
      const origCol = isDOM ? element.children : node.elements;
      if (origCol == null) return null;
      const eles = Array.from(origCol);
      const items = eles.map((e) => new _DOMItem(e));
      this._cachedElements = items;
      return this._cachedElements;
    }
    /**
     * Returns a collection of DOMItem objects representing attributes. Returns null if item is an attribute.
     * @method
     * @returns {DOMItem[] | null} - the collection of DOMItems or null
     */
    attributes() {
      if (this._cachedAttributes != null && isArray(this._cachedAttributes)) return this._cachedAttributes;
      const isDOM = this.isAttached;
      const source = this._source;
      const node = this.source;
      if (!isDOM && (!node.attributes || !node.attributes.length)) return null;
      const origCol = node.attributes;
      if (origCol == null) return null;
      const attrs = Array.from(origCol);
      const items = attrs.map((a) => new _DOMItem(a));
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
    get isAttached() {
      return this._isDOMNode;
    }
  };
  function getType2(typeCode) {
    if (typeCode == null) return null;
    if (typeCode == nodeTypes.element) return "element";
    if (typeCode == nodeTypes.attribute) return "attribute";
    return null;
  }
  function getNamespaceType(namespace) {
    if (namespace == null) return null;
    for (const n of Object.keys(namespaces)) {
      if (namespace === namespaces[n]) return n;
    }
    return null;
  }
  function getNodeValue(node) {
    if ("value" in node && typeof node.value !== "undefined") {
      return node.value;
    } else if ("textContent" in node && typeof node.textContent !== "undefined") {
      return node.textContent;
    } else {
      return void 0;
    }
  }

  // src/param.ts
  var ParamOptionProperties = [
    "type",
    "subType",
    "typeData",
    "description",
    "defaultValue",
    "enabled",
    "shortName",
    "coerce",
    "group",
    "sanitizer"
  ];
  var ParamEventTypes = ["change", "set"];
  var Param = class extends ParamBase {
    constructor(name, value, options, eventNotifier) {
      super(name, options);
      this._enabled = true;
      this._shortName = toString(options.shortName);
      this._coerce = toBool(options.coerce);
      this._group = toString(options.group);
      this._value = this._coerce ? convertTo(value, this.type, this.subType, this.typeData) : value;
      this._sanitizer = (!isFunction(options.sanitizer) ? toString(options.sanitizer) : options.sanitizer) || null;
      this._enabled = options.enabled != null ? toBool(options.enabled) : true;
      this._binding = toString(options.binding);
      this.registerEventNotifier(eventNotifier);
    }
    registerEventNotifier(eventNotifier) {
      this._eventNotifier = eventNotifier;
      if (eventNotifier) {
        this.registerBubbleCallback(Array.from(ParamEventTypes), eventNotifier);
      }
    }
    get attached() {
      return !!this._eventNotifier;
    }
    get enabled() {
      return this._enabled;
    }
    set enabled(val) {
      if (this._enabled !== val) {
        this._enabled = val;
        this.trigger("change", { property: "enabled", value: val });
      }
    }
    /**
     * Value of the parameter
     */
    get value() {
      return this._value;
    }
    set value(val) {
      if (this.enabled === false) return;
      let finalVal = val;
      if (this.coerce) {
        finalVal = this.coerceValue(finalVal);
      }
      finalVal = this.applySanitizer(finalVal);
      this._value = finalVal;
      this.applyBinding(finalVal);
      this.triggerChange("value", finalVal);
      this.trigger("set", { value: finalVal });
    }
    /**
     * Gets or sets the short name for the parameter (used for query string param).
     */
    get shortName() {
      return this._shortName;
    }
    set shortName(val) {
      if (this._shortName !== val) {
        this._shortName = val;
        this.trigger("change", { property: "shortName", value: val });
      }
    }
    get binding() {
      return this._binding;
    }
    set binding(val) {
      if (this._binding !== val) {
        this._binding = val;
        this.trigger("change", { property: "binding", value: val });
      }
    }
    /**
     * Gets or sets whether to coerce the value to the specified type.
     */
    get coerce() {
      return this._coerce;
    }
    set coerce(val) {
      if (this._coerce !== val) {
        this._coerce = val;
        this.trigger("change", { property: "coerce", value: val });
      }
    }
    /**
     * Gets or sets the group name for organizing parameters.
     */
    get group() {
      return this._group;
    }
    set group(val) {
      if (this._group !== val) {
        this._group = val;
        this.trigger("change", { property: "group", value: val });
      }
    }
    /**
     * Gets or sets the sanitizer function or name.
     */
    get sanitizer() {
      return this._sanitizer;
    }
    set sanitizer(val) {
      if (this._sanitizer !== val) {
        this._sanitizer = val;
        this.trigger("change", { property: "sanitizer", value: val });
      }
    }
    // --- Event Registration Shortcuts ---
    onChange(handler, name, data) {
      return this.on("change", handler, name, data);
    }
    offChange(handler, name) {
      return this.off("change", handler, name);
    }
    onSet(handler, name, data) {
      return this.on("set", handler, name, data);
    }
    offSet(handler, name) {
      return this.off("set", handler, name);
    }
    /**
     * Gets the serialized param value.
     */
    get serializedValue() {
      return String(this.value);
    }
    /**
     * Applies sanitizer function if present.
     */
    applySanitizer(val) {
      const func = this.sanitizerFunc();
      if (!func) return val;
      const returnVal = func.call(null, this, val);
      return returnVal === void 0 ? val : returnVal;
    }
    /**
     * Returns the sanitizer function if set, or tries to resolve it if a string is provided.
     */
    sanitizerFunc() {
      if (!this.sanitizer) return void 0;
      var func = findFunction(this.sanitizer);
      return func;
    }
    /**
     * Coerces the value to the param's type/subtype if needed.
     */
    coerceValue(val) {
      return convertTo(val, this.type, this.subType, this.typeData);
    }
    /**
     * Applies the value to the binding target if binding is set.
     */
    applyBinding(val) {
      if (this.binding == null) return;
      const bindingQuery = DOM.select(this.binding);
      if (bindingQuery == null) return;
      bindingQuery.setValue(val);
    }
    /**
     * Serializes the Param object for transport across a window boundary.
     */
    serialize() {
      return {
        name: this.name,
        shortName: this.shortName ?? void 0,
        enabled: this.enabled,
        type: this.type,
        subType: this.subType,
        typeData: this.typeData ?? void 0,
        coerce: this.coerce,
        defaultValue: this.defaultValue,
        value: this.value,
        group: this.group ?? void 0,
        description: this.description ?? void 0
      };
    }
    /**
     * Gets a string representation of this object.
     */
    toString() {
      return `[Param { name: "${this.name}" }]`;
    }
  };

  // src/actionParam.ts
  var ActionParamOptionProperties = ["type", "subtype", "typedata", "description", "defaultValue"];
  var ActionParamEventTypes = ["change"];
  var ActionParam = class extends ParamBase {
    /**
     * Constructs an ActionParam instance.
     * @param name Name of the parameter
     * @param type Type of the parameter
     * @param value Value of the parameter
     * @param defaultValue Default value of the parameter
     * @param description Description of the parameter
     * @param subType Subtype of the parameter
     * @param typedata Choices for the parameter
     */
    constructor(name, actionName, options, eventNotifier) {
      super(name, options);
      this._actionName = actionName;
      this.registerEventNotifier(eventNotifier);
    }
    registerEventNotifier(eventNotifier) {
      if (eventNotifier) {
        this.registerBubbleCallback(Array.from(ActionParamEventTypes), eventNotifier);
      }
    }
    /**
     * Serializes the ActionParam for transport.
     */
    serialize() {
      return {
        name: this.name,
        actionName: this._actionName,
        // Include action name if applicable
        type: this.type,
        defaultValue: this.defaultValue
        // Optionally add description, subType, typedata if needed for proxy
      };
    }
    /** Registers a handler for the 'change' event. */
    onChange(handler, name, data) {
      this.on("change", handler, name, data);
    }
    /** Unregisters a handler for the 'change' event. */
    offChange(handler, name) {
      this.off("change", handler, name);
    }
  };

  // src/collections.ts
  function getByIndex(col, index) {
    if (index == null || typeof index !== "number" || isNaN(index)) return null;
    const numIndex = parseInt(index.toString());
    var res = col[numIndex];
    return res == null ? null : res;
  }
  function getByName(col, name) {
    return col.find((item) => item.name === name) || null;
  }
  function select(col, selector) {
    if (typeof selector === "number") {
      const idx = parseInt(selector.toString());
      return [getByIndex(col, idx)];
    } else if (typeof selector === "function") {
      return col.filter(selector);
    }
    if (selector !== void 0) return [getByName(col, selector + "")];
    return col;
  }
  function selectFirst(col, selector) {
    if (typeof selector === "number") {
      const idx = parseInt(selector.toString());
      return getByIndex(col, idx);
    } else if (typeof selector === "function") {
      return col.find(selector);
    }
    if (selector !== void 0) return getByName(col, selector + "");
    return col[0] || null;
  }

  // src/action.ts
  var ActionOptionProperties = ["external", "binding", "enabled", "description"];
  var ActionEventTypes = [
    "invoke",
    "change",
    "paramchange",
    "paramadd",
    "paramremove"
  ];
  var Action = class extends EventableBase {
    /**
     * Constructs an Action instance.
     * @param name Name of the action
     * @param description Description of the action
     * @param params Array of parameters for the action
     * @param handler Function to execute when the action is invoked
     */
    constructor(name, options, eventNotifier) {
      super();
      /** Array of parameters for the action */
      this._params = [];
      /** Handler function to execute when the action is invoked */
      // private _handler: (...args: any[]) => any;
      /** Whether the action is enabled */
      this._enabled = true;
      /** Whether the action is external facing */
      this._external = true;
      /** Binding (function or string) */
      this._binding = void 0;
      this._bindingFunc = void 0;
      this.name = name;
      this.setOptionProperties(options);
      this.registerEventNotifier(eventNotifier);
    }
    setOptionProperties(options) {
      this._description = toString(options.description);
      this._enabled = options.enabled != null ? toBool(options.enabled) : true;
      this._binding = resolveBinding(options.binding);
      this._external = options.external != null ? toBool(options.external) : true;
    }
    registerEventNotifier(eventNotifier) {
      this._eventNotifier = eventNotifier;
      if (eventNotifier) {
        this.registerBubbleCallback(Array.from(ActionEventTypes), eventNotifier);
      }
    }
    get attached() {
      return !!this._eventNotifier;
    }
    /** Gets or sets the description. Triggers change event on set. */
    get description() {
      return this._description;
    }
    set description(val) {
      if (this._description !== val) {
        this._description = val;
        this.trigger("change", { property: "description", value: val });
      }
    }
    /** Gets or sets whether the action is enabled. Triggers change event on set. */
    get enabled() {
      return this._enabled;
    }
    set enabled(val) {
      if (this._enabled !== val) {
        this._enabled = val;
        this.trigger("change", { property: "enabled", value: val });
      }
    }
    /** Gets or sets whether the action is external. Triggers change event on set. */
    get external() {
      return this._external;
    }
    set external(val) {
      if (this._external !== val) {
        this._external = val;
        this.trigger("change", { property: "external", value: val });
      }
    }
    /** Gets or sets the binding (function or string). Triggers change event on set. */
    get binding() {
      return this._binding;
    }
    set binding(val) {
      if (this._binding !== val) {
        this._binding = val;
        this.trigger("change", { property: "binding", value: val });
      }
    }
    /** Params **/
    get params() {
      return this._params;
    }
    /**
     * Gets a collection of all ActionParam objects, or a sub-collection based on the selector.
     * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
     * Examples:
     * getParams(0)
     * getParams("color")
     * @method
     * @param {(string|number|function)} [selector] - The param name, index, or search function (with signature function (param) returns boolean).
     * @returns {Svidget.Collection} - A collection based on the selector, or the entire collection.
     */
    getParams(selector) {
      var col = this._params;
      return select(col, selector);
    }
    /**
     * Gets the ActionParam based on the selector.
     * Selector can be an integer to get the zero-based item at that index, or a string to select by that ID.
     * Examples:
     * getParam(0)
     * getParam("color")
     * @method
     * @param {(string|number|function)} selector - The param name, index, or search function (with signature function (param) returns boolean).
     * @returns {Svidget.ActionParam} - The ActionParam based on the selector. If selector is invalid, null is returned.
     */
    getParam(selector) {
      var col = this._params;
      var item = selectFirst(col, selector);
      return item;
    }
    newParam(name, options) {
      const param = new ActionParam(name, this.name, options, this.paramBubbleHandler.bind(this));
      return param;
    }
    /**
     * Adds a parameter to the action.
     */
    addParam(param) {
      if (this.params.some((p) => p.name === param.name)) return false;
      this.params.push(param);
      this.trigger("paramadd", param);
      return true;
    }
    /** Removes a parameter by name. */
    removeParam(name) {
      const idx = this.params.findIndex((p) => p.name === name);
      if (idx === -1) return false;
      const [removed] = this.params.splice(idx, 1);
      this.trigger("paramremove", removed.name);
      return true;
    }
    /** Clears all parameters. */
    clearParams() {
      this._params = [];
      this.trigger("change", { property: "params", value: [] });
    }
    // internal
    // called from param to bubble event
    paramBubbleHandler(type, event, param) {
      if (type === "change") this.triggerActionParamChanged(param, event.value);
    }
    triggerActionParamChanged(param, value) {
      this.trigger("paramchange", value, param);
    }
    /**
     * Invokes the action binding function or handler with provided arguments, triggers 'invoke' event.
     * Uses default values for missing args.
     * @param args Arguments to pass to the handler
     */
    invoke(...args) {
      this.invokeInternal.apply(this, args);
    }
    invokeInternal(...args) {
      if (!this.enabled) return false;
      const func = this.invocableBindingFunc();
      if (!func) return false;
      const argArray = this.buildArgumentArray(args);
      const result = func.apply(null, argArray);
      this.trigger("invoke", { returnValue: result });
      return result;
    }
    /**
     * Returns the function to invoke (bindingFunc or handler).
     */
    invocableBindingFunc() {
      if (this._bindingFunc && typeof this._bindingFunc === "function") return this._bindingFunc;
      if (typeof this._binding === "function") return this._binding;
      return null;
    }
    /**
     * Builds an array of arguments to use in invoke() based on the action params and provided args.
     * Uses default values for missing args.
     */
    buildArgumentArray(args) {
      const argsArray = [];
      const col = this.params;
      for (let i = 0; i < col.length; i++) {
        const p = col[i];
        let arg = void 0;
        if (i < args.length) arg = args[i];
        if (arg === void 0 && typeof p.defaultValue !== "undefined") arg = p.defaultValue;
        argsArray.push(arg);
      }
      return argsArray;
    }
    /* Events */
    // --- Event Registration Shortcuts ---
    onInvoke(handler, name, data) {
      return this.on("invoke", handler, name, data);
    }
    offInvoke(handler, name) {
      return this.off("invoke", handler, name);
    }
    onChange(handler, name, data) {
      return this.on("change", handler, name, data);
    }
    offChange(handler, name) {
      return this.off("change", handler, name);
    }
    onParamChange(handler, name, data) {
      return this.on("paramchange", handler, name, data);
    }
    offParamChange(handler, name) {
      return this.off("paramchange", handler, name);
    }
    onParamAdd(handler, name, data) {
      return this.on("paramadd", handler, name, data);
    }
    offParamAdd(handler, name) {
      return this.off("paramadd", handler, name);
    }
    onParamRemove(handler, name, data) {
      return this.on("paramremove", handler, name, data);
    }
    offParamRemove(handler, name) {
      return this.off("paramremove", handler, name);
    }
    // --- Serialization ---
    serialize() {
      return {
        name: this.name,
        description: this.description ?? "",
        external: this.external,
        enabled: this.enabled,
        params: this.params.map((p) => p.serialize())
      };
    }
    toString() {
      return `[Action name="${this.name}"]`;
    }
  };

  // src/eventDesc.ts
  var EventDescOptionProperties = ["external", "enabled", "description"];
  var EventDescEventTypes = ["trigger", "change"];
  var EventDesc = class extends EventableBase {
    constructor(name, options, eventNotifier) {
      super();
      this._external = true;
      this._enabled = true;
      this.name = name;
      this.setOptionProperties(options);
      this.registerEventNotifier(eventNotifier);
    }
    setOptionProperties(options) {
      this._description = toString(options.description);
      this._enabled = options.enabled != null ? toBool(options.enabled) : true;
      this._external = options.external != null ? toBool(options.external) : true;
    }
    registerEventNotifier(eventNotifier) {
      if (eventNotifier) {
        this.registerBubbleCallback(Array.from(EventDescEventTypes), eventNotifier);
      }
    }
    /** Gets or sets the description. Triggers change event on set. */
    get description() {
      return this._description;
    }
    set description(val) {
      if (this._description !== val) {
        this._description = val;
        this.trigger("change", { property: "description", value: val });
      }
    }
    /** Gets or sets whether the event is external. Triggers change event on set. */
    get external() {
      return this._external;
    }
    set external(val) {
      if (this._external !== val) {
        this._external = val;
        this.trigger("change", { property: "external", value: val });
      }
    }
    /** Gets or sets whether the event is enabled. Triggers change event on set. */
    get enabled() {
      return this._enabled;
    }
    set enabled(val) {
      if (this._enabled !== val) {
        this._enabled = val;
        this.trigger("change", { property: "enabled", value: val });
      }
    }
    /**
    * Dispatches the event for the EventDesc object. This in turn calls the trigger method with
    * the type 'trigger' and the value passed in. The page is then notified that the event
    * was triggered and can respond accordingly.
    * Note: This is called by the widget manually. 
    * @method
    * @param {object} value - The value to set to the Event.value property.
    */
    dispatch(value) {
      if (!this.enabled) return false;
      const type = "trigger";
      this.trigger(type, value);
      return true;
    }
    // --- Event Registration Shortcuts ---
    onTrigger(handler, name, data) {
      return this.on("trigger", handler, name, data);
    }
    offTrigger(handler, name) {
      return this.off("trigger", handler, name);
    }
    onChange(handler, name, data) {
      return this.on("change", handler, name, data);
    }
    offChange(handler, name) {
      return this.off("change", handler, name);
    }
    // --- Serialization ---
    serialize() {
      return {
        name: this.name,
        description: this.description ?? "",
        external: this.external,
        enabled: this.enabled
      };
    }
    toString() {
      return `[EventDesc name="${this.name}"]`;
    }
  };

  // src/widget.ts
  var Widget = class extends EventableBase {
    //page: any;
    //parentElement: Element | null;
    /**
     * Constructs a Widget instance.
     * @param id Widget ID
     * @param title Widget title
     * @param description Widget description
     */
    constructor(id, title, description) {
      super();
      this._id = id || "";
      this._title = title || "";
      this._description = description || "";
      this._params = [];
      this._actions = [];
      this._events = [];
      this._enabled = true;
      this._started = false;
      this._connected = false;
      this._populatedFromPage = false;
    }
    get params() {
      return this._params;
    }
    get actions() {
      return this._actions;
    }
    get events() {
      return this._events;
    }
    /**
     * Gets or sets the widget ID.
     */
    get id() {
      return this._id;
    }
    set id(val) {
      this._id = val;
    }
    /**
     * Gets or sets the widget title.
     */
    get title() {
      return this._title;
    }
    set title(val) {
      this._title = val;
    }
    /**
     * Gets or sets the widget description.
     */
    get description() {
      return this._description;
    }
    set description(val) {
      this._description = val;
    }
    /**
     * Gets or sets whether the widget is enabled. Triggers change event on set.
     */
    get enabled() {
      return this._enabled;
    }
    set enabled(val) {
      if (this._enabled !== val) {
        this._enabled = val;
        this.trigger("change", { property: "enabled", value: val });
      }
    }
    /**
     * Gets or sets whether the widget is connected to a parent page.
     */
    get connected() {
      return this._connected;
    }
    set connected(val) {
      this._connected = val;
    }
    /**
     * Gets or sets whether the widget has started (DOM loaded).
     */
    get started() {
      return this._started;
    }
    /**
     * Gets or sets whether the widget has been populated from the page.
     */
    get populatedFromPage() {
      return this._populatedFromPage;
    }
    // --- Lifecycle Methods ---
    /**
     * Called to start the widget (signals DOM is ready)
     */
    start() {
      if (this._started) return;
      this._started = true;
    }
    /**
     * Called to connect the widget to a parent page
     * @param id Optional new widget ID
     */
    connect(id) {
      this.id = id;
      this.connected = true;
    }
    /**
     * Sets populatedFromPage and triggers event
     */
    setPopulatedFromPage() {
      this._populatedFromPage = true;
      this.trigger("pagepopulate", this);
    }
    setCommunicator(communicator) {
      this._communicator = communicator;
    }
    // --- Param Management ---
    getParam(selector) {
      if (typeof selector === "number") return this.params[selector];
      return this.params.find((p) => p.name === selector);
    }
    newParam(name, value, options) {
      const param = new Param(name, value, options, this.paramBubbleHandler.bind(this));
      return param;
    }
    addParam(param) {
      if (this.params.some((p) => p.name === param.name)) {
        logInfo(`Widget: Param with name "${param.name}" already exists.`);
        return false;
      }
      this.params.push(param);
      this.handleParamAdded(param);
      return true;
    }
    removeParam(name) {
      const idx = this.params.findIndex((p) => p.name === name);
      if (idx === -1) return false;
      const [removed] = this.params.splice(idx, 1);
      this.handleParamRemoved(removed);
      return true;
    }
    clearParams() {
      this._params.forEach((p) => {
        this.handleParamRemoved(p);
      });
      this._params = [];
      this.trigger("change", { property: "params", value: [] });
    }
    // internal
    // handle param added
    handleParamAdded(param) {
      logInfo("widget: param added: " + param.name);
      this.trigger("paramadd", param);
      this._communicator?.signalParamAdded(param);
    }
    // internal
    // handle param removed
    handleParamRemoved(param) {
      logInfo("widget: param removed: " + param.name);
      this.trigger("paramremove", param.name);
      this._communicator?.signalParamRemoved(param.name);
    }
    // internal
    // called from param to bubble event
    paramBubbleHandler(type, event, param) {
      if (type === "change") this.triggerParamChanged(param, event.value);
      if (type === "set") this.triggerParamSet(param, event.value);
    }
    // private
    // eventValue ex = { property: "binding", value: bindValue }
    triggerParamChanged(param, eventValue) {
      this.trigger("paramchange", eventValue, param);
      this._communicator?.signalParamChanged(param, eventValue);
    }
    // private
    // eventValue ex = { value: "3" }
    triggerParamSet(param, eventValue) {
      this.trigger("paramset", eventValue, param);
      this._communicator?.signalParamSet(param, eventValue);
    }
    // --- Action Management ---
    getAction(selector) {
      if (typeof selector === "number") return this.actions[selector];
      return this.actions.find((a) => a.name === selector);
    }
    newAction(name, options) {
      const action = new Action(name, options, this.actionBubbleHandler.bind(this));
      return action;
    }
    addAction(action) {
      if (this.actions.some((a) => a.name === action.name)) {
        logInfo(`Widget: Action with name "${action.name}" already exists.`);
        return false;
      }
      this.actions.push(action);
      this.handleActionAdded(action);
      return true;
    }
    removeAction(name) {
      const idx = this.actions.findIndex((a) => a.name === name);
      if (idx === -1) return false;
      const [removed] = this.actions.splice(idx, 1);
      this.handleActionRemoved(removed);
      return true;
    }
    clearActions() {
      this._actions.forEach((a) => {
        this.handleActionRemoved(a);
      });
      this._actions = [];
      this.trigger("change", { property: "actions", value: [] });
    }
    // internal
    // handle action added
    handleActionAdded(action) {
      logInfo("widget: action added: " + action.name);
      this.trigger("actionadd", action);
      this._communicator?.signalActionAdded(action);
    }
    // internal
    // handle action removed
    handleActionRemoved(action) {
      logInfo("widget: action removed: " + action.name);
      this.trigger("actionremove", action.name);
      this._communicator?.signalActionRemoved(action.name);
    }
    actionBubbleHandler(type, event, action, actionParam) {
      if (type === "change") this.triggerActionChanged(action, event.value);
      if (type === "invoke") this.triggerActionInvoke(action, event.value);
      if (type === "paramchange") this.triggerActionParamChanged(action, actionParam, event.value);
      if (type === "paramadd") this.triggerActionParamAdded(action, actionParam, event.value);
      if (type === "paramremove") this.triggerActionParamRemoved(action, actionParam, event.value);
    }
    triggerActionChanged(action, eventValue) {
      this.trigger("actionchange", eventValue, action);
      this._communicator?.signalActionChanged(action, eventValue);
    }
    triggerActionInvoke(action, eventValue) {
      this.trigger("actioninvoke", eventValue, action);
      this._communicator?.signalActionInvoked(action, eventValue);
    }
    triggerActionParamChanged(action, actionParam, eventValue) {
      this.trigger("actionparamchange", eventValue, action);
      this._communicator?.signalActionParamChanged(actionParam, action.name, eventValue);
    }
    triggerActionParamAdded(action, actionParam, eventValue) {
      this.trigger("actionparamadd", eventValue, action);
      this._communicator?.signalActionParamAdded(actionParam, action.name);
    }
    triggerActionParamRemoved(action, actionParam, eventValue) {
      this.trigger("actionparamremove", eventValue, action);
      this._communicator?.signalActionParamRemoved(actionParam.name, action.name);
    }
    // --- Event Management ---
    getEvent(selector) {
      if (typeof selector === "number") return this.events[selector];
      return this.events.find((e) => e.name === selector);
    }
    newEvent(name, options) {
      const event = new EventDesc(name, options, this.eventBubbleHandler.bind(this));
      return event;
    }
    addEvent(event) {
      if (this.events.some((e) => e.name === event.name)) return false;
      this.events.push(event);
      this.handleEventAdded(event);
      return true;
    }
    removeEvent(name) {
      const idx = this.events.findIndex((e) => e.name === name);
      if (idx === -1) return false;
      const [removed] = this.events.splice(idx, 1);
      this.handleEventRemoved(removed);
      return true;
    }
    clearEvents() {
      this._events.forEach((e) => {
        this.handleEventRemoved(e);
      });
      this._events = [];
      this.trigger("change", { property: "events", value: [] });
    }
    // internal
    // handle action added
    handleEventAdded(event) {
      logInfo("widget: event added: " + event.name);
      this.trigger("eventadd", event);
      this._communicator?.signalEventAdded(event);
    }
    // internal
    // handle action removed
    handleEventRemoved(event) {
      logInfo("widget: event removed: " + event.name);
      this.trigger("eventremove", event.name);
      this._communicator?.signalEventRemoved(event.name);
    }
    // internal, called from EventDesc to bubble event
    eventBubbleHandler(type, event, eventDesc) {
      if (type === "trigger") this.triggerEventTrigger(eventDesc, event);
      if (type === "change") this.triggerEventChanged(eventDesc, event.value);
    }
    triggerEventTrigger(eventDesc, event) {
      this.trigger("eventtrigger", event, eventDesc);
      this._communicator?.signalEventTriggered(eventDesc, event);
    }
    triggerEventChanged(eventDesc, newValue) {
      this.trigger("eventchange", newValue, eventDesc);
      this._communicator?.signalEventChanged(eventDesc, newValue);
    }
    // --- Serialization ---
    /**
     * Serializes the Widget for transport
     */
    serialize() {
      return {
        id: this.id,
        enabled: this.enabled,
        params: this.params.map((p) => p.serialize()),
        actions: this.actions.map((a) => a.serialize()),
        events: this.events.map((e) => e.serialize())
      };
    }
    // --- Event Registration Shortcuts ---
    onChange(handler, name, data) {
      this.on("change", handler, name, data);
    }
    offChange(handler, name) {
      this.off("change", handler, name);
    }
    onParamAdd(handler, name, data) {
      this.on("paramadd", handler, name, data);
    }
    offParamAdd(handler, name) {
      this.off("paramadd", handler, name);
    }
    onParamRemove(handler, name, data) {
      this.on("paramremove", handler, name, data);
    }
    offParamRemove(handler, name) {
      this.off("paramremove", handler, name);
    }
    onParamChange(handler, name, data) {
      this.on("paramchange", handler, name, data);
    }
    offParamChange(handler, name) {
      this.off("paramchange", handler, name);
    }
    onParamSet(handler, name, data) {
      this.on("paramset", handler, name, data);
    }
    offParamSet(handler, name) {
      this.off("paramset", handler, name);
    }
    onActionAdd(handler, name, data) {
      this.on("actionadd", handler, name, data);
    }
    offActionAdd(handler, name) {
      this.off("actionadd", handler, name);
    }
    onActionRemove(handler, name, data) {
      this.on("actionremove", handler, name, data);
    }
    offActionRemove(handler, name) {
      this.off("actionremove", handler, name);
    }
    onActionChange(handler, name, data) {
      this.on("actionchange", handler, name, data);
    }
    offActionChange(handler, name) {
      this.off("actionchange", handler, name);
    }
    onActionInvoke(handler, name, data) {
      this.on("actioninvoke", handler, name, data);
    }
    offActionInvoke(handler, name) {
      this.off("actioninvoke", handler, name);
    }
    onActionParamAdd(handler, name, data) {
      this.on("actionparamadd", handler, name, data);
    }
    offActionParamAdd(handler, name) {
      this.off("actionparamadd", handler, name);
    }
    onActionParamRemove(handler, name, data) {
      this.on("actionparamremove", handler, name, data);
    }
    offActionParamRemove(handler, name) {
      this.off("actionparamremove", handler, name);
    }
    onActionParamChange(handler, name, data) {
      this.on("actionparamchange", handler, name, data);
    }
    offActionParamChange(handler, name) {
      this.off("actionparamchange", handler, name);
    }
    onEventAdd(handler, name, data) {
      this.on("eventadd", handler, name, data);
    }
    offEventAdd(handler, name) {
      this.off("eventadd", handler, name);
    }
    onEventRemove(handler, name, data) {
      this.on("eventremove", handler, name, data);
    }
    offEventRemove(handler, name) {
      this.off("eventremove", handler, name);
    }
    onEventChange(handler, name, data) {
      this.on("eventchange", handler, name, data);
    }
    offEventChange(handler, name) {
      this.off("eventchange", handler, name);
    }
    onEventTrigger(handler, name, data) {
      this.on("eventtrigger", handler, name, data);
    }
    offEventTrigger(handler, name) {
      this.off("eventtrigger", handler, name);
    }
    onPagePopulate(handler, name, data) {
      this.on("pagepopulate", handler, name, data);
    }
    offPagePopulate(handler, name) {
      this.off("pagepopulate", handler, name);
    }
    // --- Utility ---
    toString() {
      return `[Widget id=${this.id} title=${this.title}]`;
    }
  };

  // src/rootBase.ts
  var RootBase = class extends EventableBase {
    constructor() {
      super(...arguments);
      /** Communication object (stub for now) */
      this.comm = null;
      /** Connected state */
      this._connected = false;
      /** Loaded state */
      this._loaded = false;
    }
    /**
     * Gets or sets whether the root is connected to a parent page.
     */
    get connected() {
      return this._connected;
    }
    set connected(val) {
      this._connected = val;
    }
    /**
     * Gets or sets whether the root is loaded.
     */
    get loaded() {
      return this._loaded;
    }
    set loaded(val) {
      this._loaded = val;
    }
    /**
     * Triggers a load event (for compatibility with legacy root)
     */
    triggerLoad() {
      this.trigger("load", void 0);
    }
    /**
     * Triggers a widgetload event (for compatibility with legacy root)
     */
    triggerWidgetLoad(widgetID) {
      this.trigger("widgetload", widgetID);
    }
    /**
     * Mark as loaded and trigger load event if not already loaded
     */
    markLoaded() {
      if (this.loaded) return;
      this.loaded = true;
      this.triggerLoad();
    }
    // Add more shared logic as needed
    routeFromWidget(name, payload, widgetID) {
    }
    receiveFromParent(name, payload) {
    }
  };

  // src/utils.ts
  function parseQueryString(duplicates = false, lastOneWins = false) {
    const urlParams = {};
    if (!window.location) return urlParams;
    const queryString = window.location.search == null || window.location.search.length > 0 ? window.location.search : "";
    let match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function(s) {
      return decodeURIComponent(s.replace(pl, " "));
    }, query = queryString.substring(1);
    while (match = search.exec(query)) {
      let name = decode(match[1]), value = decode(match[2]);
      if (duplicates) {
        if (urlParams[name] !== void 0) {
          if (isArray(urlParams[name]))
            urlParams[name].push(value);
          else
            urlParams[name] = [urlParams[name], value];
        } else
          urlParams[name] = value;
      } else if (lastOneWins || urlParams[name] === void 0)
        urlParams[name] = value;
    }
    return urlParams;
  }
  function isValidSvidgetElement(xele, name) {
    return xele != null && xele.localName == name && xele.namespaceURI == namespaces.svidget;
  }
  function fixSVGSizing() {
    const root = DOM.root();
    if (root && root.viewBox && root.viewBox.baseVal && root.viewBox.baseVal.width > 0 && root.viewBox.baseVal.height > 0) {
      root.setAttribute("width", "100%");
      root.setAttribute("height", "100%");
    }
  }
  function getSvidgetElement(name) {
    const eles = getByNameSvidget(name, true);
    if (!eles || eles.length === 0) return null;
    return eles[0];
  }
  function getByNameSvidget(tagName, asArray) {
    return DOM.getByNameNS(namespaces.svidget, tagName, asArray);
  }

  // src/communicatorBase.ts
  var CommunicatorBase = class {
    constructor() {
      this.addMessageEvent();
    }
    addMessageEvent() {
      if (!window.addEventListener) return;
      window.addEventListener("message", this.receiveXSM.bind(this), false);
    }
    receiveXSM(event) {
      if (event == null) return;
      const msgData = event.data;
      if (msgData == null) return;
      this.receiveMessage(msgData);
    }
  };

  // src/widgetCommunicator.ts
  var WidgetCommunicator = class extends CommunicatorBase {
    constructor(widgetID, messageHandler) {
      super();
      this.sameParentDomain = null;
      this._connected = false;
      this._widgetID = widgetID;
      this.messageHandler = messageHandler;
    }
    /**
     * Notifies the communicator that the widget is now connected to the parent page.
     * This is called once the page establishes a connection with the widget.
     * @param widgetID The ID of the widget to connect to. (assigned at page level)
     */
    connect(widgetID) {
      this._widgetID = widgetID;
      this._connected = true;
      logInfo(`WidgetCommunicator connected for widget ID: ${this._widgetID}`);
    }
    get widgetID() {
      return this._widgetID;
    }
    /**
     * Handle incoming messages from the page window.
     * @param data Data received from the page window
     */
    receiveMessage(data) {
      this.messageHandler(data);
    }
    signalParent(name, payload) {
      if (this.isParentSameDomain()) {
        this.signalParentDirect(name, payload, this.widgetID);
      } else {
        this.signalParentXSM(name, payload, this.widgetID);
      }
    }
    signalParentDirect(name, payload, widgetID) {
      const root = window?.parent?.svidget;
      if (root != null) {
        const msg = this.buildParentMessageData(name, payload, widgetID);
        setTimeout(() => {
          root.routeFromWidget(msg);
        }, 0);
      }
    }
    signalParentXSM(name, payload, widgetID) {
      if (window.parent != null && window.parent.postMessage != null) {
        var msg = this.buildParentMessageData(name, payload, widgetID);
        window.parent.postMessage(msg, "*");
      }
    }
    /* Single Methods */
    signalStartAck(transport) {
      logInfo("widget: signalStartAck {id: " + this.widgetID + "}");
      this.signalParent("startack", transport);
    }
    signalParamAdded(param) {
      if (!this._connected) return;
      logInfo("widget: signalParamAdded {id: " + this.widgetID + "}");
      var transport = param.serialize();
      this.signalParent("paramadded", transport);
    }
    signalParamRemoved(paramName) {
      if (!this._connected) return;
      logInfo("widget: signalParamRemoved {id: " + this.widgetID + "}");
      this.signalParent("paramremoved", paramName);
    }
    signalParamChanged(param, changeData) {
      if (!this._connected) return;
      logInfo("widget: signalParamChanged {id: " + this.widgetID + "}");
      changeData.name = param.name;
      this.signalParent("paramchanged", changeData);
    }
    signalParamSet(param, changeData) {
      if (!this._connected) return;
      logInfo("widget: signalParamSet {id: " + this.widgetID + "}");
      changeData.name = param.name;
      this.signalParent("paramset", changeData);
    }
    // Actions/Action Params
    signalActionAdded(action) {
      if (!this._connected) return;
      logInfo("widget: signalActionAdded {id: " + this.widgetID + "}");
      var transport = action.serialize();
      this.signalParent("actionadded", transport);
    }
    signalActionRemoved(actionName) {
      if (!this._connected) return;
      logInfo("widget: signalActionRemoved {id: " + this.widgetID + "}");
      this.signalParent("actionremoved", actionName);
    }
    // changeData: { name: actionName, property: "enabled", value: val }
    signalActionChanged(action, changeData) {
      if (!this._connected) return;
      logInfo("widget: signalActionChanged {id: " + this.widgetID + "}");
      changeData.name = action.name;
      this.signalParent("actionchanged", changeData);
    }
    // returnData: { name: actionName, returnValue: "enabled", value: val }
    signalActionInvoked(action, returnData) {
      if (!this._connected) return;
      logInfo("widget: signalActionInvoked {id: " + this.widgetID + "}");
      returnData.name = action.name;
      this.signalParent("actioninvoked", returnData);
    }
    signalActionParamAdded(actionParam, actionName) {
      if (!this._connected) return;
      logInfo("widget: signalActionParamAdded {id: " + this.widgetID + "}");
      var transport = actionParam.serialize();
      transport.actionName = actionName;
      this.signalParent("actionparamadded", transport);
    }
    signalActionParamRemoved(actionParamName, actionName) {
      if (!this._connected) return;
      logInfo("widget: signalActionParamRemoved {id: " + this.widgetID + "}");
      var transport = { name: actionParamName, actionName };
      this.signalParent("actionparamremoved", transport);
    }
    signalActionParamChanged(actionParam, actionName, changeData) {
      if (!this._connected) return;
      logInfo("widget: signalActionParamChanged {id: " + this.widgetID + "}");
      changeData.name = actionParam.name;
      changeData.actionName = actionName;
      this.signalParent("actionparamchanged", changeData);
    }
    // Events
    signalEventAdded(eventDesc) {
      if (!this._connected) return;
      logInfo("widget: signalEventAdded {id: " + this.widgetID + "}");
      var transport = eventDesc.serialize();
      this.signalParent("eventadded", transport);
    }
    signalEventRemoved(eventDescName) {
      if (!this._connected) return;
      logInfo("widget: signalEventRemoved {id: " + this.widgetID + "}");
      this.signalParent("eventremoved", eventDescName);
    }
    signalEventChanged(eventDesc, changeData) {
      if (!this._connected) return;
      logInfo("widget: signalEventChanged {id: " + this.widgetID + "}");
      changeData.name = eventDesc.name;
      this.signalParent("eventchanged", changeData);
    }
    signalEventTriggered(eventDesc, value) {
      if (!this._connected) return;
      logInfo("widget: signalEventTriggered {id: " + this.widgetID + "}");
      var transport = { name: eventDesc.name, value };
      this.signalParent("eventtriggered", transport);
    }
    /* Misc */
    buildParentMessageData(name, payload, widgetID) {
      return {
        name,
        payload,
        widget: widgetID
      };
    }
    // note: this returns true when widget is forced cross domain
    isParentSameDomain() {
      if (this.sameParentDomain == null) this.sameParentDomain = this.checkParentSameDomain();
      return this.sameParentDomain;
    }
    checkParentSameDomain() {
      if (window.parent == null) return false;
      try {
        var d = window.parent.document;
        return true;
      } catch (ex) {
        return false;
      }
    }
  };

  // src/widgetRoot.ts
  var declaredHandlerName = "_declared";
  var WidgetRoot = class extends RootBase {
    constructor() {
      super();
      this.widget = new Widget();
      this.readyWidget();
    }
    /**
     * Shortcut to the widget instance (for svidget.$)
     */
    get $() {
      return this.widget;
    }
    /**
     * Shortcut to the widget instance (for svidget.current)
     */
    get current() {
      return this.widget;
    }
    readyWidget() {
      logInfo("widget: readyWidget");
      this.readyCommunicator();
      this.startWidget();
      this.markLoaded();
    }
    readyCommunicator() {
      this._communicator = new WidgetCommunicator(
        this.widget.id,
        this.routeFromParent.bind(this)
      );
      this.widget.setCommunicator(this._communicator);
    }
    startWidget() {
      this.parseElements();
      if (!this.connected) this.startWidgetStandalone();
      else this.startWidgetConnected();
    }
    startWidgetStandalone() {
      logInfo("startWidgetStandalone");
      var paramValues = this.getParamValuesFromQueryString();
      this.setParamValues(paramValues, true);
      this.widget.start();
    }
    startWidgetConnected() {
      logInfo("startWidgetConnected");
      if (this._connectedParamValues != null) {
        this.setParamValues(this._connectedParamValues);
        this.widget.setPopulatedFromPage();
      }
      this.widget.start();
    }
    // Gets the param values from the query string.
    getParamValuesFromQueryString() {
      var qs = parseQueryString();
      return qs;
    }
    /**
     * Connects the widget to a parent page.
     * @param id - The widget ID.
     * @param paramValues - Optional initial parameter values.
     * @param connected - Whether the widget is connected.
     */
    routeFromParent(data) {
      const { name, payload } = data;
      logInfo("widget: routeFromParent {name: " + name + "}");
      if (name == "start") this.handleReceiveParentStart(payload);
      else if (name == "actioninvoke")
        this.handleReceiveParentActionInvoke(payload);
      else if (name == "eventtrigger")
        this.handleReceiveParentEventTrigger(payload);
      else if (name == "propertychange")
        this.handleReceiveParentPropertyChange(payload);
    }
    // SUMMARY
    // Sets the param values for every param using the values from the specified object. This object can be from the query string or parent.
    // Params initialized with a value will be skipped if there is no matching entry in the values object.
    setParamValues(paramValues, qsMode = false) {
      var col = this.widget.params;
      if (col == null) return;
      col.forEach((p) => {
        var key = qsMode ? p.shortName || p.name : p.name;
        var val = paramValues[key];
        if (val === void 0) val = paramValues[p.name];
        if (val === void 0) val = p.defaultValue;
        if (key !== void 0) {
          p.value = val;
        }
      });
    }
    /** Element Parsing */
    /* Parse Elements as Declared Objects */
    /** Parses <svidget:params>, <svidget:actions>, <svidget:events> elements and populates the widget. */
    parseElements() {
      const paramsElement = getSvidgetElement("params");
      this.populateParams(paramsElement);
      const actionsElement = getSvidgetElement("actions");
      this.populateActions(actionsElement);
      const eventsElement = getSvidgetElement("events");
      this.populateEvents(eventsElement);
    }
    // Populates Params into the widget based on the <svidget:params> element
    populateParams(xele) {
      if (xele == null) return;
      const widget = this.current;
      this.populateElementObjects(xele, (nextEle, widget2) => {
        const param = this.buildParam(nextEle, widget2);
        if (param != null) widget2.addParam(param);
      });
      this.wireDeclaredHandler(widget, widget.onParamAdd, DOM.attrValue(xele, "onadd"));
      this.wireDeclaredHandler(widget, widget.onParamRemove, DOM.attrValue(xele, "onremove"));
    }
    buildParam(xele, widget) {
      if (!isValidSvidgetElement(xele, "param")) return null;
      const name = DOM.attrValue(xele, "name");
      if (name == null) return null;
      const value = DOM.attrValue(xele, "value");
      const options = this.buildOptions(xele, ParamOptionProperties);
      const param = widget.newParam(name, value, options);
      this.wireDeclaredHandler(param, param.onChange, DOM.attrValue(xele, "onchange"));
      this.wireDeclaredHandler(param, param.onSet, DOM.attrValue(xele, "onset"));
      return param;
    }
    populateActions(xele) {
      if (xele == null) return;
      const widget = this.current;
      this.populateElementObjects(xele, (nextEle, widget2) => {
        const action = this.buildAction(nextEle, widget2);
        if (action != null) {
          widget2.addAction(action);
          this.populateActionParams(nextEle, action);
        }
      });
      this.wireDeclaredHandler(widget, widget.onActionAdd, DOM.attrValue(xele, "onadd"));
      this.wireDeclaredHandler(widget, widget.onActionRemove, DOM.attrValue(xele, "onremove"));
    }
    // Populates action params into the action
    populateActionParams(actionEle, action) {
      if (actionEle == null) return;
      this.populateElementObjects(actionEle, (nextEle) => {
        const param = this.buildActionParam(nextEle, action);
        if (param != null) action.addParam(param);
      });
    }
    buildAction(xele, widget) {
      if (!isValidSvidgetElement(xele, "action")) return null;
      const name = DOM.attrValue(xele, "name");
      if (name == null) return null;
      const options = this.buildOptions(xele, ActionOptionProperties);
      const action = widget.newAction(name, options);
      this.wireDeclaredHandler(action, widget.onActionChange, DOM.attrValue(xele, "onchange"));
      this.wireDeclaredHandler(action, widget.onActionInvoke, DOM.attrValue(xele, "oninvoke"));
      this.wireDeclaredHandler(
        action,
        widget.onActionParamAdd,
        DOM.attrValue(xele, "onparamadd")
      );
      this.wireDeclaredHandler(
        action,
        widget.onActionParamRemove,
        DOM.attrValue(xele, "onparamremove")
      );
      this.wireDeclaredHandler(
        action,
        widget.onActionParamChange,
        DOM.attrValue(xele, "onparamchange")
      );
      return action;
    }
    buildActionParam(xele, action) {
      if (!isValidSvidgetElement(xele, "actionparam")) return null;
      const name = DOM.attrValue(xele, "name");
      if (name == null) return null;
      const options = this.buildOptions(xele, ActionParamOptionProperties);
      const param = action.newParam(name, options);
      this.wireDeclaredHandler(param, param.onChange, DOM.attrValue(xele, "onchange"));
      return param;
    }
    // Populates Events into the widget based on the <svidget:events> element
    populateEvents(xele) {
      if (xele == null) return;
      const widget = this.current;
      this.populateElementObjects(xele, (nextEle, widget2) => {
        const ev = this.buildEvent(nextEle, widget2);
        if (ev != null) widget2.addEvent(ev);
      });
      this.wireDeclaredHandler(widget, widget.onEventAdd, DOM.attrValue(xele, "onadd"));
      this.wireDeclaredHandler(widget, widget.onEventRemove, DOM.attrValue(xele, "onremove"));
    }
    buildEvent(xele, widget) {
      if (!isValidSvidgetElement(xele, "event")) return null;
      const name = DOM.attrValue(xele, "name");
      if (name == null) return null;
      const options = this.buildOptions(xele, EventDescOptionProperties);
      const ev = widget.newEvent(name, options);
      this.wireDeclaredHandler(ev, ev.onChange, DOM.attrValue(xele, "onchange"));
      this.wireDeclaredHandler(ev, ev.onTrigger, DOM.attrValue(xele, "ontrigger"));
      return ev;
    }
    populateElementObjects(xele, eachAction) {
      if (xele == null || !xele.children) return;
      const widget = this.current;
      let nextEle = xele.firstElementChild;
      while (nextEle != null) {
        if (eachAction) eachAction(nextEle, widget);
        nextEle = nextEle.nextElementSibling;
      }
    }
    buildOptions(xele, optionProps) {
      const options = {};
      if (!optionProps || !Array.isArray(optionProps)) return options;
      for (let i = 0; i < optionProps.length; i++) {
        const optName = optionProps[i];
        const optVal = DOM.attrValue(xele, optName);
        if (optVal != null) options[optName] = optVal;
      }
      return options;
    }
    /**
     * Wires a handler declared on the XML element directly to an object based on the function string.
     * Looks for the function name in global scope.
     * Example: <svidget:action name="myAction" oninvoke="myInvokeHandler" />, "myInvokeHandler" is declared event handler
     * @param obj - The object containing the "on" event handler
     * @param onEventFunc - The "on" event handler function
     * @param funcStr - The function name as a string to find in global scope
     */
    wireDeclaredHandler(obj, onEventFunc, funcStr) {
      if (onEventFunc == null) return;
      var func = findFunction(funcStr);
      if (func == null || !isFunction(func)) return;
      onEventFunc.call(obj, func, declaredHandlerName);
    }
    /* Signal Handlers */
    // payload == { id: widgetRef.id(), params: paramValues };
    handleReceiveParentStart(payload) {
      payload = payload ?? {};
      var connected = payload.connected !== false;
      this.connectWidget(payload.id, payload.params, connected);
      if (connected) this._communicator?.signalStartAck(this.widget.serialize());
      this.startWidgetWithPageParams();
    }
    handleReceiveParentPropertyChange(payload) {
      payload = payload || {};
      var objType = payload.type;
      if (payload.type == "param" && payload.propertyName == "value" && payload.name != null) {
        var param = this.widget.getParam(payload.name);
        if (param != null) {
          param.value(payload.value);
        }
      }
    }
    // payload == { action: actionProxy.name(), args: argList }
    handleReceiveParentActionInvoke(payload) {
      payload = payload || {};
      var actionName = payload.action;
      var action = this.widget.getAction(actionName);
      if (action == null || !action.external) return;
      action.invoke(payload.args);
    }
    handleReceiveParentEventTrigger(payload) {
      payload = payload || {};
      var eventName = payload.event;
      var ev = this.widget.getEvent(eventName);
      if (ev == null || !ev.external) return;
      ev.dispatch(payload.data);
    }
    // Called by parent (via global object) to signal that is has established its relationship with the parent page.
    // Params:
    //   id: the ID assigned to this widget
    //   paramValues: the param values as they were declared on the page, or provided if widget declared programmatically
    //   connected: whether the widget is connected to its parent, if false it will remain in standalone mode and cease any further communication with the parent
    // Remarks:
    //   start() may be called at any point during the DOM lifecycle for this widget, i.e. while DOM is still parsing or when completed
    connectWidget(id, paramValues, connected) {
      var widget = this.widget;
      if (widget.connected) return;
      if (connected) {
        logInfo("widget: connect {id: " + id + "}");
        widget.connect(id);
        this._connected = true;
      } else {
        logInfo("widget: standalone {id: " + id + "}");
      }
      this._connectedParamValues = paramValues ?? {};
      fixSVGSizing();
    }
    startWidgetWithPageParams() {
      var widget = this.widget;
      if (widget.started) {
        this.setParamValues(this._connectedParamValues);
        widget.setPopulatedFromPage();
      }
    }
  };

  // src/index.svg.ts
  function onDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }
  onDomReady(() => {
    const root = new WidgetRoot();
    window.svidget = root;
  });
  return __toCommonJS(index_svg_exports);
})();
//# sourceMappingURL=index.svg.global.js.map