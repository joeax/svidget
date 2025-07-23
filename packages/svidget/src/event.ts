  /**
   * Registers a handler for the 'trigger' event.
   */
  onTrigger(handler: (...args: any[]) => void): void {
    // TODO: Implement event registration logic
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    // TODO: Implement event registration logic
  }

  /**
   * Unregisters a handler for the 'trigger' event.
   */
  offTrigger(handler: (...args: any[]) => void): void {
    // TODO: Implement event unregistration logic
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    // TODO: Implement event unregistration logic
  }
/**
 * Event class
 * Represents an event emitted by a widget.
 * @module Event
 */
// ...existing code...

/**
 * Event class
 * Represents an event emitted by a widget.
 * @module event
 */
export class Event {
  private triggerHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];
  name: string;
  description: string;
  external: boolean;

  constructor(name: string, external: boolean = false) {
    this.name = name;
    this.description = "";
    this.external = external;
  }
  /**
   * Triggers the event and calls all registered trigger handlers.
   */
  trigger(...args: any[]): void {
    this.triggerHandlers.forEach((h: (...args: any[]) => void) => h(...args));
  }

  /**
   * Registers a handler for the 'trigger' event.
   */
  onTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers.push(handler);
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    this.changeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'trigger' event.
   */
  offTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers = this.triggerHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    this.changeHandlers = this.changeHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }
}
