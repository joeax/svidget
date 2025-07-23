import { Proxy } from "./proxy";

/**
 * ActionParamProxy class
 * Proxy for action param in the web context.
 * @module ActionParamProxy
 */
export class ActionParamProxy extends Proxy {
  private changeHandlers: Array<(...args: any[]) => void> = [];
  private setHandlers: Array<(...args: any[]) => void> = [];

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
   * Registers a handler for the 'set' event.
   */
  onSet(handler: (...args: any[]) => void): void {
    this.setHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'set' event.
   */
  offSet(handler: (...args: any[]) => void): void {
    this.setHandlers = this.setHandlers.filter((h: (...args: any[]) => void) => h !== handler);
  }
  name: string;
  value: any;
  type: string;
  description: string;

  constructor(name: string, value: any, type: string, description: string = "") {
    super();
    this.name = name;
    this.value = value;
    this.type = type;
    this.description = description;
  }

  // TODO: Implement additional methods and event logic per vibespec
}

// ...existing code...
