  private invokeHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];

  /**
   * Registers a handler for the 'invoke' event.
   */
  onInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'invoke' event.
   */
  offInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers = this.invokeHandlers.filter((h: (...args: any[]) => void) => h !== handler);
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
 * ActionProxy class
 * Proxy for widget action in the web context.
 * @module ActionProxy
 */
export class ActionProxy extends Proxy {
  private invokeHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];

  /**
   * Registers a handler for the 'invoke' event.
   */
  onInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'invoke' event.
   */
  offInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers = this.invokeHandlers.filter((h: (...args: any[]) => void) => h !== handler);
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
