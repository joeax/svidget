/**
 * Widget class
 * Represents a widget instance in the SVG context.
 * Provides API for parameters, actions, events, and widget lifecycle.
 * @module Widget
 */
import { Param, ParamEventType, ParamOptions, ParamTransport } from './param';
import { Action, ActionEventType, ActionOptions, ActionTransport } from './action';
import { EventDesc, EventDescEventType, EventDescOptions, EventDescTransport } from './eventDesc';
import { EventableBase, EventHandler } from './eventableBase';
import { logInfo } from './logging';
import { WidgetEvent } from './widgetEvent';

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
    private _params: Param[];
    private _actions: Action[];
    private _events: EventDesc[];
    private _enabled: boolean;
    private _started: boolean;
    private _connected: boolean;
    private _populatedFromPage: boolean;
    //page: any;
    //parentElement: Element | null;

    /**
     * Constructs a Widget instance.
     * @param id Widget ID
     * @param title Widget title
     * @param description Widget description
     */
    constructor(id?: string, title?: string, description?: string) {
        super();
        this._id = id || '';
        this._title = title || '';
        this._description = description || '';
        this._params = [];
        this._actions = [];
        this._events = [];
        this._enabled = true;
        this._started = false;
        this._connected = false;
        this._populatedFromPage = false;
        // this.page = null;
        // this.parentElement = null;
    }

    get params(): Param[] {
        return this._params;
    }

    get actions(): Action[] {
        return this._actions;
    }

    get events(): EventDesc[] {
        return this._events;
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
        this._populatedFromPage = true;
        this.trigger('pagepopulate', this);
    }

    // --- Param Management ---

    getParam(selector: string | number): Param | undefined {
        if (typeof selector === 'number') return this.params[selector];
        return this.params.find((p) => p.name === selector);
    }

    newParam(name: string, value: any, options: ParamOptions): Param {
        const param = new Param(name, value, options, this.paramBubbleHandler.bind(this));
        return param;
    }

    addParam(param: Param): boolean {
        if (this.params.some((p) => p.name === param.name)) {
            logInfo(`Widget: Param with name "${param.name}" already exists.`);
            return false;
        }
        this.params.push(param);
        this.handleParamAdded(param);
        return true;
    }

    removeParam(name: string): boolean {
        const idx = this.params.findIndex((p) => p.name === name);
        if (idx === -1) return false;
        const [removed] = this.params.splice(idx, 1);
        this.handleParamRemoved(removed);
        return true;
    }

    clearParams(): void {
        this._params.forEach((p) => {
            this.handleParamRemoved(p);
        });
        this._params = [];
        this.trigger('change', { property: 'params', value: [] });
    }

    // internal
    // handle param added
    private handleParamAdded(param: Param): void {
        // raise event
        //alert('param added');
        logInfo('widget: param added: ' + param.name);
        // event.value = param
        this.trigger('paramadd', param);
        // signal parent
        svidget.signalParamAdded(param);
    }

    // internal
    // handle param removed
    private handleParamRemoved(param: Param): void {
        // raise event
        //alert('param removed');
        logInfo('widget: param removed: ' + param.name);
        // event.value = param.name
        this.trigger('paramremove', param.name);
        // signal parent
        svidget.signalParamRemoved(param.name);
    }

    // internal
    // called from param to bubble event
    private paramBubbleHandler(type: ParamEventType, event: WidgetEvent, param: Param): void {
        if (type === 'change') this.triggerParamChanged(param, event.value);
        if (type === 'set') this.triggerParamSet(param, event.value);
    }

    // private
    // eventValue ex = { property: "binding", value: bindValue }
    private triggerParamChanged(param: Param, eventValue: any): void {
        this.trigger('paramchange', eventValue, param);
        // signal parent
        svidget.signalParamChanged(param, eventValue);
    }

    // private
    // eventValue ex = { value: "3" }
    private triggerParamSet(param: Param, eventValue: any): void {
        this.trigger('paramset', eventValue, param);
        // this.trigger('paramvaluechange', eventValue, param);
        // signal parent
        svidget.signalParamSet(param, eventValue);
    }

    // --- Action Management ---

    getAction(selector: string | number): Action | undefined {
        if (typeof selector === 'number') return this.actions[selector];
        return this.actions.find((a) => a.name === selector);
    }

    newAction(name: string, options: ActionOptions): Action {
        const action = new Action(name, options, this.actionBubbleHandler.bind(this));
        return action;
    }

    addAction(action: Action): boolean {
        if (this.actions.some((a) => a.name === action.name)) {
            logInfo(`Widget: Action with name "${action.name}" already exists.`);
            return false;
        }
        this.actions.push(action);
        this.handleActionAdded(action);
        return true;
    }

    removeAction(name: string): boolean {
        const idx = this.actions.findIndex((a) => a.name === name);
        if (idx === -1) return false;
        const [removed] = this.actions.splice(idx, 1);
        this.handleActionRemoved(removed);
        return true;
    }

    clearActions(): void {
        this._actions.forEach((a) => {
            this.handleActionRemoved(a);
        });
        this._actions = [];
        this.trigger('change', { property: 'actions', value: [] });
    }

    // internal
    // handle action added
    private handleActionAdded(action: Action): void {
        // raise event
        //alert('param added');
        logInfo('widget: action added: ' + action.name);
        // event.value = param
        this.trigger('actionadd', action);
        // signal parent
        svidget.signalActionAdded(action);
    }

    // internal
    // handle action removed
    private handleActionRemoved(action: Action): void {
        // raise event
        //alert('param removed');
        logInfo('widget: action removed: ' + action.name);
        // event.value = param.name
        this.trigger('actionremove', action.name);
        // signal parent
        svidget.signalActionRemoved(action.name);
    }

    private actionBubbleHandler(type: ActionEventType, event: any, action: Action): void {
        if (type === 'change') this.triggerActionChanged(action, event.value);
        if (type === 'invoke') this.triggerActionInvoke(action, event.value);
        if (type === 'paramchange') this.triggerActionParamChange(action, event.value);
        if (type === 'paramadd') this.triggerActionParamAdd(action, event.value);
        if (type === 'paramremove') this.triggerActionParamRemove(action, event.value);
    }

    private triggerActionChanged(action: Action, eventValue: any): void {
        this.trigger('actionchange', eventValue, action);
        // signal parent
        svidget.signalActionChanged(action, eventValue);
    }

    private triggerActionInvoke(action: Action, eventValue: any): void {
        this.trigger('actioninvoke', eventValue, action);
        // signal parent
        svidget.signalActionInvoke(action, eventValue);
    }

    private triggerActionParamChange(action: Action, eventValue: any): void {
        this.trigger('actionparamchange', eventValue, action);
        // signal parent
        svidget.signalActionParamChange(action, eventValue);
    }

    private triggerActionParamAdd(action: Action, eventValue: any): void {
        this.trigger('actionparamadd', eventValue, action);
        // signal parent
        svidget.signalActionParamAdd(action, eventValue);
    }

    private triggerActionParamRemove(action: Action, eventValue: any): void {
        this.trigger('actionparamremove', eventValue, action);
        // signal parent
        svidget.signalActionParamRemove(action, eventValue);
    }

    // --- Event Management ---

    getEvent(selector: string | number): EventDesc | undefined {
        if (typeof selector === 'number') return this.events[selector];
        return this.events.find((e) => e.name === selector);
    }

    newEvent(name: string, options: EventDescOptions): EventDesc {
        const event = new EventDesc(name, options, this.eventBubbleHandler.bind(this));
        return event;
    }

    addEvent(event: EventDesc): boolean {
        if (this.events.some((e) => e.name === event.name)) return false;
        this.events.push(event);
        this.handleEventAdded(event);
        return true;
    }

    removeEvent(name: string): boolean {
        const idx = this.events.findIndex((e) => e.name === name);
        if (idx === -1) return false;
        const [removed] = this.events.splice(idx, 1);
        this.handleEventRemoved(removed);
        return true;
    }

    clearEvents(): void {
        this._events.forEach((e) => {
            this.handleEventRemoved(e);
        });
        this._events = [];
        this.trigger('change', { property: 'events', value: [] });
    }

    // internal
    // handle action added
    private handleEventAdded(event: EventDesc): void {
        // raise event
        //alert('param added');
        logInfo('widget: event added: ' + event.name);
        // event.value = param
        this.trigger('eventadd', event);
        // signal parent
        svidget.signalEventAdded(event);
    }

    // internal
    // handle action removed
    private handleEventRemoved(event: EventDesc): void {
        // raise event
        //alert('param removed');
        logInfo('widget: event removed: ' + event.name);
        // event.value = param.name
        this.trigger('eventremove', event.name);
        // signal parent
        svidget.signalEventRemoved(event.name);
    }

    // internal, called from EventDesc to bubble event
    private eventBubbleHandler(
        type: EventDescEventType,
        event: WidgetEvent,
        eventDesc: EventDesc
    ): void {
        if (type === 'trigger') this.triggerEventTrigger(eventDesc, event);
        if (type === 'change') this.triggerEventChanged(eventDesc, event.value);
    }

    private triggerEventTrigger(eventDesc: EventDesc, event: WidgetEvent): void {
        this.trigger('eventtrigger', event, eventDesc);
        // signal parent
        svidget.signalEventTrigger(eventDesc, event);
    }

    private triggerEventChanged(eventDesc: EventDesc, newValue: any): void {
        this.trigger('eventchange', newValue, eventDesc);
        // signal parent
        svidget.signalEventChanged(eventDesc, newValue);
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
        this.on('paramadd', handler, name, data);
    }
    offParamAdd(handler: EventHandler, name?: string): void {
        this.off('paramadd', handler, name);
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
    onActionParamAdd(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionparamadd', handler, name, data);
    }
    offActionParamAdd(handler: EventHandler, name?: string): void {
        this.off('actionparamadd', handler, name);
    }
    onActionParamRemove(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionparamremove', handler, name, data);
    }
    offActionParamRemove(handler: EventHandler, name?: string): void {
        this.off('actionparamremove', handler, name);
    }
    onActionParamChange(handler: EventHandler, name?: string, data?: any): void {
        this.on('actionparamchange', handler, name, data);
    }
    offActionParamChange(handler: EventHandler, name?: string): void {
        this.off('actionparamchange', handler, name);
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
