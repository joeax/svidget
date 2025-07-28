import { RootBase } from './rootBase';


// Root Events
export const PageRootEventTypes = ["load", "widgetload"] as const;
export type PageRootEventType = (typeof PageRootEventTypes)[number];


/**
 * PageRoot class
 * Main controller for the page (HTML) context. Singleton.
 */
export class PageRoot extends RootBase<PageRootEventType> {
    // REGION: Initializing
    protected idSeed: number = 1;

    protected _widgets: any = null;

    constructor() {
        super();
        window._svidget = "page";
        this.connected = true; // default to true for page
        Object.defineProperty(this, "$", { get: () => null });
    }

    // Page Mode
    public readyPage() {
        // Svidget.log('page: readyPage');
        //alert("page");
        this.loadPageWidgets();
    }

    // REGION: Widget Loading
    public loadPageWidgets() {
        // parse page for object role="svidget"
        var that = this;
        var svidgetEles = this.findAllWidgetElements();
        svidgetEles.each(function (item: any) {
            that.loadPageWidget(item, undefined);
        });
        //this.waitForWidgets();
    }

    public loadPageWidget(objEle: any, paramValues: any) {
        // check if a widget object was already created for this DOM <object> node, or via svidget.load call, if so then exit
        if (objEle.widgetReference != null || objEle.svidgetLoad) return;
        var widget = this.createWidgetReference(objEle, paramValues);
        this.addWidget(widget);
        //if (!Svidget.DOM.isElementDocumentReady(objEle)) {
        this.readyWidgetReference(widget, objEle);
        return widget;
    }

    public createWidgetReference(objEle: any, paramValues: any) {
        var paramObj;
        // parse <params> if not provided (provided for dynamic loading)
        if (paramValues === undefined) {
            paramObj = this.parseParamElements(objEle);
        } else {
            paramObj = paramValues;
        }

        // check for forced values
        // allow case-insensitive per HTML rules
        var connected = !objEle.hasAttribute("data-connected") || this.isAttrEmptyOrTrue(objEle, "data-connected");
        var crossdomain = this.isAttrEmptyOrTrue(objEle, "data-crossdomain") || objEle.data == "";
        // position if x and y are specified
        this.setElementPosition(objEle, objEle.getAttribute("data-x"), objEle.getAttribute("data-y"));
        // generate ID
        // tests: test an element with same id before and test with one after declared element
        var widgetID = this.getWidgetIDForElement(objEle);
        // resolve core element, if widget DOM not ready this will return null
        var coreEle = this.resolveCoreWidgetElement(objEle, null, crossdomain);
        // create WidgetReference
        var wRef = new (window as any).Svidget.WidgetReference(widgetID, paramObj, objEle, coreEle, connected, crossdomain);
        objEle._widget = wRef;
        return wRef;
    }

    public isAttrEmptyOrTrue(ele: any, attr: string) {
        // if (Svidget.DOM.isAttrEmpty(ele, attr))
        //     return Svidget.Conversion.toBool(Svidget.DOM.attrValue(ele, attr));
        // For now, just check attribute presence and value
        var val = ele.getAttribute(attr);
        return val === null || val === '' || val === 'true';
    }

    public readyWidgetReference(widget: any, objEle: any) {
        // if <iframe> already loaded due to data-crossdomain
        var ele = widget.element() || objEle;
        this.addWidgetLoadEvents(ele, widget);
    }

    public addWidgetLoadEvents(objEle: any, widget: any) {
        // Svidget.log('page: addWidgetLoadEvents: id = ' + objEle.id + ', tag = ' + objEle.tagName);
        var handler = (window as any).Svidget.wrap(this.finishPageWidget, this);
        var wrapper = function () {
            handler(widget);
        };
        widget._waitingForDOM = true;
        (window as any).Svidget.DOM.on(objEle, 'load', wrapper);
        //Svidget.DOM.on(objEle, 'readystatechange', wrapper);
    }

    public finishPageWidget(widget: any) {
        // Svidget.log('page: finishPageWidget: id = ' + widget.id());
        //var widget = objEle.widgetReference; // this.createPageWidget(objEle);
        widget._waitingForDOM = false;
        // if <object> replaced with <iframe>
        var finalEle = this.ensureCoreElementResolved(widget);
        if (finalEle != null && finalEle != widget.declaringElement()) {
            // ...existing code for handling replaced element...
        } else {
            // ...existing code for else branch...
        }
    }

    public ensureCoreElementResolved(widget: any) {
        // ...existing code...
    }

    public ensureWidgetStarted(widget: any) {
        // ...existing code...
    }

    public resolveCoreWidgetElement(objEle: any, widget: any, crossdomain: any) {
        // ...existing code...
    }

    public waitForWidgets() {
        // ...existing code...
    }

    public checkUnfinishedWidgetReferences() {
        // ...existing code...
    }

    public needsFinishing(widget: any) {
        // ...existing code...
    }

    public areAllWidgetsStarted() {
        // ...existing code...
    }

    public disableAndHide(ele: any) {
        // ...existing code...
    }

    public getWidgetIDForElement(objEle: any) {
        var id = objEle.id;
        // if id points to element (no duplicates, then just use that)
        if (id != null && (window as any).Svidget.DOM.get(id) == objEle) return id;
        return this.newWidgetID();
    }

    public newWidgetID() {
        var prefix = "_svidget_";
        if ((this as any).idCounter === undefined) (this as any).idCounter = 1;
        var idNum = (this as any).idCounter;
        var id;
        while (true) {
            id = prefix + idNum;
            idNum++;
            if ((window as any).Svidget.DOM.get(id) == null) break;
        }
        (this as any).idCounter = idNum;
        return id;
    }

    public buildIFrameElement(objEle: any) {
        var iframe = document.createElement("iframe");
        var objItem = (window as any).Svidget.DOM.wrap(objEle);
        objItem.attributes().each(function (a: any) {
            iframe.setAttribute(a.name, a.value);
        });
        (iframe as any).frameBorder = 0;
        (iframe as any).seamless = true;
        return iframe;
    }

    public buildObjectElement(options: any, paramObj: any): HTMLObjectElement | null {
        if (!document.createElement) return null;
        var objEle = document.createElement("object");
        objEle.setAttribute("role", "svidget");
        objEle.setAttribute("data-url", options.url);
        // for crossdomain, no need to load widget into object, an iframe will take its place
        if (options.crossdomain !== true) {
            // ...existing code for non-crossdomain...
        }
        if (options.id) objEle.id = options.id;
        if (options.width) objEle.setAttribute("width", options.width);
        if (options.height) objEle.setAttribute("height", options.height);
        if (options.connected !== undefined) objEle.setAttribute("data-connected", options.connected);
        if (options.crossdomain === true) objEle.setAttribute("data-crossdomain", "true");
        if (options.style) objEle.setAttribute("style", options.style);
        if (options.cssclass) objEle.setAttribute("class", options.cssclass);
        if (options.allowfullscreen !== undefined) objEle.setAttribute("allowfullscreen", options.allowfullscreen);
        if (options.title) objEle.setAttribute("title", options.title);
        // position if x and y are specified
        this.setElementPosition(objEle, options.x, options.y);
        // params
        for (var key in paramObj) {
            if (paramObj.hasOwnProperty(key)) {
                var param = document.createElement("param");
                param.setAttribute("name", key);
                param.setAttribute("value", paramObj[key]);
                objEle.appendChild(param);
            }
        }
        return objEle;
    }

    public createObjectElement(container: any, options: any, paramObj: any) {
        var objEle = this.buildObjectElement(options, paramObj);
        objEle.svidgetLoad = true;
        container.appendChild(objEle);
        return objEle;
    }

    public setElementPosition(ele: any, x: any, y: any) {
        var px = x != null ? parseFloat(x) : NaN;
        var py = y != null ? parseFloat(y) : NaN;
        if (!isNaN(px) || !isNaN(py)) {
            if (!isNaN(px)) ele.style.left = px + "px";
            if (!isNaN(py)) ele.style.top = py + "px";
            ele.style.position = "absolute";
        }
    }

    public populateWidgetReference(widgetRef: any, widgetTransport: any) {
        // Svidget.log("page: populateWidgetReference");
        if (!widgetRef.populated()) {
            widgetRef.populate(widgetTransport);
        }
    }

    public findAllWidgetElements() {
        // ...existing code...
    }

    public containsSvidgetRole(ele: any) {
        // returns true if element has role="svidget" (case-insensitive)
        if (!ele || !ele.getAttribute) return false;
        var role = ele.getAttribute("role");
        return role != null && role.toLowerCase() === "svidget";
    }

    public parseParamElements(objEle: any) {
        // parses <param> elements under the object element and returns an object with name/value pairs
        var params: any = {};
        if (!objEle) return params;
        var paramNodes = objEle.getElementsByTagName("param");
        for (var i = 0; i < paramNodes.length; i++) {
            var p = paramNodes[i];
            var name = p.getAttribute("name");
            var value = p.getAttribute("value");
            if (name) params[name] = value;
        }
        return params;
    }

    public getWidget(id: any) {
        // returns the widget reference by id or element
        if (id == null) return null;
        if (typeof id === "object" && id._svidgettype === "widgetreference") return id;
        var widgets = this.getWidgets();
        for (var i = 0; i < widgets.length; i++) {
            var w = widgets[i];
            if (w.id() === id || w.element() === id) return w;
        }
        return null;
    }

    public addWidget(widget: any) {
        // adds a widget reference to the internal widgets array
        if (!this._widgets) this._widgets = [];
        this._widgets.push(widget);
        return widget;
    }

    // REGION: Public Methods
    public widgets(selector?: any) {
        // returns all widget references, or those matching selector
        var widgets = this.getWidgets();
        if (selector == null) return widgets;
        // selector can be id, element, or function
        if (typeof selector === "function") {
            return widgets.filter(selector);
        }
        return widgets.filter(function (w: any) {
            return w.id() === selector || w.element() === selector;
        });
    }

    public widget(selector: any) {
        // returns the first widget reference matching selector
        var ws = this.widgets(selector);
        return ws && ws.length > 0 ? ws[0] : null;
    }

    protected getWidgets() {
        // returns the internal widgets array
        if (!this._widgets) this._widgets = [];
        return this._widgets;
    }

    protected triggerWidgetEvent(widgetRef: any, eventName: any, data: any) {
        // ...existing code...
    }

    // REGION: Communication
    public receiveFromWidget(name: any, payload: any, widgetID: any) {
        // ...existing code...
    }

    // Signaling
    public signalStart(widgetRef: any, paramValues: any) {
        // ...existing code...
    }

    public signalPropertyChange(widgetRef: any, obj: any, objType: any, propName: any, propValue: any) {
        // ...existing code...
    }

    public signalActionInvoke(widgetRef: any, actionProxy: any, argList: any) {
        // ...existing code...
    }

    public signalEventTrigger(widgetRef: any, eventDescProxy: any, data: any) {
        // ...existing code...
    }

    // Signal Handlers
    public handleReceiveWidgetInitialized() {
        // ...existing code...
    }

    public handleReceiveWidgetLoaded(widgetRef: any, widgetTransport: any) {
        // ...existing code...
    }

    public handleReceiveWidgetStartAck(widgetRef: any, widgetTransport: any) {
        // ...existing code...
    }

    public handleReceiveWidgetParamAdded(widgetRef: any, paramPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetParamRemoved(widgetRef: any, paramName: any) {
        // ...existing code...
    }

    public handleReceiveWidgetParamChanged(widgetRef: any, changePayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetParamSet(widgetRef: any, setPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionAdded(widgetRef: any, actionPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionRemoved(widgetRef: any, actionName: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionChanged(widgetRef: any, changePayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionInvoked(widgetRef: any, actionReturnPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionParamAdded(widgetRef: any, actionParamPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionParamRemoved(widgetRef: any, actionParamNamePayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetActionParamChanged(widgetRef: any, changePayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetEventAdded(widgetRef: any, eventDescPayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetEventRemoved(widgetRef: any, eventDescName: any) {
        // ...existing code...
    }

    public handleReceiveWidgetEventChanged(widgetRef: any, changePayload: any) {
        // ...existing code...
    }

    public handleReceiveWidgetEventTriggered(widgetRef: any, eventDataPayload: any) {
        // ...existing code...
    }
}
