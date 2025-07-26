import { Proxy } from "./proxy";

/**
 * EventProxy class
 * Proxy for widget event in the web context.
 * @module EventProxy
 */
export class EventProxy extends Proxy {
  
  /**
   * Registers a handler for the 'trigger' event.
   */
  onTrigger(handler: (...args: any[]) => void): void {
  }

  /**
   * Unregisters a handler for the 'trigger' event.
   */
  offTrigger(handler: (...args: any[]) => void): void {
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
  }
}
