import { ParamType, ParamSubType } from "./types";
import { ParamBase } from "./paramBase";

/**
 * Param class
 * Represents a parameter of a widget.
 * @module param
 */
export class Param extends ParamBase {
  private changeHandlers: Array<(...args: any[]) => void> = [];
  private setHandlers: Array<(...args: any[]) => void> = [];
  /** Short name for the parameter. Also used for query string param. */
  shortName: string;
  /** Whether to coerce the value to the specified type */
  coerce?: boolean;
  /** Group name for organizing parameters */
  group?: string;
  /** Sanitizer function or name */
  sanitizer?: ((val: any) => any) | string;

  constructor(name: string, type: ParamType, value: any = null) {
    super(name, type, value);
    this.shortName = "";
    this.defaultValue = null;
    this.subType = "string" as ParamSubType;
    this.typedata = "";
    this.coerce = false;
    this.group = "";
    this.sanitizer = "";
  }
  /**
   * Sets the value of the parameter and triggers set event handlers.
   */
  setValue(val: any): void {
    this.value = val;
    this.setHandlers.forEach((h: (...args: any[]) => void) => h(val));
  }

  /**
   * Changes the definition of the parameter and triggers change event handlers.
   */
  changeDefinition(def: Partial<Param>): void {
    Object.assign(this, def);
    this.changeHandlers.forEach((h: (...args: any[]) => void) => h(def));
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
    this.changeHandlers = this.changeHandlers.filter(
      (h: (...args: any[]) => void) => h !== handler
    );
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
    this.setHandlers = this.setHandlers.filter(
      (h: (...args: any[]) => void) => h !== handler
    );
  }

  // TODO: Implement param logic and event registration
}
