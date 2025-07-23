/**
 * DOM utilities
 * Utility functions and classes for working with the DOM in the widget context.
 * Contains DOMQuery and DOMItem classes.
 * @module dom
 */

// TODO: Implement DOMQuery and DOMItem classes per vibespec


/**
 * Represents a query result for DOM elements in the widget context.
 */
export class DOMQuery {
  private elements: DOMItem[];

  constructor(selector: string, context: Document | Element = document) {
    const nodeList = context.querySelectorAll(selector);
    this.elements = Array.from(nodeList).map(el => new DOMItem(el));
  }

  get length(): number {
    return this.elements.length;
  }

  at(index: number): DOMItem | undefined {
    return this.elements[index];
  }

  forEach(callback: (item: DOMItem, index: number) => void): void {
    this.elements.forEach(callback);
  }

  map<T>(callback: (item: DOMItem, index: number) => T): T[] {
    return this.elements.map(callback);
  }

  filter(callback: (item: DOMItem, index: number) => boolean): DOMItem[] {
    return this.elements.filter(callback);
  }

  toArray(): DOMItem[] {
    return [...this.elements];
  }
}


/**
 * Represents a single DOM element in the widget context.
 */
export class DOMItem {
  private el: Element;

  constructor(el: Element) {
    this.el = el;
  }

  get element(): Element {
    return this.el;
  }

  get id(): string | null {
    return this.el.id || null;
  }

  get classList(): DOMTokenList {
    return this.el.classList;
  }

  get tagName(): string {
    return this.el.tagName;
  }

  getAttribute(attr: string): string | null {
    return this.el.getAttribute(attr);
  }

  setAttribute(attr: string, value: string): void {
    this.el.setAttribute(attr, value);
  }

  removeAttribute(attr: string): void {
    this.el.removeAttribute(attr);
  }

  addClass(cls: string): void {
    this.el.classList.add(cls);
  }

  removeClass(cls: string): void {
    this.el.classList.remove(cls);
  }

  hasClass(cls: string): boolean {
    return this.el.classList.contains(cls);
  }

  querySelector(selector: string): DOMItem | null {
    const found = this.el.querySelector(selector);
    return found ? new DOMItem(found) : null;
  }

  querySelectorAll(selector: string): DOMQuery {
    return new DOMQuery(selector, this.el);
  }
}


/**
 * Creates a new DOM element with the specified tag and optional attributes.
 */
export function createElement(tag: string, attrs?: Record<string, string>): Element {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/**
 * Removes the specified element from the DOM.
 */
export function removeElement(el: Element): void {
  if (el.parentElement) {
    el.parentElement.removeChild(el);
  }
}

/**
 * Adds an event listener to the element.
 */
export function addEventListener(el: Element, type: string, listener: EventListenerOrEventListenerObject): void {
  el.addEventListener(type, listener);
}

/**
 * Removes an event listener from the element.
 */
export function removeEventListener(el: Element, type: string, listener: EventListenerOrEventListenerObject): void {
  el.removeEventListener(type, listener);
}
