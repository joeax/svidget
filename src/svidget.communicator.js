/*****************************************
svidget.communicator.js

Contains the communicator class for managing communication between windows and/or via cross site messagigin (XSM).

Dependencies:
svidget.core.js
svidget.root.js

Prerequisites:


******************************************/



Svidget.Communicator = function () {
	this.__type = "Svidget.Communicator";
	this.sameDomain = null;

	this._init();
}

Svidget.Communicator.prototype = {

	_init: function () {
		this.addMessageEvent();
	},

	// REGION: Events

	addMessageEvent: function () {
		window.addEventListener('message', Svidget.wrap(this.receiveXSM, this), false);
	},

	// REGION: Receive

	receiveFromParent: function (name, payload) {
		svidget.receiveFromParent(name, payload);
	},

	receiveFromWidget: function (name, payload, widgetID) {
		svidget.receiveFromWidget(name, payload, widgetID);
	},

	receiveXSM: function (message) {
		if (message == null) return;
		var msgData = message.data;
		if (msgData == null) return;
		// it's possible in future we'll have a nested widget scenario, so a widget can have both a parent and widgets.
		if (msgData.widget !== undefined)
			this.receiveFromWidget(msgData.name, msgData.payload, msgData.widget);
		else
			this.receiveFromParent(msgData.name, msgData.payload);
	},

	// REGION: Signal Parent

	signalParent: function (name, payload, widgetID) {
		// todo: cache result of isParentSameDomain
		if (this.isParentSameDomain()) {
			this.signalParentDirect(name, payload, widgetID);
		}
		else {
			this.signalParentXSM(name, payload, widgetID);
		}
	},

	signalParentDirect: function (name, payload, widgetID) {
		//var check = window === window.parent;
		// note: if window.parent.svidget is null it means the widget DOM was ready before the page DOM, although unlikely it is possible
		// so we need to handle somehow
		if (window.parent != null && window !== window.parent && window.parent.svidget != null && window.parent.svidget) {
			var root = window.parent.svidget;
			setTimeout(function () {
				root.routeFromWidget(name, payload, widgetID);
			}, 0);
			//window.parent.svidget.routeFromWidget(name, payload, widgetID);
		}
	},

	signalParentXSM: function (name, payload, widgetID) {
		if (window.parent != null) {
			//alert('postMessage');
			var msg = this.buildSignalParentMessage(name, payload, widgetID);
			window.parent.postMessage(msg, '*');
		}
	},

	buildSignalParentMessage: function (name, payload, widgetID) {
		return {
			name: name,
			payload: payload,
			widget: widgetID,
		};
	},

	// todo: move to widget
	// note: this returns true when widget is forced cross domain
	isParentSameDomain: function () {
		if (this.sameParentDomain == null) this.sameParentDomain = this.checkParentSameDomain();
		return this.sameParentDomain;
	},

	// todo: move to Svidget.DOM
	checkParentSameDomain: function () {
		try {
			var d = window.parent.document;
			return true;
		}
		catch (ex) {
			return false;
		}
	},

	// REGION: Widgets

	signalWidget: function (widgetRef, name, payload) {
		Svidget.log("communicator: signalWidget {name: " + name + "}");
		if (!widgetRef.isCrossDomain()) //this.isWidgetSameDomain(widgetProxy))
			this.signalWidgetDirect(widgetRef, name, payload);
		else
			this.signalWidgetXSM(widgetRef, name, payload);
	},

	signalWidgetDirect: function (widgetRef, name, payload) {
		if (widgetRef == null) return;
		var root = widgetRef.root();
		if (root != null) {
			setTimeout(function () {
				root.receiveFromParent(name, payload);
			}, 0);
		}
	},

	signalWidgetXSM: function (widgetRef, name, payload) {
		if (widgetRef != null && widgetRef.window() != null) {
			var msg = this.buildSignalWidgetMessage(name, payload);
			//widgetRef.window().postMessage(msg, '*');
			setTimeout(function () {
				Svidget.log("communicator: postMessage");
				widgetRef.window().postMessage(msg, '*');
			}, 0);
		}
	},

	buildSignalWidgetMessage: function (name, payload) {
		return {
			name: name,
			payload: payload
		};
	}

	//	isWidgetSameDomain: function (widgetRef) {
	//		try {
	//			var d = widgetRef.document();
	//			return d != null;
	//		}
	//		catch (ex) {
	//			return false;
	//		}
	//	}

}