/*****************************************
svidget.objectprototype.js

Contains common prototype functionality for all common Svidget objects.

Dependencies:
svidget.core.js


******************************************/

/// <reference path="collection.ts" />
/// <reference path="enums.ts" />
/// <reference path="objectCollection.ts" />
/// <reference path="propContainer.ts" />
/// <reference path="types.ts" />

namespace Svidget {

    /**
     * Encapsulates common functionality for all object types in the framework.
     * @class
     * @static
     * @memberof Svidget
     */
    export class ObjectBase<TProps extends ArtifactProps, TEventTypes extends string> 
        implements WidgetArtifact, Base<TProps, TEventTypes> {
        public readonly __type: string;
        private readonly _parent: WidgetArtifact;
        protected readonly props: PropContainer<TProps>;
        protected readonly events: EventContainer<TEventTypes>; // = new EventContainer(eventTypes);

        constructor(options: TProps, parent: WidgetArtifact, typeName: string) {
            this.__type = typeName;
            this._parent = parent;
            this.props = new PropContainer<TProps>(options);
            this.events = new EventContainer<TEventTypes>();
        }

        get parent(): WidgetArtifact {
            return this._parent;
        }

        get name(): string {
            return this.getset<string>("name");
        }

        get external(): boolean {
            return this.getset<boolean>("external");
        }

        getset<TType extends unknown>(
            name: keyof TProps,
            val?: TType,
            type?: ParamTypeName
        ): TType {
            return this.getset(name, val, type);
        }

        on(
            type: TEventTypes,
            handler: EventHandlerFunc,
            data?: unknown,
            name?: string
        ): boolean {
            return this.events.on(type, handler, data, name);
        }

        off(type: TEventTypes, handlerOrName: EventHandlerFunc | string) {
            const handler = typeof handlerOrName === "function" ? handlerOrName : undefined;
            const name = typeof handlerOrName === "string" ? handlerOrName : undefined;
            return this.events.off(type, handler, name);
        }

        trigger(type: TEventTypes, value?: unknown, originalTarget?: Base): void {
            this.events.trigger(type, value, originalTarget)
        }


        // TODO: should move somewhere else
        // protected
        // should always return a collection
        protected select<T>(
            col: ObjectCollection<T>,
            selector: string | number | CollectionPredicateFunc<T>
        ) {
            if (typeof selector === "number") {
                selector = parseInt(selector); // coerce to integer
                return col.wrap(col.getByIndex(selector));
            } else if (typeof selector === "function") {
                return col.find(selector);
            }
            if (selector !== undefined)
                return col.wrap(col.getByName(selector + ""));
            // todo: should we clone collection?
            return col;
        }

        // TODO: should move somewhere else
        // protected
        // should always return a single item
        protected selectFirst<T>(
            col: ObjectCollection<T>,
            selector: string | number | CollectionPredicateFunc<T>
        ) {
            if (typeof selector === "number") {
                selector = parseInt(selector); // coerce to integer
                return col.getByIndex(selector);
            } else if (typeof selector === "function") {
                return col.items.first(selector);
            }
            if (selector !== undefined) return col.getByName(selector + "");
            return col.items.first();
        }

        // move somewhere else?
        // protected
        protected wireCollectionAddRemoveHandlers<T>(col: ObjectCollection<T>, addFunc: DispatchFunc<T>, removeFunc: DispatchFunc<T>) {
            if (col == null) return;
            col.onAdded(addFunc.bind(this));
            col.onRemoved(removeFunc.bind(this));
        }
    }
}
