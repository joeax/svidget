/*****************************************
svidget.proxy.js

Provides a base class for a proxy object, one that provides a lightweight facade to an original object across a processing boundary.

Extends: Svidget.ObjectPrototype

Dependencies:
Svidget.Core
Svidget.Collection
Svidget.ObjectPrototype

******************************************/
/// <reference path="types.ts" />

namespace Svidget {

/**
 * Encapsulates logic for a proxy object that is meant to shadow a concrete one.
 * @class
 * @abstract
 * @mixes ObjectPrototype
 * @memberof Svidget.Svidget
 * @param {object} parent - The parent to this object. Usually a Svidget.WidgetReference instance.
 * @param {object} options - An object containing values to initialize properties. Example: { enabled: true, description: "An event" }
 * @param {Array} propList - An array of all properties that the underlying object exposes to the proxy.
 * @param {Array} writePropList - An array of all writable properties that the underlying object exposes to the proxy. A subset of propList.
 * @param {Array} eventList - An array of all event types that this proxy listens for and/or response to based on the underlying object.
 */
/*
// for settable properties:
// - notify root of property change
// - root communicates change to widget
// - widget communicates success or failure
//   - if success, widget triggers event
//   - if fail, root calls fail function with current value, object restores value
*/
export class Proxy<TProps extends ProxyProps, TEventTypes extends ProxyEventTypes> 
	extends ObjectBase<TProps, TEventTypes> implements ProxyArtifact {
// = function (parent, options, propList, writePropList, eventList) {

	constructor(props: TProps, parent: WidgetReference, typeName: string) {
		super(
			props as TProps,
			validateParent(parent),
			typeName
		);

	// convert to collections
	//var propCol = new Svidget.Collection(Svidget.isArray(propList) ? propList : null);
	//var writePropCol = new Svidget.Collection(Svidget.isArray(writePropList) ? writePropList : null);
	// filter so that writable properties are also contained in all properties
	//writePropCol = writePropCol.where(function (i) { return propCol.contains(i); });

	// private fields
	//var privates = {
	//	writable: writePropCol.toArray(),
	//	propertyChangeFuncs: new Svidget.Collection(),
	//	eventContainer: new Svidget.EventContainer(eventList, that),
	//	parent: parent,
	//	connected: options.connected == null ? true : !!options.connected // default to true
	//};
	// private accessors
	//this.setup(privates);

	// copy property values to privates
	for (var p in options) {
		if (privates[p] === undefined) {
			privates[p] = options[p];
		}
	}

	// load functions for each property onto this object
	for (var i=0; i<propCol.length; i++) {
		var prop = propCol[i] + "";
		if (prop.length > 0) {
			this[prop] = buildPropFunc(prop);
/*			this[prop] = function(val) { 
//				return this.getsetProp(prop+"", val); // the +""isn't for casting to string, but to not reference prop var directly
//			}; */
		}
	}

            // validate parent
            function validateParent(parent: WidgetReference): Widget {
                if (parent && !(parent instanceof WidgetReference)) {
                    throw new Error("Proxy parent must be a WidgetReference");
                }
                return parent;
            }

	function buildPropFunc(prop) {
		return function(val) { 
			return this.getsetProp(prop, val);
		};
	}

}



	/**
	 * Gets whether the proxy is connected to its underlying widget counterpart.
	*/
	/*
	// Note: used by ParamProxy to determine if params from <params> elements or from Widget
	*/
	get connected(): boolean {
		return this.getset<boolean>("connected");
	}

	
	/**
	 * Gets whether the proxy object is attached to its parent.
	 * @method
	 * @returns {boolean}
	*/
	get attached(): boolean {
		return this.parent != null && this.parent instanceof WidgetReference;
	}

	propertyChangeFuncs() {
		return this.getPrivate("propertyChangeFuncs");
	}



	// private
	// this is invoked when attempting to set a property value on the proxy itself
	// this in turn notifies the parent, which in turn notifies the widget
	protected getsetProp(prop, val) {
		var res = this.getset(prop, val);
		// if undefined its a get so return value, if res is false then set failed
		if (val === undefined || !!!res) return res;
		// fire propertyChange event
		// this.triggerPropertyChange(prop, val); // obsolete
		this.handlePropertyChange(prop, val);
		return true;
	}


	/**
	 * @abstract
	*/
	handlePropertyChange(name: keyof TProps, val: unknown): void {
		// override me
	}

	triggerPropertyChange(name: keyof TProps, val: unknown) {
		// notifies root that property change, sends it to widget
		// invoke func(this, name, val)
		var funcList = this.propertyChangeFuncs();
		var that = this;
		funcList.each(function (func) { func(that, name, val); });
	}

	// private
	// this is invoked when the widget communicates that a property was changed
	notifyPropertyChange(name, val) {
		// notifies this proxy that property changed on widget
		if (name == null) return;
		// update value to match source
		this.getset(name, val);
		// trigger change event
		this.triggerFromWidget("change", { property: name, value: val }, this);
	}

	// internal
	// refreshes the proxy object with values from the widget
	refreshProperties(propObj) {
		for (var name in propObj) {
			var item = this.getPrivate(name);
			if (item != null) {
				this.setPrivate(name, propObj[name]);
			}
		}
	},

	/**
	 * Gets whether the proxy object is connected to its underlying object.
	 * @method
	 * @returns {boolean}
	*/
	// TODO: find out how this works
	//connect() {
	//	this.setPrivate("connected", true);
	//}

	// obsolete (9/1/2014)
	// use regular events ("change", "paramchange")
	onPropertyChange(func) {
		var funcList = this.propertyChangeFuncs();
		if (!typeof func === "function") return false;
		funcList.add(func);
		return true;
	}

	// obsolete (9/1/2014)
	// use regular events ("change", "paramchange")
	offPropertyChange(func) {
		var funcList = this.propertyChangeFuncs();
		return funcList.remove(func);
	}

	/* Proxy Events */

	// Note: no access to trigger() object events here, only from widget
	// this is invoked from the widget to signal that the event was triggered
	triggerFromWidget(type, value, originalTarget) {
		this.eventContainer().trigger(type, value, originalTarget);
	}

	registerBubbleCallback(types, bubbleTarget, callback) {
		this.eventContainer().registerBubbleCallback(types, bubbleTarget, callback);
	}
}

}