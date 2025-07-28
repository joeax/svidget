/**
 * Svidget Types
 * Contains TypeScript union types for Svidget enums.
 * @module types
 */
export type Optional<T> = T | undefined | null;

export type Binding = string | Function | null;

// most of these type we should consider moving close to their objects

export const ParamTypes = ["string", "number", "boolean", "object", "array"] as const;
export type ParamType = (typeof ParamTypes)[number];

export const ParamSubTypes = ["color", "integer", "date", "time", "datetime", "regex", "choice"] as const;
export type ParamSubType = (typeof ParamSubTypes)[number];

