import { ActionProxy } from './actionProxy';
import { CommunicatorBase, MessageData, MessageHandler } from './communicatorBase';
import { EventDescProxy } from './eventDescProxy';
import { logInfo } from './logging';
import { WidgetReference } from './widgetReference';

/**
 * PageCommunicator class
 * Handles messaging between the page and the widget.
 * @module pageCommunicator
 */
export class PageCommunicator extends CommunicatorBase {
    private messageHandler: MessageHandler;
    private sameWidgetDomain: boolean | null = null;

    constructor(messageHandler: MessageHandler) {
        super();
        this.messageHandler = messageHandler;
    }

    /**
     * Handle incoming messages from the widget window.
     * @param data Data received from the widget window
     */
    protected receiveMessage(data: MessageData): void {
        // Handle incoming messages specific to the page
        this.messageHandler(data);
    }

    signalWidget(widgetRef: WidgetReference, name: string, payload: object) {
        logInfo('communicator: signalWidget {name: ' + name + '}');
        if (!widgetRef.crossDomain)
            //this.isWidgetSameDomain(widgetProxy))
            this.signalWidgetDirect(widgetRef, name, payload);
        else this.signalWidgetXSM(widgetRef, name, payload);
    }

    private signalWidgetDirect(widgetRef: WidgetReference, name: string, payload: object) {
        if (widgetRef == null) return;
        var root = widgetRef.root;
        if (root != null) {
            setTimeout(function () {
                root.routeFromParent(name, payload);
            }, 0);
        }
    }

    private signalWidgetXSM(widgetRef: WidgetReference, name: string, payload: object) {
        if (widgetRef != null && widgetRef.window != null) {
            var msg = this.buildSignalWidgetMessage(name, payload);
            //widgetRef.window().postMessage(msg, '*');
            setTimeout(function () {
                logInfo('communicator: postMessage');
                widgetRef.window.postMessage(msg, '*');
            }, 0);
        }
    }

    /* Signal Methods */

    public signalStart(widgetRef: WidgetReference, paramValues: any) {
        logInfo(
            'page: signalStart {id: ' +
                widgetRef.id +
                ', url: ' +
                widgetRef.url +
                ', tag: ' +
                widgetRef.element?.tagName +
                '}'
        );
        //var paramValues = {};
        var payload = { id: widgetRef.id, params: paramValues, connected: widgetRef.connected };
        this.signalWidget(widgetRef, 'start', payload);
    }

    public signalPropertyChange(
        widgetRef: WidgetReference,
        obj: any,
        objType: any,
        propName: any,
        propValue: any
    ) {
        if (!widgetRef.started || !widgetRef.connected) return;
        logInfo('page: signalPropertyChange {id: ' + widgetRef.id + ', type: ' + objType + '}');
        var payload = { type: objType, name: obj.name, propertyName: propName, value: propValue };
        this.signalWidget(widgetRef, 'propertychange', payload);
    }

    public signalActionInvoke(widgetRef: WidgetReference, actionProxy: ActionProxy, argList: any) {
        if (!widgetRef.started || !widgetRef.connected) return;
        logInfo(
            'page: signalActionInvoke {id: ' + widgetRef.id + ', url: ' + widgetRef.url + '}'
        );
        //var paramValues = {};
        var payload = { action: actionProxy.name, args: argList };
        this.signalWidget(widgetRef, 'actioninvoke', payload);
    }

    public signalEventTrigger(
        widgetRef: WidgetReference,
        eventDescProxy: EventDescProxy,
        data: any
    ) {
        if (!widgetRef.started || !widgetRef.connected) return;
        logInfo('page: signalEventTrigger {id: ' + widgetRef.id + '}');
        var payload = { event: eventDescProxy.name, data: data };
        this.signalWidget(widgetRef, 'eventtrigger', payload);
    }

    private buildSignalWidgetMessage(name: string, payload: object): MessageData {
        return {
            name: name,
            payload: payload,
        };
    }
}
