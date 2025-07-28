import { CommunicatorBase, MessageData } from './communicatorBase';
import { logInfo } from './logging';
import { WidgetReference } from './widgetReference';

export type PageMessageHandler = (data: MessageData) => void;

/**
 * PageCommunicator class
 * Handles messaging between the page and the widget.
 * @module pageCommunicator
 */
export class PageCommunicator extends CommunicatorBase {
    private messageHandler: PageMessageHandler;
    private sameWidgetDomain: boolean | null = null;

    constructor(messageHandler: PageMessageHandler) {
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
        if (!widgetRef.isCrossDomain)
            //this.isWidgetSameDomain(widgetProxy))
            this.signalWidgetDirect(widgetRef, name, payload);
        else this.signalWidgetXSM(widgetRef, name, payload);
    }

    signalWidgetDirect(widgetRef: WidgetReference, name: string, payload: object) {
        if (widgetRef == null) return;
        var root = widgetRef.root;
        if (root != null) {
            setTimeout(function () {
                root.routeFromParent(name, payload);
            }, 0);
        }
    }

    signalWidgetXSM(widgetRef: WidgetReference, name: string, payload: object) {
        if (widgetRef != null && widgetRef.window != null) {
            var msg = this.buildSignalWidgetMessage(name, payload);
            //widgetRef.window().postMessage(msg, '*');
            setTimeout(function () {
                logInfo('communicator: postMessage');
                widgetRef.window.postMessage(msg, '*');
            }, 0);
        }
    }

    buildSignalWidgetMessage(name: string, payload: object): MessageData {
        return {
            name: name,
            payload: payload,
        };
    }
}
