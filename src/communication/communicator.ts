/*****************************************
svidget.communicator.js

Contains the communicator class for managing communication between windows and/or via cross site messagigin (XSM).

Dependencies:
svidget.core.js
svidget.root.js

Prerequisites:


******************************************/

namespace Svidget {

/**
 * Provides communications functionality between a page and a widget. Internal class only.
 * @class
 */
export class Communicator {
	private readonly __type = "Svidget.Communicator";
	private readonly _receiveFromParent: ParentReceiveFunc;
	private readonly _receiveFromWidget: WidgetReceiveFunc;
	private sameDomain: boolean;
	private sameParentDomain: boolean;

	//constructor({ receiveFromParent, receiveFromWidget }: { receiveFromParent: ParentReceiveFunc, receiveFromWidget: WidgetReceiveFunc }) {
	constructor() {
		//this._receiveFromParent = Svidget.bind(receiveFromParent, this);
		//this._receiveFromWidget = Svidget.bind(receiveFromParent, this);
		this.addMessageEvent();
	}

	// REGION: Events

	addMessageEvent() {
		if (!window.addEventListener) return;
		window.addEventListener('message', Svidget.bind(this.receiveXSM, this), false);
	}

	// REGION: Receive

	// todo: remove dependency on "root" object
	// invert so that root "owns" this object instead
	// we can also decouple root and pass a generic object with receiveFromParent/receiveFromWidget
	private receiveFromParent(name: string, payload: unknown) {
		if (this.receiveFromParent) this.receiveFromParent(name, payload);
	}

	private receiveFromWidget(name: string, payload: unknown, widgetID: string) {
		if (this.receiveFromWidget) this.receiveFromWidget(name, payload, widgetID);
	}

	private receiveXSM(message: MessageEvent<CrossMessage>): void {
		if (message == null) return;
		const msgData = message.data;
		if (msgData == null) return;
		// it's possible in future we'll have a nested widget scenario, so a widget can have both a parent and widgets.
		// a widget will always send its widget ID
		if (msgData.widget !== undefined)
			this.receiveFromWidget(msgData.name, msgData.payload, msgData.widget);
		else
			this.receiveFromParent(msgData.name, msgData.payload);
	}

	// REGION: Signal Parent

	signalParent(name: string, payload: unknown, widgetID: string): void {
		// todo: cache result of isParentSameDomain
		if (this.isParentSameDomain()) {
			this.signalParentDirect(name, payload, widgetID);
		}
		else {
			this.signalParentXSM(name, payload, widgetID);
		}
	}

	signalParentDirect(name: string, payload: unknown, widgetID: string): void {
		//var check = window === window.parent;
		// note: if window.parent.svidget is null it means the widget DOM was ready before the page DOM, although unlikely it is possible
		// so we need to handle somehow
		if (window.parent != null && window !== window.parent && (window.parent as Svidgetable).svidget != null) { //} && window.parent.svidget) {
			const root = window.parent.svidget;
			setTimeout(function () {
				root.routeFromWidget(name, payload, widgetID);
			}, 0);
			//window.parent.svidget.routeFromWidget(name, payload, widgetID);
		}
	}

	signalParentXSM(name, payload, widgetID) {
		if (window.parent != null && window.parent.postMessage != null) {
			//alert('postMessage');
			var msg = this.buildSignalParentMessage(name, payload, widgetID);
			window.parent.postMessage(msg, '*');
		}
	}

	buildSignalParentMessage(name, payload, widgetID): CrossMessage {
		return {
			name: name,
			payload: payload,
			widget: widgetID,
		};
	}

	// todo: move to widget
	// note: this returns true when widget is forced cross domain
	isParentSameDomain(): boolean {
		if (this.sameParentDomain == null) this.sameParentDomain = this.checkParentSameDomain();
		return this.sameParentDomain;
	}

	// todo: move to Svidget.DOM
	checkParentSameDomain(): boolean {
		if (window.parent == null) return false;
		try {
			var d = window.parent.document;
			return true;
		}
		catch (ex) {
			return false;
		}
	}

	// REGION: Widgets

	signalWidget(widgetRef, name, payload) {
		Svidget.log("communicator: signalWidget {name: " + name + "}");
		if (!widgetRef.isCrossDomain()) //this.isWidgetSameDomain(widgetProxy))
			this.signalWidgetDirect(widgetRef, name, payload);
		else
			this.signalWidgetXSM(widgetRef, name, payload);
	}

	signalWidgetDirect(widgetRef, name, payload) {
		if (widgetRef == null) return;
		var root = widgetRef.root();
		if (root != null) {
			setTimeout(function () {
				root.receiveFromParent(name, payload);
			}, 0);
		}
	}

	signalWidgetXSM(widgetRef, name, payload) {
		if (widgetRef != null && widgetRef.window() != null) {
			var msg = this.buildSignalWidgetMessage(name, payload);
			//widgetRef.window().postMessage(msg, '*');
			setTimeout(function () {
				Svidget.log("communicator: postMessage");
				widgetRef.window().postMessage(msg, '*');
			}, 0);
		}
	}

	buildSignalWidgetMessage(name, payload) {
		return {
			name: name,
			payload: payload
		};
	}

	/*
	//	isWidgetSameDomain(widgetRef) {
	//		try {
	//			var d = widgetRef.document();
	//			return d != null;
	//		}
	//		catch (ex) {
	//			return false;
	//		}
	//	}
	*/
}

}