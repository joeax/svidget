
/**
 * EventableBase class
 * Provides basic event handling functionality for classes that fire events.
 */
export class EventableBase {
  /** Event handler registry */
  protected eventHandlers: { [event: string]: Array<(...args: any[]) => void> } =
    {};

  /**
   * Registers an event handler for a widget event.
   * @param event Event name
   * @param handler Handler function
   */
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) this.eventHandlers[event] = [];
    this.eventHandlers[event].push(handler);
  }

  /**
   * Unregisters an event handler for a widget event.
   * @param event Event name
   * @param handler Handler function
   */
  off(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      (h) => h !== handler
    );
  }

  /**
   * Triggers a widget event and calls all registered handlers.
   * @param event Event name
   * @param args Arguments to pass to handlers
   */
  trigger(event: string, ...args: any[]): void {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach((h) => h(...args));
  }
}