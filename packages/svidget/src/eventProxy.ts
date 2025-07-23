  private triggerHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];

  /**
   * Registers a handler for the 'trigger' event.
   */
  onTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'trigger' event.
   */
  offTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers = this.triggerHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    this.changeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    this.changeHandlers = this.changeHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }
/**
 * EventProxy class
 * Proxy for widget event in the web context.
 * @module EventProxy
 */
export class EventProxy extends Proxy {
  private triggerHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];

  /**
   * Registers a handler for the 'trigger' event.
   */
  onTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'trigger' event.
   */
  offTrigger(handler: (...args: any[]) => void): void {
    this.triggerHandlers = this.triggerHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    this.changeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    this.changeHandlers = this.changeHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }
}
