/**
 * WidgetEvent class
 * Represents an event emitted in the widget context.
 * @module WidgetEvent
 */

/**
 * WidgetEvent class
 * Represents an event emitted in the widget context. Subclass of Event.
 * @module WidgetEvent
 */
export class WidgetEvent extends Event {
  timestamp: number;
  source: string;

  constructor(type: string, eventInitDict?: EventInit, source: string = "") {
    super(type, eventInitDict);
    this.timestamp = Date.now();
    this.source = source;
  }

  /**
   * Factory method to create a WidgetEvent instance.
   */
  static create(type: string, eventInitDict?: EventInit, source: string = ""): WidgetEvent {
    return new WidgetEvent(type, eventInitDict, source);
  }
}
