/**
 * Communicator utilities
 * Functions for messaging between the widget and the web page.
 * @module communicator
 */

export interface MessageData {
    name: string;
    payload: any;
    widget?: string;
}

export abstract class CommunicatorBase {
    constructor() {
        // Private constructor to enforce singleton pattern
        this.addMessageEvent();
    }

    addMessageEvent() {
        if (!window.addEventListener) return;
        window.addEventListener('message', this.receiveXSM.bind(this), false);
    }

    receiveXSM(event: MessageEvent<MessageData | null>) {
        if (event == null) return;
        const msgData = event.data;
        if (msgData == null) return;
        // it's possible in future we'll have a nested widget scenario, so a widget can have both a parent and widgets.
        // if (msgData.widget !== undefined)
        //     this.receiveFromWidget(msgData.name, msgData.payload, msgData.widget);
        // else this.receiveFromParent(msgData.name, msgData.payload);
        this.receiveMessage(msgData);
    }

    /**
     * Handle incoming messages from the other window.
     * @param data Data received from the other window
     */
    protected abstract receiveMessage(data: MessageData): void;
}
