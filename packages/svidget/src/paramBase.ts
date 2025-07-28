import { toString } from './conversion';
import { getType, resolveType, resolveSubtype } from './core';
import { EventableBase } from './eventableBase';
import { Optional, ParamSubType, ParamType } from './types';
import { WidgetEvent } from './widgetEvent';

/**
 * ParamBaseOptions interface
 * Represents the attributes on the <svidget:actionparam> element.
 * @module Action
 */
export interface ParamBaseOptions {
    type?: ParamType;
    subType?: ParamSubType;
    typeData?: string;
    description?: string;
    defaultValue?: any;
}

export type ParamBaseEventNotifier<TEventType extends string = string> = (type: TEventType, event: WidgetEvent) => void;

/**
 * ParamBase class
 * Base class for Param and ActionParam.
 * @module ParamBase
 */
export abstract class ParamBase<
    TEventType extends string = string,
    TOptionsType extends ParamBaseOptions = ParamBaseOptions
> extends EventableBase<TEventType> {
    private _name: string;
    private _type: ParamType = 'string';
    private _subType?: ParamSubType;
    private _description?: Optional<string>;
    private _defaultValue?: any;
    private _typeData?: Optional<string>;

    /**
     * Constructs a ParamBase instance.
     * @param name Name of the parameter
     * @param type Type of the parameter
     * @param value Value of the parameter
     * @param defaultValue Default value of the parameter
     * @param description Description of the parameter
     */
    constructor(name: string, options: TOptionsType) {
        super();
        this._name = name;
        this.setOptionProperties(options);
    }

    private setOptionProperties(options: TOptionsType): void {
        this._type = this.resolveType(options.type, options.defaultValue);
        this._subType = resolveSubtype(this._type, options.subType);
        this._typeData = toString(options.typeData);
        this._description = toString(options.description);
        this._defaultValue = options.defaultValue; //todo: convert to type
    }

    // Helper functions for local use
    private resolveType(type: ParamType | undefined, defaultValue: any) {
        if (type == null) type = getType(defaultValue);
        else type = resolveType(type); // normalize type to a valid type
        return type;
    }

    /**
     * Name of the parameter (immutable after creation)
     */
    get name(): string {
        return this._name;
    }

    /**
     * Description of the parameter
     */
    get description(): Optional<string> {
        return this._description;
    }
    set description(val: Optional<string>) {
        this._description = val;
        this.triggerChange('description', val);
    }

    /**
     * Type of the parameter (e.g., string, number, boolean)
     */
    get type(): ParamType {
        return this._type;
    }
    set type(val: ParamType) {
        // Optionally validate type here
        this._type = val;
        this.triggerChange('type', val);
    }

    /**
     * Default value of the parameter
     */
    get defaultValue(): any {
        return this._defaultValue;
    }
    set defaultValue(val: any) {
        this._defaultValue = val;
        this.triggerChange('defaultValue', val);
    }

    /**
     * Subtype of the parameter (e.g., array, object)
     */
    get subType(): ParamSubType | undefined {
        return this._subType;
    }
    set subType(val: ParamSubType | undefined) {
        // Optionally validate subtype here
        this._subType = val;
        this.triggerChange('subType', val);
    }

    /**
     * Pipe-delimited list of choices (if subType is choice)
     */
    get typedata(): Optional<string> {
        return this._typeData;
    }
    set typeData(val: Optional<string>) {
        this._typeData = val;
        this.triggerChange('typeData', val);
    }

    /**
     * Helper to trigger change event for property
     */
    protected triggerChange(property: keyof TOptionsType, value: any): void {
        if (typeof this.trigger === 'function') {
            this.trigger('change' as TEventType, { property, value });
        }
    }
}
