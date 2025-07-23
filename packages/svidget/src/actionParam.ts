/**
 * ActionParam class
 * Represents a parameter for an action in a widget.
 * @module ActionParam
 */
import { ParamBase } from "./paramBase";
import { ParamType, ParamSubType } from "./types";

export class ActionParam extends ParamBase {
  // ...base properties are inherited from ParamBase...
  /**
   * Constructs an ActionParam instance.
   * @param name Name of the parameter
   * @param type Type of the parameter
   * @param value Value of the parameter
   * @param defaultValue Default value of the parameter
   * @param description Description of the parameter
   * @param subType Subtype of the parameter
   * @param typedata Choices for the parameter
   */
  constructor(
    name: string,
    type: ParamType,
    value: any = undefined,
    defaultValue: any = undefined,
    description: string = "",
    subType?: ParamSubType,
    typedata?: string
  ) {
    super(name, type, value, defaultValue, description, subType, typedata);
  }

  // TODO: Implement event registration and emission for 'change', 'set'
}
