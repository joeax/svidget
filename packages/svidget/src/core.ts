/**
 * Core functions for Svidget
 * @module core
 */

import { Binding, ParamSubType, ParamType, ParamTypes, ParamSubTypes, Optional } from './types';
import { toString } from "./conversion";

/**
 * Svidget core utilities and initialization
 * Only includes modern, relevant utilities per vibespec
 */

// // define window and document if needed
// // note: global declared by closure
// var window = global;
// var document = window.document || {};
// //var root = null;

// /* REGION Common Properties */

// root = null; // set in Svidget.Root, this is the singleton instance to the global "svidget" object.
// global = global; // In server side environments will === global, in browser === window


export const VERSION = "0.3.5";
export const declaredHandlerName = "_declared";
export const emptyArray: any[] = [];
export const defaultType = "object";


/**
 * Converts any collection-like object to an array.
 */
export function toArray<T>(anyCollection: ArrayLike<T>): T[] | null {
  if (!anyCollection || !anyCollection.length) return null;
  try {
    return Array.prototype.slice.call(anyCollection, 0);
  } catch {
    const res: T[] = [];
    for (let i = 0; i < anyCollection.length; i++) {
      res.push(anyCollection[i]);
    }
    return res;
  }
}

/**
 * Determines if passed in object is actually an array.
 */
export function isArray(array: any): boolean {
  return array != null && Array.isArray(array);
}

export function isFunction(func: any): boolean {
  return typeof func === "function";
}

export function isString(str: any): boolean {
  return typeof str === "string";
}

export function getType(val: any): ParamType {
  if (val == null) return defaultType;
  if (isArray(val)) return "array";
  const type = typeof val;
  if (type === "string" || type === "number" || type === "boolean") return type;
  return "object";
}

export function resolveType(type: unknown): ParamType {
  const resolvedType = String(type).toLowerCase();
  if (ParamTypes.find((t) => t === resolvedType) === undefined) return defaultType;
  if (resolvedType === "bool") return "boolean";
  return resolvedType as ParamType;
}

export function resolveSubtype(type: string, subType: unknown): ParamSubType | undefined {
    const resolvedType = resolveType(type);
    if (ParamSubTypes.find((t) => t === subType) === undefined) return undefined;
    if (resolvedType === 'string' && (subType === 'color' || subType === 'regex')) return subType;
    if (resolvedType === 'number' && subType === 'integer') return subType;
    return undefined;
}

export function resolveBinding(binding?: Binding): Optional<Binding> {
  if (binding == null) return binding;
  if (typeof binding !== "function") binding = toString(binding);
  return binding;
}

export function wrap(func: any, context: any): Function | undefined {
  // todo: use function.bind() if available
  // ensure func is function, return undefined if not
  if (func == null || typeof func !== "function") return undefined;
  // return a wrapper function
  var p = function () {
    return func.apply(context, arguments);
  };
  return p;
};

// Find the function by name in the specified scope, or just return it if is already a function
// By default scope == global scope
/**
 * Finds a function by name in the given scope or global scope (globalThis).
 * If a function is passed, returns it directly.
 * If a string is passed, looks up the function by name in the provided scope, then globalThis.
 * If not found, attempts to create a function from the string (expression or function body).
 */
export function findFunction(funcNameOrInstance: string | Function, scope?: Record<string, any>): Optional<Function> {
    if (typeof funcNameOrInstance === "function") {
        return funcNameOrInstance;
    }
    if (!funcNameOrInstance) return undefined;
    const name = String(funcNameOrInstance);
    // Use provided scope or globalThis
    const searchScope = scope ?? (globalThis as Record<string, any>);
    let func = searchScope?.[name];
    if (typeof func !== "function" && searchScope !== globalThis) {
        func = (globalThis as any)?.[name];
    }
    if (typeof func === "function") return func;
    // If not found, treat as an expression or function body
    // If it doesn't start with 'return ', wrap as 'return ...'
    if (!name.trim().startsWith("return ")) {
        return new Function("return " + name);
    } else {
        return new Function(name);
    }
}
