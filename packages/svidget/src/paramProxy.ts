import { Proxy } from "./proxy";

/**
 * ParamProxy class
 * Proxy for widget param in the web context.
 * @module ParamProxy
 */
export class ParamProxy extends Proxy {

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    this.on("change", handler);
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    this.off("change", handler);
  }

  /**
   * Registers a handler for the 'set' event.
   */
  onSet(handler: (...args: any[]) => void): void {
    this.on("set", handler);
  }

  /**
   * Unregisters a handler for the 'set' event.
   */
  offSet(handler: (...args: any[]) => void): void {
    this.off("set", handler);
  }
}
