import { MessageData, SignalReceiver, SignalSubscriber, WidgetCommunicatorEventType } from './communication';
import { DOM } from './dom';
import { logInfo } from './logging';
import { PageCommunicator } from './pageCommunicator';
import { WidgetStartAckPayload } from './payloads';
import { RootBase } from './rootBase';
import { WidgetTransport } from './transports';
import { isAttrEmptyOrTrue, isHTMLElement, randomHash } from './utils';
import { Widget } from './widget';
import { ParamObject, WidgetReference } from './widgetReference';

// Root Events
export const PageRootEventTypes = ["load", "widgetload"] as const;
export type PageRootEventType = (typeof PageRootEventTypes)[number];

type WidgetMessageData<TPayload> = MessageData<WidgetCommunicatorEventType, TPayload>;

interface SvidgetElement extends HTMLObjectElement {
    widgetReference?: WidgetReference | null;
    svidgetLoaded?: boolean;
}

export interface SvidgetOptions {
    id?: string;
    url: string;
    width?: string;
    height?: string;
    connected?: boolean;
    crossDomain?: boolean;
    style?: string;
    cssClass?: string;
    allowFullScreen?: boolean;
    title?: string;
    x?: string | number;
    y?: string | number;
}

/**
 * PageRoot class
 * Main controller for the page (HTML) context. Singleton.
 */
export class PageRoot extends RootBase<PageRootEventType> {
    // REGION: Initializing
    private _communicator: PageCommunicator | null = null;
    private _widgets: WidgetReference[] = [];
    private _allWidgetsStarted: boolean = false;
    private _subscriberHash = randomHash();

    constructor() {
        super();
        // window._svidget = 'page';
        this.connected = true; // default to true for page
        this.readyPage();
    }

    private createDocumentObserver() {
        // watch for DOM changes to load widgets
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && isHTMLElement(node as Element)) {
                            this.loadWidgets(node as HTMLElement);
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Page Mode
    private readyPage() {
        // Svidget.log('page: readyPage');
        //alert("page");
        this.readyCommunicator();
        this.loadWidgets();
        this.createDocumentObserver();
    }

    private readyCommunicator() {
        this._communicator = new PageCommunicator(this.routeFromWidget.bind(this));
        //this.widget.setCommunicator(this._communicator);
    }

    // REGION: Widget Loading
    private loadWidgets(container?: HTMLElement) {
        // parse page for object role="svidget"
        var svidgetEles = this.findAllSvidgetElements(container);
        svidgetEles.forEach((item: SvidgetElement) => this.loadWidget(item, undefined));
        //this.waitForWidgets();
    }

    private loadWidget(objEle: SvidgetElement, paramValues: ParamObject | undefined) {
        // check if a widget object was already created for this DOM <object> node, or via svidget.load call, if so then exit
        if (objEle.widgetReference != null || objEle.svidgetLoaded) return;
        var widget = this.createWidgetReference(objEle, paramValues);
        this.addWidget(widget);
        //if (!Svidget.DOM.isElementDocumentReady(objEle)) {
        this.readyWidgetReference(widget, objEle);
        return widget;
    }

    private createWidgetReference(objEle: SvidgetElement, paramValues: ParamObject | undefined) {
        // parse <params> if not provided (provided for dynamic loading)
        const paramObj = paramValues ?? this.parseParamElements(objEle);

        // check for forced values
        // allow case-insensitive per HTML rules
        const connected =
            !objEle.hasAttribute('data-connected') || isAttrEmptyOrTrue(objEle, 'data-connected');
        const crossDomain = isAttrEmptyOrTrue(objEle, 'data-crossdomain') || objEle.data == '';
        // position if x and y are specified
        this.setElementPosition(
            objEle,
            objEle.getAttribute('data-x'),
            objEle.getAttribute('data-y')
        );
        // generate ID
        // tests: test an element with same id before and test with one after declared element
        const widgetID = this.getWidgetIDForElement(objEle);
        // resolve core element, if widget DOM not ready this will return null
        const coreEle = this.resolveCoreWidgetElement(objEle, null, crossDomain);
        // create WidgetReference
        const wRef = new WidgetReference(
            widgetID,
            objEle.data,
            paramObj,
            objEle,
            coreEle,
            connected,
            crossDomain,
            this._subscriberHash
        );
        // objEle._widget = wRef; // from legacy code
        objEle.widgetReference = wRef;
        return wRef;
    }

    private readyWidgetReference(widget: WidgetReference, objEle: SvidgetElement) {
        // if <iframe> already loaded due to data-crossdomain
        var ele = widget.element || objEle;
        this.addWidgetLoadEvents(ele, widget);
    }

    private addWidgetLoadEvents(objEle: SvidgetElement, widget: WidgetReference) {
        // Svidget.log('page: addWidgetLoadEvents: id = ' + objEle.id + ', tag = ' + objEle.tagName);
        // var handler = (window as any).Svidget.wrap(this.finishPageWidget, this);
        const handler = this.finishPageWidget.bind(this);
        const wrapper = () => {
            handler(widget);
        };
        widget.setWaitingForDOM(true);
        DOM.on(objEle, 'load', wrapper);
        //Svidget.DOM.on(objEle, 'readystatechange', wrapper);
    }

    private finishPageWidget(widget: WidgetReference) {
        // Svidget.log('page: finishPageWidget: id = ' + widget.id());
        //var widget = objEle.widgetReference; // this.createPageWidget(objEle);
        widget.setWaitingForDOM(false);
        // if <object> replaced with <iframe>
        var finalEle = this.ensureCoreElementResolved(widget);
        if (finalEle != null && finalEle != widget.declaringElement) {
            // ...existing code for handling replaced element...
        } else {
            // ...existing code for else branch...
        }
    }

    private ensureCoreElementResolved(widget: WidgetReference) {
        if (widget.hasElement) return null;
        var coreEle = this.resolveCoreWidgetElement(
            widget.declaringElement,
            widget,
            widget.crossDomain
        ); // objEle);
        if (coreEle != null) {
            logInfo('page: CoreElementCreated: ' + coreEle.tagName + ' id:' + widget.id);
            widget.setElement(coreEle);
            return coreEle;
        }
        return null;
    }

    private ensureWidgetStarted(widget: WidgetReference) {
        // if core element hasn't been defined yet, then return and try again later
        if (!widget.hasElement) return;
        if (!widget.started && DOM.isElementDocumentReady(widget.element)) {
            this.signalStart(widget, widget.paramValues()); //, this.connected());
            // todo: this is resulting in a race condition, if the first signalStart fails then it never gets initialized
            //if (widget.standalone()) widget.start(); // start right away, since its disconnected with widget
        }
    }

    private resolveCoreWidgetElement(
        objEle: SvidgetElement,
        widget: WidgetReference,
        crossDomain: boolean
    ) {
        // try to get widget contentDocument
        var widgetDoc = DOM.getDocument(objEle);
        // widget is not ready, so return null, we'll try again later
        // but if crossDomain flag is set, then we use iframe unconditionally
        if (widgetDoc === null && !crossDomain) return null;
        let ifmEle = null;
        let coreEle: HTMLElement = objEle;
        // if undefined, it means access was denied making it cross domain widget
        // so we disable and hide <object> and replace with <iframe>
        if (widgetDoc === undefined || crossDomain) {
            ifmEle = this.buildIFrameElement(objEle);
            objEle.parentNode?.insertBefore(ifmEle, objEle);
            this.disableAndHide(objEle);
            coreEle = ifmEle;
            // since we created a new element, we need to ready it
            //if (widget) this.readyWidgetReference(widget, ifmEle); // moved to ensureCoreElementCreated
        }
        return coreEle;
    }

    private waitForWidgets() {
        setTimeout(this.checkUnfinishedWidgetReferences.bind(this), 50);
    }

    private checkUnfinishedWidgetReferences() {
        // loops through each widget references with missing element
        // and checks if its document is ready
        // called from handle widget initialized
        // var unfinalWidgets =
        if (this._allWidgetsStarted) return;
        logInfo('page: checkUnfinishedWidgetReferences');
        var count = 0;
        this.getWidgets()
            .filter((w) => this.needsFinishing(w))
            .forEach((w) => {
                //	return !w.hasElement() && Svidget.DOM.isElementDocumentReady(w.declaringElement());
                //}).each(function (w) {
                count++;
                this.finishPageWidget(w);
            });
        // set flag so that we stop checking for unfinalized widgets
        //if (count == 0) this.allWidgetsFinalized = true;
        this.waitForWidgets();
    }

    private needsFinishing(widget: WidgetReference): boolean {
        if (widget.waitingForDOM()) return false;
        // if widget element hasn't been finalized or started, and declaring element is ready, then it needs finalizing
        if (
            (!widget.hasElement || !widget.started) &&
            DOM.isElementDocumentReady(widget.declaringElement)
        )
            return true;
        // if widget element is an <iframe> due to being cross domain, and the DOM for that <iframe> is ready, but it hasn't been started, it needs finalizing
        if (
            widget.hasElement &&
            widget.crossDomain &&
            !widget.started &&
            DOM.isElementDocumentReady(widget.element)
        )
            return true;
        // doesn't need finalizing
        return false;
    }

    private areAllWidgetsStarted(): boolean {
        return this.getWidgets().every((w) => w.started);
    }

    private disableAndHide(ele: any) {
        ele.data = ''; // todo: confirm this works
        DOM.disable(ele);
        DOM.hide(ele);
    }

    private getWidgetIDForElement(objEle: SvidgetElement): string {
        const id = objEle.id;
        // if id points to element (no duplicates, then just use that)
        if (id != null && DOM.get(id) == objEle) return id;
        return this.newWidgetID();
    }

    private newWidgetID(): string {
        // todo: use as internal ID and use element id as external ID
        const prefix = '_svidget_';
        // if (this.idCounter === undefined) this.idCounter = 1;
        let suffix = randomHash();
        let id;
        while (true) {
            id = prefix + suffix;
            if (DOM.get(id) == null) break;
            suffix = randomHash();
        }
        return id;
    }

    private buildIFrameElement(objEle: SvidgetElement): HTMLIFrameElement {
        var iframe = document.createElement('iframe');
        var objItem = DOM.wrap(objEle);
        objItem.attributes()?.forEach((item) => {
            if (item.name && item.value) {
                iframe.setAttribute(item.name, item.value);
            }
        });
        (iframe as any).frameBorder = 0;
        (iframe as any).seamless = true;
        return iframe;
    }

    private buildObjectElement(
        options: SvidgetOptions,
        paramObj: ParamObject
    ): SvidgetElement | null {
        if (!document.createElement) return null;
        var objEle = document.createElement('object');
        // objEle.setAttribute('role', 'svidget');
        objEle.setAttribute('data-svidget', 'true');
        objEle.setAttribute('data-url', options.url);
        // for crossDomain, no need to load widget into object, an iframe will take its place
        if (options.crossDomain !== true) {
            // ...existing code for non-crossDomain...
        }
        if (options.id) objEle.id = options.id;
        if (options.width) objEle.setAttribute('width', options.width);
        if (options.height) objEle.setAttribute('height', options.height);
        if (options.connected !== undefined)
            objEle.setAttribute('data-connected', String(options.connected));
        if (options.crossDomain === true) objEle.setAttribute('data-crossdomain', 'true');
        if (options.style) objEle.setAttribute('style', options.style);
        if (options.cssClass) objEle.setAttribute('class', options.cssClass);
        if (options.allowFullScreen !== undefined)
            objEle.setAttribute('data-allowfullscreen', String(options.allowFullScreen));
        if (options.title) objEle.setAttribute('title', options.title);
        // position if x and y are specified
        this.setElementPosition(objEle, options.x, options.y);
        // params
        for (var key in paramObj) {
            if (paramObj.hasOwnProperty(key)) {
                var param = document.createElement('param');
                if (key && paramObj[key] !== undefined) {
                    param.setAttribute('name', key);
                    param.setAttribute('value', paramObj[key]!);
                    objEle.appendChild(param);
                }
            }
        }
        return objEle;
    }

    private createObjectElement(
        container: HTMLElement,
        options: SvidgetOptions,
        paramObj: ParamObject
    ): SvidgetElement | null {
        var objEle = this.buildObjectElement(options, paramObj);
        if (objEle == null) return null;
        objEle.svidgetLoaded = true;
        container.appendChild(objEle);
        return objEle;
    }

    private setElementPosition(
        ele: HTMLElement,
        x?: string | number | null,
        y?: string | number | null
    ) {
        var px = x != null ? parseFloat(String(x)) : NaN;
        var py = y != null ? parseFloat(String(y)) : NaN;
        if (!isNaN(px) || !isNaN(py)) {
            if (!isNaN(px)) ele.style.left = px + 'px';
            if (!isNaN(py)) ele.style.top = py + 'px';
            ele.style.position = 'absolute';
        }
    }

    // private populateWidgetReference(widgetRef: WidgetReference, widgetTransport: WidgetTransport) {
    //     // Svidget.log("page: populateWidgetReference");
    //     if (!widgetRef.populated) {
    //         widgetRef.populate(widgetTransport);
    //     }
    // }

    private findAllSvidgetElements(container?: HTMLElement): NodeListOf<HTMLObjectElement> {
        // when provided, only look in container (in observer scenarios)
        return (container ?? document).querySelectorAll<HTMLObjectElement>('object[data-svidget]');
    }

    // public containsSvidgetRole(ele: any) {
    //     // returns true if element has role="svidget" (case-insensitive)
    //     if (!ele || !ele.getAttribute) return false;
    //     var role = ele.getAttribute('role');
    //     return role != null && role.toLowerCase() === 'svidget';
    // }

    private parseParamElements(objEle: HTMLObjectElement): ParamObject {
        // parses <param> elements under the object element and returns an object with name/value pairs
        // Note: <param> elements are deprecated but we will continue to support
        var params: ParamObject = {};
        if (!objEle) return params;
        var paramNodes = objEle.querySelectorAll('param');
        for (var i = 0; i < paramNodes.length; i++) {
            var p = paramNodes[i];
            var name = p.getAttribute('name');
            var value = p.getAttribute('value');
            if (name != null) params[name] = value;
        }
        return params;
    }

    private getWidget(id: any): WidgetReference | null {
        // returns the widget reference by id or element
        if (id == null) return null;
        if (id instanceof WidgetReference) return id;
        var widgets = this.getWidgets();
        for (var i = 0; i < widgets.length; i++) {
            var w = widgets[i];
            if (w.id === id) return w;
        }
        return null;
    }

    private addWidget(widget: WidgetReference) {
        // adds a widget reference to the internal widgets array
        this._widgets.push(widget);
        return widget;
    }

    // REGION: Public Methods

    public findWidgets(selector?: string) {
        // returns all widget references, or those matching selector
        var widgets = this.getWidgets();
        if (selector == null) return widgets;
        // selector can be id, element, or function
        if (typeof selector === 'function') {
            return widgets.filter(selector);
        }
        return widgets.filter(function (w: any) {
            return w.id === selector || w.element === selector;
        });
    }

    public findWidget(selector: string) {
        // returns the first widget reference matching selector
        var ws = this.findWidgets(selector);
        return ws && ws.length > 0 ? ws[0] : null;
    }

    public getWidgets(): WidgetReference[] {
        // returns the internal widgets array
        return this._widgets;
    }

    protected triggerWidgetEvent(widgetRef: WidgetReference, eventName: any, data: any) {
        var ev = widgetRef.event(eventName);
        if (ev == null) return;
        ev.triggerFromWidget(data);
    }

    // REGION: Communication

    // Add more shared logic as needed
    private routeFromWidget(data: WidgetMessageData<any>): void {
        logInfo('page: receiveFromWidget {name: ' + data.name + ', widgetID: ' + data.widget + '}');
        const widget = this.getWidget(data.widget);
        const { name, payload } = data;
        //if (widget == null && name != "initialized") return; // widgetID may be null if widget hasn't been assigned an ID
        // invoke handler for message
        if (name === 'startack') {
            // global message, so handle
            this.handleReceiveWidgetStartAck(widget, payload);
        } else if (widget) {
            // widget handles
            const receiver = widget.getSignalReceiver(this._subscriberHash);
            receiver?.(name, payload);
        }
        // todo: maybe logWarning if message not handled
        // switch (data.name) {
        //     // lifecycle handlers
        //     // payload == widget transport { id: "", enabled: true, params: [], actions: [] }
        //     //case "initialized": this.handleReceiveWidgetInitialized(); break; //widget, payload); break;
        //     //case "loaded": this.handleReceiveWidgetLoaded(widget, payload); break;
        //     // params handlers
        //     // payload == param transport { name: "background", type: "", value: 3 }
        //     case 'paramadded':
        //         this.handleReceiveWidgetParamAdded(widget, payload);
        //         break;
        //     case 'paramremoved':
        //         this.handleReceiveWidgetParamRemoved(widget, payload);
        //         break;
        //     case 'paramchanged':
        //         this.handleReceiveWidgetParamChanged(widget, payload);
        //         break;
        //     case 'paramset':
        //         this.handleReceiveWidgetParamSet(widget, payload);
        //         break;
        //     // actions handlers
        //     case 'actionadded':
        //         this.handleReceiveWidgetActionAdded(widget, payload);
        //         break;
        //     case 'actionremoved':
        //         this.handleReceiveWidgetActionRemoved(widget, payload);
        //         break;
        //     case 'actionchanged':
        //         this.handleReceiveWidgetActionChanged(widget, payload);
        //         break;
        //     case 'actioninvoked':
        //         this.handleReceiveWidgetActionInvoked(widget, payload);
        //         break;
        //     case 'actionparamadded':
        //         this.handleReceiveWidgetActionParamAdded(widget, payload);
        //         break;
        //     case 'actionparamremoved':
        //         this.handleReceiveWidgetActionParamRemoved(widget, payload);
        //         break;
        //     case 'actionparamchanged':
        //         this.handleReceiveWidgetActionParamChanged(widget, payload);
        //         break;
        //     // events handlers
        //     case 'eventadded':
        //         this.handleReceiveWidgetEventAdded(widget, payload);
        //         break;
        //     case 'eventremoved':
        //         this.handleReceiveWidgetEventRemoved(widget, payload);
        //         break;
        //     case 'eventchanged':
        //         this.handleReceiveWidgetEventChanged(widget, payload);
        //         break;
        //     case 'eventtriggered':
        //         this.handleReceiveWidgetEventTriggered(widget, payload);
        //         break;
        //     // acks
        //     case 'startack':
        //         this.handleReceiveWidgetStartAck(widget, payload);
        //         break;
        // }
    }

    // private handleReceiveSignal(
    //     widget: WidgetReference,
    //     signal: CommunicatorEventType,
    //     payload: any
    // ) {}

    // private buildWidgetSignalSubscriber(widget: WidgetReference): SignalSubscriber {
    //     // returns a function that can be used to subscribe to widget signals
    //     // return (signal: CommunicatorEventType, payload: any) => {
    //     //     this.handleReceiveSignal(widget, signal, payload);
    //     // };
    //     return (callback: SignalReceiver, source: any) => {};
    // }

    // Signal Handlers
    // private handleReceiveWidgetInitialized() {
    //     logInfo('page: handleReceiveWidgetInitialized');
    // }

    /**
     * Handles the 'loaded' signal from a widget, populates the widget reference with transport data.
     * @param widgetRef The WidgetReference instance for the widget.
     * @param widgetTransport The transport data from the widget.
     */
    // private handleReceiveWidgetLoaded(widgetRef: WidgetReference | null, widgetTransport: WidgetTransport): void {
    //     // If widgetRef is null, it means the widget DOM loaded before start was called, so defer
    //     if (widgetRef == null) {
    //         // Optionally, you could queue this or log a warning
    //         return;
    //     }
    //     this.populateWidgetReference(widgetRef, widgetTransport);
    //     // Optionally, trigger a widget load event here if needed
    // }

    /**
     * Handles the 'startack' signal from a widget, marks it as started and populates it.
     */
    private handleReceiveWidgetStartAck(
        widgetRef: WidgetReference | null,
        payload: WidgetStartAckPayload
    ): void {
        if (!widgetRef) return;
        // Ignore subsequent acks
        if (widgetRef.started) return;
        widgetRef.start(payload.widget);
        // this.populateWidgetReference(widgetRef, widgetTransport);
        // Optionally, trigger a widget load event here if needed
        // If all widgets started, you could fire a loaded event
        if (this.areAllWidgetsStarted()) {
            this._allWidgetsStarted = true;
            // Optionally, trigger a global loaded event
        }
    }

    // /**
    //  * Handles the 'paramadded' signal from a widget, adds a param proxy.
    //  */
    // private handleReceiveWidgetParamAdded(widgetRef: WidgetReference | null, paramPayload: any): void {
    //     if (!widgetRef || !paramPayload?.name) return;
    //     widgetRef.addParamProxy(paramPayload.name, paramPayload);
    // }

    // /**
    //  * Handles the 'paramremoved' signal from a widget, removes a param proxy.
    //  */
    // private handleReceiveWidgetParamRemoved(widgetRef: WidgetReference | null, paramName: string): void {
    //     if (!widgetRef || !paramName) return;
    //     widgetRef.removeParamProxy(paramName);
    // }

    /**
     * Handles the 'paramchanged' signal from a widget, notifies property change.
     */
    // private handleReceiveWidgetParamChanged(widgetRef: WidgetReference | null, changePayload: any): void {
    //     if (!widgetRef || !changePayload?.name) return;
    //     const param = widgetRef.param(changePayload.name);
    //     if (!param) return;
    //     param.notifyPropertyChange(changePayload.property, changePayload.value);
    // }

    // /**
    //  * Handles the 'paramset' signal from a widget, notifies value change.
    //  */
    // private handleReceiveWidgetParamSet(widgetRef: WidgetReference | null, setPayload: any): void {
    //     if (!widgetRef || !setPayload?.name) return;
    //     const param = widgetRef.param(setPayload.name);
    //     if (!param) return;
    //     param.notifyValueChange(setPayload.value);
    // }

    // /**
    //  * Handles the 'actionadded' signal from a widget, adds an action proxy.
    //  */
    // private handleReceiveWidgetActionAdded(widgetRef: WidgetReference | null, actionPayload: any): void {
    //     if (!widgetRef || !actionPayload?.name) return;
    //     widgetRef.addActionProxy(actionPayload.name, actionPayload);
    // }

    // /**
    //  * Handles the 'actionremoved' signal from a widget, removes an action proxy.
    //  */
    // private handleReceiveWidgetActionRemoved(widgetRef: WidgetReference | null, actionName: string): void {
    //     if (!widgetRef || !actionName) return;
    //     widgetRef.removeActionProxy(actionName);
    // }

    // /**
    //  * Handles the 'actionchanged' signal from a widget, notifies property change on the action.
    //  */
    // private handleReceiveWidgetActionChanged(widgetRef: WidgetReference | null, changePayload: any): void {
    //     if (!widgetRef || !changePayload?.name) return;
    //     const action = widgetRef.action(changePayload.name);
    //     if (!action) return;
    //     action.notifyPropertyChange(changePayload.property, changePayload.value);
    // }

    // /**
    //  * Handles the 'actioninvoked' signal from a widget, invokes the action from widget.
    //  */
    // private handleReceiveWidgetActionInvoked(widgetRef: WidgetReference | null, actionReturnPayload: any): void {
    //     if (!widgetRef || !actionReturnPayload?.name) return;
    //     const action = widgetRef.action(actionReturnPayload.name);
    //     if (!action) return;
    //     action.invokeFromWidget(actionReturnPayload.returnValue);
    // }

    // /**
    //  * Handles the 'actionparamadded' signal from a widget, adds a param to an action.
    //  */
    // private handleReceiveWidgetActionParamAdded(widgetRef: WidgetReference | null, actionParamPayload: any): void {
    //     if (!widgetRef || !actionParamPayload?.actionName || !actionParamPayload?.name) return;
    //     const action = widgetRef.action(actionParamPayload.actionName);
    //     if (!action) return;
    //     action.addParam(actionParamPayload.name, actionParamPayload);
    // }

    // /**
    //  * Handles the 'actionparamremoved' signal from a widget, removes a param from an action.
    //  */
    // private handleReceiveWidgetActionParamRemoved(widgetRef: WidgetReference | null, actionParamNamePayload: { actionName: string, name: string }): void {
    //     if (!widgetRef || !actionParamNamePayload?.actionName || !actionParamNamePayload?.name) return;
    //     const action = widgetRef.action(actionParamNamePayload.actionName);
    //     if (!action) return;
    //     action.removeParam(actionParamNamePayload.name);
    // }

    // /**
    //  * Handles the 'actionparamchanged' signal from a widget, notifies property change on the action param.
    //  */
    // private handleReceiveWidgetActionParamChanged(widgetRef: WidgetReference | null, changePayload: any): void {
    //     if (!widgetRef || !changePayload?.actionName || !changePayload?.name) return;
    //     const action = widgetRef.action(changePayload.actionName);
    //     if (!action) return;
    //     const actionParam = action.param(changePayload.name);
    //     if (!actionParam) return;
    //     actionParam.notifyPropertyChange(changePayload.property, changePayload.value);
    // }

    // /**
    //  * Handles the 'eventadded' signal from a widget, adds an event proxy.
    //  */
    // private handleReceiveWidgetEventAdded(widgetRef: WidgetReference | null, eventDescPayload: any): void {
    //     if (!widgetRef || !eventDescPayload?.name) return;
    //     widgetRef.addEventProxy(eventDescPayload.name, eventDescPayload);
    // }

    // /**
    //  * Handles the 'eventremoved' signal from a widget, removes an event proxy.
    //  */
    // private handleReceiveWidgetEventRemoved(widgetRef: WidgetReference | null, eventDescName: string): void {
    //     if (!widgetRef || !eventDescName) return;
    //     widgetRef.removeEventProxy(eventDescName);
    // }

    // /**
    //  * Handles the 'eventchanged' signal from a widget, notifies property change on the event.
    //  */
    // private handleReceiveWidgetEventChanged(widgetRef: WidgetReference | null, changePayload: any): void {
    //     if (!widgetRef || !changePayload?.name) return;
    //     const ev = widgetRef.event(changePayload.name);
    //     if (!ev) return;
    //     ev.notifyPropertyChange(changePayload.property, changePayload.value);
    // }

    // /**
    //  * Handles the 'eventtriggered' signal from a widget, triggers the event from widget.
    //  */
    // private handleReceiveWidgetEventTriggered(widgetRef: WidgetReference | null, eventDataPayload: any): void {
    //     if (!widgetRef || !eventDataPayload?.name) return;
    //     const ev = widgetRef.event(eventDataPayload.name);
    //     if (!ev) return;
    //     ev.triggerEventFromWidget(eventDataPayload.value);
    // }
}
