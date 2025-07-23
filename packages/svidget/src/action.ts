import { ActionParam } from "./actionParam";

/**
 * Action class
 * Represents an action that can be invoked on a widget.
 * @module action
 */
export class Action {
  // Event handler arrays
  private invokeHandlers: Array<(...args: any[]) => void> = [];
  private changeHandlers: Array<(...args: any[]) => void> = [];
  /** Name of the action */
  name: string;
  /** Description of the action */
  description: string;
  /** Array of parameters for the action */
  params: ActionParam[];
  /** Handler function to execute when the action is invoked */
  handler: (...args: any[]) => any;

  /**
   * Constructs an Action instance.
   * @param name Name of the action
   * @param description Description of the action
   * @param params Array of parameters for the action
   * @param handler Function to execute when the action is invoked
   */
  constructor(
    name: string,
    description: string,
    params: ActionParam[] = [],
    handler: (...args: any[]) => any = () => {}
  ) {
    this.name = name;
    this.description = description;
    this.params = params;
    this.handler = handler;
  }

  addParam(param: ActionParam): void {
    this.params.push(param);
  }

  /**
   * Invokes the action handler with provided arguments.
   * @param args Arguments to pass to the handler
   */
  invoke(...args: any[]): any {
    return this.handler(...args);
  }

  /**
   * Registers a handler for the 'invoke' event.
   */
  onInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers.push(handler);
  }

  /**
   * Registers a handler for the 'change' event.
   */
  onChange(handler: (...args: any[]) => void): void {
    this.changeHandlers.push(handler);
  }

  /**
   * Unregisters a handler for the 'invoke' event.
   */
  offInvoke(handler: (...args: any[]) => void): void {
    this.invokeHandlers = this.invokeHandlers.filter(h => h !== handler);
  }

  /**
   * Unregisters a handler for the 'change' event.
   */
  offChange(handler: (...args: any[]) => void): void {
    this.changeHandlers = this.changeHandlers.filter(h => h !== handler);
  }
}
  // TODO: Implement event registration and emission for 'invoke', 'change', 'paramchange', 'paramadd', 'paramremove'
