/**
 * Widget class
 * Represents a widget instance in the SVG context.
 * Provides API for parameters, actions, events, and widget lifecycle.
 * @module Widget
 */
import { Param, ParamTransport } from './param';
import { Action, ActionTransport } from './action';
import { EventDesc, EventDescTransport } from './eventDesc';
import { EventableBase, EventHandler } from './eventableBase';

interface WidgetTransport {
    id: string;
    enabled: boolean;
    params: ParamTransport[];
    actions: ActionTransport[];
    events: EventDescTransport[];
}

export class Widget extends EventableBase {
    private _id: string;
    private _title: string;
    private _description: string;
    params: Param[];
    actions: Action[];
    events: EventDesc[];
    private _enabled: boolean;
    private _started: boolean;
    private _connected: boolean;
    private _populatedFromPage: boolean;
    page: any;
    parentElement: Element | null;

    /**
     * Constructs a Widget instance.
     * @param id Widget ID
     * @param title Widget title
     * @param description Widget description
     */
    constructor(id: string, title: string, description: string) {
        super();
        this._id = id;
        this._title = title;
        this._description = description;
        this.params = [];
        this.actions = [];
        this.events = [];
        this._enabled = true;
        this._started = false;
        this._connected = false;
        this._populatedFromPage = false;
        this.page = null;
        this.parentElement = null;
    }

    /**
     * Gets or sets the widget ID.
     */
    get id(): string {
        return this._id;
    }
    private set id(val: string) {
        this._id = val;
    }

    /**
     * Gets or sets the widget title.
     */
    get title(): string {
        return this._title;
    }
    set title(val: string) {
        this._title = val;
    }

    /**
     * Gets or sets the widget description.
     */
    get description(): string {
        return this._description;
    }
    set description(val: string) {
        this._description = val;
    }

    /**
     * Gets or sets whether the widget is enabled. Triggers change event on set.
     */
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(val: boolean) {
        if (this._enabled !== val) {
            this._enabled = val;
            this.trigger('change', { property: 'enabled', value: val });
        }
    }

    /**
     * Gets or sets whether the widget is connected to a parent page.
     */
    get connected(): boolean {
        return this._connected;
    }
    private set connected(val: boolean) {
        this._connected = val;
    }

    /**
     * Gets or sets whether the widget has started (DOM loaded).
     */
    get started(): boolean {
        return this._started;
    }

    /**
     * Gets or sets whether the widget has been populated from the page.
     */
    get populatedFromPage(): boolean {
        return this._populatedFromPage;
    }
    set populatedFromPage(val: boolean) {
        this._populatedFromPage = val;
        this.trigger('pagepopulate', this);
    }

    // --- Lifecycle Methods ---

    /**
     * Called to start the widget (signals DOM is ready)
     */
    start(): void {
        if (this._started) return;
        this._started = true;
    }

    /**
     * Called to connect the widget to a parent page
     * @param id Optional new widget ID
     */
    connect(id: string): void {
        this.id = id;
        this.connected = true;
    }

    /**
     * Sets populatedFromPage and triggers event
     */
    setPopulatedFromPage(): void {
        this.populatedFromPage = true;
        this.trigger('pagepopulate', this);
    }

    // --- Param Management ---

    getParam(selector: string | number): Param | undefined {
        if (typeof selector === 'number') return this.params[selector];
        return this.params.find((p) => p.name === selector);
    }

    addParam(param: Param): boolean {
        if (this.params.some((p) => p.name === param.name)) return false;
        this.params.push(param);
        this.trigger('paramadd', param);
        return true;
    }

    removeParam(name: string): boolean {
        const idx = this.params.findIndex((p) => p.name === name);
        if (idx === -1) return false;
        const [removed] = this.params.splice(idx, 1);
        this.trigger('paramremove', removed.name);
        return true;
    }

    clearParams(): void {
        this.params = [];
        this.trigger('change', { property: 'params', value: [] });
    }

    // --- Action Management ---

    getAction(selector: string | number): Action | undefined {
        if (typeof selector === 'number') return this.actions[selector];
        return this.actions.find((a) => a.name === selector);
    }

    addAction(action: Action): boolean {
        if (this.actions.some((a) => a.name === action.name)) return false;
        this.actions.push(action);
        this.trigger('actionadd', action);
        return true;
    }

    removeAction(name: string): boolean {
        const idx = this.actions.findIndex((a) => a.name === name);
        if (idx === -1) return false;
        const [removed] = this.actions.splice(idx, 1);
        this.trigger('actionremove', removed.name);
        return true;
    }

    clearActions(): void {
        this.actions = [];
        this.trigger('change', { property: 'actions', value: [] });
    }

    // --- Event Management ---

    getEvent(selector: string | number): EventDesc | undefined {
        if (typeof selector === 'number') return this.events[selector];
        return this.events.find((e) => e.name === selector);
    }

    addEvent(event: EventDesc): boolean {
        if (this.events.some((e) => e.name === event.name)) return false;
        this.events.push(event);
        this.trigger('eventadd', event);
        return true;
    }

    removeEvent(name: string): boolean {
        const idx = this.events.findIndex((e) => e.name === name);
        if (idx === -1) return false;
        const [removed] = this.events.splice(idx, 1);
        this.trigger('eventremove', removed.name);
        return true;
    }

    clearEvents(): void {
        this.events = [];
        this.trigger('change', { property: 'events', value: [] });
    }

    // --- Serialization ---

    /**
     * Serializes the Widget for transport
     */
    serialize(): WidgetTransport {
        return {
            id: this.id,
            enabled: this.enabled,
            params: this.params.map((p) => p.serialize()),
            actions: this.actions.map((a) => a.serialize()),
            events: this.events.map((e) => e.serialize()),
        };
    }

    // --- Event Registration Shortcuts ---

    onChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('change', handler, name, data);
    }
    offChange(handler: EventHandler, name?: string): void {
        this.off('change', handler, name);
    }
    onParamAdd(handler: EventHandler, name?: string, data?: any): void {
        this.on('paramadd', handler);
    }
    offParamAdd(handler: EventHandler): void {
        this.off('paramadd', handler);
    }
    onParamRemove(handler: EventHandler, name?: string, data?: any): void {
        this.on('paramremove', handler, name, data);
    }
    offParamRemove(handler: EventHandler, name?: string): void {
        this.off('paramremove', handler, name);
    }
    onParamChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('paramchange', handler, name, data);
    }
    offParamChange(handler: EventHandler, name?: string): void {
        this.off('paramchange', handler, name);
    }
    onParamSet(handler: EventHandler, name?: string, data?: any): void {
        this.on('paramset', handler, name, data);
    }
    offParamSet(handler: EventHandler, name?: string): void {
        this.off('paramset', handler, name);
    }
    onActionAdd(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionadd', handler, name, data);
    }
    offActionAdd(handler: EventHandler, name?: string): void {
        this.off('actionadd', handler, name);
    }
    onActionRemove(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionremove', handler, name, data);
    }
    offActionRemove(handler: EventHandler, name?: string): void {
        this.off('actionremove', handler, name);
    }
    onActionChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionchange', handler, name, data);
    }
    offActionChange(handler: EventHandler, name?: string): void {
        this.off('actionchange', handler, name);
    }
    onActionInvoke(handler: EventHandler, name?: string, data?: any): void {
        this.on('actioninvoke', handler, name, data);
    }
    offActionInvoke(handler: EventHandler, name?: string): void {
        this.off('actioninvoke', handler, name);
    }
    onEventAdd(handler: EventHandler, name?: string, data?: any): void {
        this.on('eventadd', handler, name, data);
    }
    offEventAdd(handler: EventHandler, name?: string): void {
        this.off('eventadd', handler, name);
    }
    onEventRemove(handler: EventHandler, name?: string, data?: any): void {
        this.on('eventremove', handler, name, data);
    }
    offEventRemove(handler: EventHandler, name?: string): void {
        this.off('eventremove', handler, name);
    }
    onEventChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('eventchange', handler, name, data);
    }
    offEventChange(handler: EventHandler, name?: string): void {
        this.off('eventchange', handler, name);
    }
    onEventTrigger(handler: EventHandler, name?: string, data?: any): void {
        this.on('eventtrigger', handler, name, data);
    }
    offEventTrigger(handler: EventHandler, name?: string): void {
        this.off('eventtrigger', handler, name);
    }
    onPagePopulate(handler: EventHandler, name?: string, data?: any): void {
        this.on('pagepopulate', handler, name, data);
    }
    offPagePopulate(handler: EventHandler, name?: string): void {
        this.off('pagepopulate', handler, name);
    }

    // --- Utility ---

    toString(): string {
        return `[Widget id=${this.id} title=${this.title}]`;
    }
}
