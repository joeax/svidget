/**
 * Svidget Types
 * Contains TypeScript union types for Svidget enums.
 * @module types
 */
export type Optional<T> = T | undefined | null;

export type Binding = string | Function | null;

export const ParamTypes = ["string", "number", "boolean", "object", "array"] as const;
export type ParamType = (typeof ParamTypes)[number];

export const ParamSubTypes = ["color", "integer", "date", "time", "datetime", "regex", "choice"] as const;
export type ParamSubType = (typeof ParamSubTypes)[number];

// Action Events
export const ActionEventTypes = [
  "invoke",
  "change",
  "paramchange",
  "paramadd",
  "paramremove",
] as const;
export type ActionEventType = (typeof ActionEventTypes)[number];

// ActionParam Events
export const ActionParamEventTypes = ['change'] as const;
export type ActionParamEventType = (typeof ActionParamEventTypes)[number];

// EventDesc Events
export const EventDescEventTypes = ['trigger', 'change'] as const;
export type EventDescEventType = (typeof EventDescEventTypes)[number];

// Param Events
export const ParamEventTypes = ["change", "set"] as const;
export type ParamEventType = (typeof ParamEventTypes)[number];



// export type AnyEventType = ActionEventType | ParamEventType;
