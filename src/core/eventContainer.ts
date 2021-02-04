/*****************************************
svidget.eventContainer

Contains a class for managing events for another object.

Dependencies:
svidget.core.js
svidget.collection.js

******************************************/

/// <reference path="collection.ts" />

namespace Svidget {

    type Handler = {
        handler: EventHandlerFunc;
        name: string;
        data: unknown;
    };

    //type HandlerDictionary = Partial<Record<EventType, Collection<Handler>>>;
    //type BubbleDictionary = Partial<Record<TEventType, EventBubbleFunc>>;

    /**
     * Encapsulates a set of prototype methods for managing events.
     * @class
     * @memberof Svidget
     * @param {array} typelist - A list of event types.
     */
    export class EventContainer<TEventType extends string> {
        //private readonly eventTypes: Collection<string>;
        private handlers: Partial<Record<TEventType, Collection<Handler>>> = {};
		private bubbleParents: Partial<Record<TEventType, EventBubbleFunc>> = {};

        constructor(typelist?: Array<string>) {
            // function (typelist) {
            // todo: validate typelist
            // these are the event types that the base object supports, like "invoke" for action.
            //this.eventTypes = new Svidget.Collection(typelist);
            //this.handlers = {}; // collection
            //this.bubbleParents = {}; // collection
        }

        /*
	// follows jQuery convention of (type, data, handler)
	// with a twist, we allow them to specify a name for the handler, for easier removal with off
	// if the name or handler already was added, then nothing happens and false is returned
	// required: type, handler
	// allowed signatures
	//   (type, handler)
	//   (type, data, handler)
	//   (type, data, name, handler)
	*/
        //on(type: TEventType, handler: EventHandlerFunc): boolean;
        //on(type: TEventType, handler: EventHandlerFunc, data?: unknown): boolean;
        on(
            type: TEventType,
            handler: EventHandlerFunc,
            data?: unknown,
            name?: string
        ): boolean {
            // resolve handler from whether name, data passed
            //var argsCount = Svidget.isFunction(handler) ? 4 : Svidget.isFunction(name) ? 3 : Svidget.isFunction(data) ? 2 : 1;
            //handler = handler || (Svidget.isFunction(name) ? name : (Svidget.isFunction(data) ? data : null));
            //handler = (argsCount == 4) ? handler : (argsCount == 3) ? name : (argsCount == 2) ? data : null;
            //data = (argsCount > 2) ? data : null;
            //name = (argsCount > 3) ? name : null;
            if (!handler) return false;
            return this.addHandler(type, handler, name, data);
        }

        /*
	// allowed signatures
	//   (type, handler)
	//   (type, name)
	*/
        //off(type: TEventType, handler?: EventHandlerFunc);
        off(type: TEventType, handler?: EventHandlerFunc, name?: string) {
            //off(type: EventType, handlerOrName) {
            // separate handlerOrName into handler, name
            //var handler = Svidget.isFunction(handlerOrName) ? handlerOrName : null;
            //var name = (handler != null) ? null : handlerOrName;
            return this.removeHandler(type, handler, name);
        }

        trigger(type: TEventType, value?: unknown, originalTarget?: Base): void {
            if (type == null) return; // nothing to do
            // get event object from handlers
            var e = this.fireHandlers(type, value, originalTarget);
            Svidget.log("trigger: ", type);
            // if not stopPropagation call bubble
            if (!e.isPropagationStopped()) {
                this.bubble(type, e);
            }
        }

        fireHandlers(
            type: TEventType,
            value?: unknown,
            originalTarget?: Base
        ): Svidget.Event {
			// generate event object
            var e = Svidget.newEvent(
                null,
                type,
                null,
                this.getTarget(),
                originalTarget,
                value
            );
            if (
                type == null ||
                this.handlers == null ||
                this.handlers[type] == null
            )
                return e; // nothing to do
            var handlers = this.handlers[type];
            // loop through each handler (make sure it is a function)
            // h == { handler: handler, name: name, data: data }
            handlers.iterate((h) => {
                // if stopImmediatePropagation, then exit loop by returning false
                if (e.isImmediatePropagationStopped()) return false; 
                if (typeof h?.handler !== "function")
                    return; // handler is not a function
                // set name/data
                e.name = h.name;
                e.data = h.data;
                // invoke handler
                h.handler.call(null, e);
            });

            return e;
        }

        bubble(type: TEventType, sourceEvent: Event): void {
            // invoked from child
            this.ensureBubbleParents();
            sourceEvent.name = null;
            sourceEvent.data = null;
            if (this.bubbleParents[type])
                this.bubbleParents[type](type, sourceEvent, this.getTarget());
        }

        addHandler(
            type: TEventType,
            handler: EventHandlerFunc,
            name: string,
            data
        ): boolean {
            this.ensureHandlersByType(type);
            // todo: get handler function name, we will use to off() handlers by name
            //if (this.handlers[type].contains(handler)) return false;
            if (this.handlerExists(type, handler, name)) return false;
            var obj = this.toHandlerObject(handler, name, data);
            this.handlers[type].push(obj);
            return true;
        }

        removeHandler(
            type: TEventType,
            handler: EventHandlerFunc,
            name: string
        ): boolean {
            this.ensureHandlers();
            if (!this.handlers[type]) return false;
            return this.handlers[type].removeWhere((h) =>
                this.handlerMatch(h, handler, name)
            );
        }

        handlerExists(
            type: TEventType,
            handler: EventHandlerFunc,
            name: string
        ): boolean {
            var any = this.handlers[type].some((h) =>
                this.handlerMatch(h, handler, name)
            );
            return any;
        }

        handlerMatch(handlerObj, handler: EventHandlerFunc, name): boolean {
            if (name != null && handlerObj.name === name) return true;
            if (handler === handlerObj.handler) return true;
            return false;
        }

        setBubbleParent(type: EventType, callback): void {
            this.ensureBubbleParents();
            this.bubbleParents[type] = callback;
        }

        // private, called by the object to register a single callback for all its event types
        // bubbleTarget: usually a parent object
        registerBubbleCallback(
            types: TEventType[],
            bubbleTarget,
            callback: EventBubbleFunc
        ) {
            if (bubbleTarget && callback) {
                for (var i = 0; i < types.length; i++) {
                    this.setBubbleParent(
                        types[i],
                        Svidget.bind(callback, bubbleTarget)
                    );
                }
            }
        }

        toHandlerObject(
            handler: EventHandlerFunc,
            name: string,
            data: unknown
        ): Handler {
            var handlerFunc =
                typeof handler !== "function" ? null : handlerFunc;
            var res = { handler: handler, name: name, data: data };
            return res;
        }

        bubbleFuncs(objectType) {
            // override me
        }

        ensureHandlers() {
            if (!this.handlers) this.handlers = {};
        }

        ensureHandlersByType(type: EventType) {
            this.ensureHandlers();
            if (!this.handlers[type]) {
                this.handlers[type] = new Svidget.Collection();
            }
        }

        ensureBubbleParents() {
            if (!this.bubbleParents) this.bubbleParents = {};
        }

        // internal
        // returns the target object to use for the event object
        // override in eventContainer
        getTarget(): Base {
            return;
        }
    }
}
