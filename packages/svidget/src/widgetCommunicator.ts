import {
    CommunicatorBase,
    CommunicatorEventType, 
    MessageData,
    MessageHandler,
} from './communicatorBase';
import { logInfo } from './logging';
import { Action } from './action'; // Add this import for Action type
import { ActionParam } from './actionParam';
import { Param } from './param';
import { WidgetTransport } from './transports';
import { EventDesc } from './eventDesc';

export { MessageData };

declare global {
	interface Window {
        svidget?: {
            routeFromWidget: (data: MessageData) => void;
            // other properties can be added as needed
        };
    }
}

/**
 * WidgetCommunicator class
 * Handles messaging between the widget and the web page from with widget context.
 * @module widgetCommunicator
 */
export class WidgetCommunicator extends CommunicatorBase {
    private messageHandler: MessageHandler;
    private _widgetID: string;
    private sameParentDomain: boolean | null = null;
    private _connected: boolean = false;

    constructor(widgetID: string, messageHandler: MessageHandler) {
        super();
        this._widgetID = widgetID;
        this.messageHandler = messageHandler;
    }

    /**
     * Notifies the communicator that the widget is now connected to the parent page.
     * This is called once the page establishes a connection with the widget.
     * @param widgetID The ID of the widget to connect to. (assigned at page level)
     */
    connect(widgetID: string): void {
        this._widgetID = widgetID;
        this._connected = true;
        logInfo(`WidgetCommunicator connected for widget ID: ${this._widgetID}`);
    }

    get widgetID(): string {
        return this._widgetID;
    }

    /**
     * Handle incoming messages from the page window.
     * @param data Data received from the page window
     */
    protected receiveMessage(data: MessageData): void {
        // Handle incoming messages specific to the widget
        this.messageHandler(data);
    }

    public signalParent(name: CommunicatorEventType, payload: string | object) {
        // todo: cache result of isParentSameDomain
        if (this.isParentSameDomain()) {
            this.signalParentDirect(name, payload, this.widgetID);
        } else {
            this.signalParentXSM(name, payload, this.widgetID);
        }
    }

    private signalParentDirect(
        name: CommunicatorEventType,
        payload: string | object,
        widgetID: string
    ) {
        //var check = window === window.parent;
        // note: if window.parent.svidget is null it means the widget DOM was ready before the page DOM, although unlikely it is possible
        // so we need to handle somehow
        const root = window?.parent?.svidget;
        if (root != null) {
            const msg = this.buildParentMessageData(name, payload, widgetID);
            setTimeout(() => {
                root.routeFromWidget(msg);
            }, 0);
            //window.parent.svidget.routeFromWidget(name, payload, widgetID);
        }
    }

    private signalParentXSM(
        name: CommunicatorEventType,
        payload: string | object,
        widgetID: string
    ) {
        if (window.parent != null && window.parent.postMessage != null) {
            //alert('postMessage');
            var msg = this.buildParentMessageData(name, payload, widgetID);
            window.parent.postMessage(msg, '*');
        }
    }

    /* Single Methods */

    signalStartAck(transport: WidgetTransport) {
        logInfo('widget: signalStartAck {id: ' + this.widgetID + '}');
        this.signalParent('startack', transport);
    }

    signalParamAdded(param: Param) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalParamAdded {id: ' + this.widgetID + '}');
        var transport = param.serialize();
        this.signalParent('paramadded', transport);
    }

    signalParamRemoved(paramName: string) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalParamRemoved {id: ' + this.widgetID + '}');
        //var transport = param.name();
        this.signalParent('paramremoved', paramName);
    }

    signalParamChanged(param: Param, changeData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalParamChanged {id: ' + this.widgetID + '}');
        changeData.name = param.name; // add param name
        this.signalParent('paramchanged', changeData);
    }

    signalParamSet(param: Param, changeData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalParamSet {id: ' + this.widgetID + '}');
        changeData.name = param.name; // add param name
        this.signalParent('paramset', changeData);
    }

    // Actions/Action Params

    signalActionAdded(action: Action) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionAdded {id: ' + this.widgetID + '}');
        var transport = action.serialize();
        this.signalParent('actionadded', transport);
    }

    signalActionRemoved(actionName: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionRemoved {id: ' + this.widgetID + '}');
        //var t = action.name();
        this.signalParent('actionremoved', actionName);
    }

    // changeData: { name: actionName, property: "enabled", value: val }
    signalActionChanged(action: Action, changeData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionChanged {id: ' + this.widgetID + '}');
        changeData.name = action.name; // add action name
        this.signalParent('actionchanged', changeData);
    }

    // returnData: { name: actionName, returnValue: "enabled", value: val }
    signalActionInvoked(action: Action, returnData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionInvoked {id: ' + this.widgetID + '}');
        //var transport = { name: action.name(), retu: argObj };
        returnData.name = action.name;
        this.signalParent('actioninvoked', returnData);
    }

    signalActionParamAdded(actionParam: ActionParam, actionName: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionParamAdded {id: ' + this.widgetID + '}');
        var transport = actionParam.serialize();
        // TODO: move to ActionParam.toTransport()
        transport.actionName = actionName;
        this.signalParent('actionparamadded', transport);
    }

    signalActionParamRemoved(actionParamName: string, actionName: string) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionParamRemoved {id: ' + this.widgetID + '}');
        //var t = action.name();
        var transport = { name: actionParamName, actionName: actionName };
        this.signalParent('actionparamremoved', transport);
    }

    signalActionParamChanged(actionParam: ActionParam, actionName: string, changeData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalActionParamChanged {id: ' + this.widgetID + '}');
        changeData.name = actionParam.name; // add actionparam name
        changeData.actionName = actionName; // add action name
        this.signalParent('actionparamchanged', changeData);
    }

    // Events

    signalEventAdded(eventDesc: EventDesc) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalEventAdded {id: ' + this.widgetID + '}');
        var transport = eventDesc.serialize();
        this.signalParent('eventadded', transport);
    }

    signalEventRemoved(eventDescName: string) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalEventRemoved {id: ' + this.widgetID + '}');
        //var transport = eventDesc.name();
        this.signalParent('eventremoved', eventDescName);
    }

    signalEventChanged(eventDesc: EventDesc, changeData: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalEventChanged {id: ' + this.widgetID + '}');
        changeData.name = eventDesc.name; // add event name
        this.signalParent('eventchanged', changeData);
    }

    signalEventTriggered(eventDesc: EventDesc, value: any) {
        if (!this._connected) return; // no signaling if not connected
        logInfo('widget: signalEventTriggered {id: ' + this.widgetID + '}');
        var transport = { name: eventDesc.name, value: value };
        this.signalParent('eventtriggered', transport);
    }

    /* Misc */

    private buildParentMessageData(
        name: string,
        payload: string | object,
        widgetID: string
    ): MessageData {
        return {
            name: name,
            payload: payload,
            widget: widgetID,
        };
    }

    // note: this returns true when widget is forced cross domain
    private isParentSameDomain(): boolean {
        if (this.sameParentDomain == null) this.sameParentDomain = this.checkParentSameDomain();
        return this.sameParentDomain;
    }

    private checkParentSameDomain(): boolean {
        if (window.parent == null) return false;
        try {
            var d = window.parent.document;
            return true;
        } catch (ex) {
            return false;
        }
    }
}


