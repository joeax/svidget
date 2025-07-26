/**
 * Conversion utilities
 * Utility functions for converting between different data types and structures used in Svidget.
 * @module conversion
 */

import { ParamType, ParamSubType, Optional } from './types';

/**
 * Converts a value to the specified ParamType and ParamSubType.
 * Formerly "to()"
 */
export function convertTo(
    val: any,
    type: ParamType,
    subType?: ParamSubType,
    typeData?: Optional<string>
): Optional<string | number | boolean | any[] | object> {
    switch (type) {
        case 'string':
            return toString(val, subType, typeData);
        case 'number':
            return toNumber(val, subType === 'integer');
        case 'boolean':
            return toBool(val);
        case 'array':
            return toArray(val);
        default:
            return toObject(val);
    }
}

export function toString(val: any, subType?: ParamSubType, typeData?: Optional<string>): Optional<string> {
    if (val == null) return val;
    if (subType === 'choice') return toChoiceString(val, typeData);
    if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
    return val + '';
}

export function toChoiceString(val: any, typeData?: Optional<string>): Optional<string> {
    val = val + '';
    if (!typeData) return val;
    const choices = typeData.split('|');
    if (!choices || choices.length === 0) return null;
    if (choices.indexOf(val) >= 0) return val;
    return choices[0];
}

export function toNumber(val: any, isInt?: boolean): number {
    if (!val) return 0;
    if (val === true) return 1;
    if (isInt) return parseInt(val + '');
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
}

export function toBool(val: any): boolean {
    const strval = (val + '').toLowerCase();
    if (strval === 'false') return false;
    if (+val === 0) return false;
    return !!val;
}

export function toArray(val: any): any[] {
    if (val == null) return val;
    if (Array.isArray(val)) return val;
    if (isArrayString(val)) {
        const a = parseArray(val);
        if (a != null) return a;
    }
    return [val];
}

export function toObject(val: any): Optional<object> {
    if (val == null) return val;
    if (isJSONString(val)) {
        const newVal = jsonifyString(val);
        try {
            return JSON.parse(newVal);
        } catch {
            // fallback to original value
        }
    }
    return val;
}

export function isJSONString(val: any): boolean {
    if (!val) return false;
    val = (val + '').trim();
    return val.length > 0 && typeof val === 'string' && val.charAt(0) === '{' && val.charAt(val.length - 1) === '}';
}

export function isArrayString(val: any): boolean {
    if (val == null) return false;
    val = (val + '').trim();
    return val.length > 0 && val.charAt(0) === '[' && val.charAt(val.length - 1) === ']';
}

export function isQuotedString(val: any): boolean {
    if (!val) return false;
    val = (val + '').trim();
    return (
        val.length > 0 &&
        typeof val === 'string' &&
        ((val.charAt(0) === "'" && val.charAt(val.length - 1) === "'") ||
            (val.charAt(0) === '"' && val.charAt(val.length - 1) === '"'))
    );
}

export function parseArray(val: any): Optional<any[]> {
    val = jsonifyString(val);
    const wrap = `{"d":${val}}`;
    try {
        const result = JSON.parse(wrap);
        if (result && result.d) return result.d;
        return null;
    } catch {
        return null;
    }
}

/**
 * Converts a string to a JSON-safe format.
 * This function escapes single quotes and ensures the string is safe for JSON serialization.
 */
export function jsonifyString(val: any): string {
    if (val == null || val.indexOf("'") < 0) return val;
    val = (val + '').trim();
    const SQ = "'";
    const DQ = '"';
    const BS = '\\';
    let result = '';
    let inQuotes = false;
    let quoteChar: string | null = null;
    let escaped = false;

    for (let i = 0; i < val.length; i++) {
        let char = val[i];
        let newChar = char;
        if (char === SQ || char === DQ) {
            if (escaped) {
                if (quoteChar === SQ && char === SQ)
                    // result = result.substr(0, result.length - 1);
                    result = result.substring(0, result.length - 1);
                else if (quoteChar === SQ && char === DQ) newChar = BS + BS + DQ;
                escaped = false;
            } else {
                if (inQuotes && char === quoteChar) {
                    inQuotes = false;
                    quoteChar = null;
                    newChar = DQ;
                } else if (inQuotes && char === DQ) {
                    newChar = BS + DQ;
                } else if (!inQuotes) {
                    quoteChar = char;
                    inQuotes = true;
                    newChar = DQ;
                }
            }
        } else if (char === BS) {
            escaped = true;
        }
        result += newChar;
    }
    return result;
}
