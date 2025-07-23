/**
 * ParamBase class
 * Base class for Param and ActionParam.
 * @module ParamBase
 */

import { EventableBase } from "./eventableBase";
import { ParamSubType, ParamType } from "./types";

/**
 * ParamBase class
 * Base class for Param and ActionParam.
 * @module ParamBase
 */
export class ParamBase extends EventableBase {
  /** Name of the parameter */
  name: string;
  /** Description of the parameter */
  description?: string;
  /** Type of the parameter (e.g., string, number, boolean) */
  type: ParamType;
  /** Value of the parameter */
  value: any;
  /** Default value of the parameter */
  defaultValue: any;
  /** Subtype of the parameter (e.g., array, object) */
  subType?: ParamSubType;
  /** Pipe-delimited list of choices (if subType is choice) */
  typedata?: string;
  
  /**
   * Constructs a ParamBase instance.
   * @param name Name of the parameter
   * @param type Type of the parameter
   * @param value Value of the parameter
   * @param defaultValue Default value of the parameter
   * @param description Description of the parameter
   */
  constructor(
    name: string,
    type: ParamType,
    value: any = null,
    defaultValue: any = null,
    description: string = "",
    subType?: ParamSubType,
    typedata?: string
  ) {
    super();
    // Initialize properties
    this.name = name;
    this.type = type;
    this.value = value;
    this.defaultValue = defaultValue;
    this.description = description;
    this.subType = subType;
    this.typedata = typedata;
  }
}
