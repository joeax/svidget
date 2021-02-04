/// <reference path="enums.ts" />

namespace Svidget {
    // FUNCTIONS

    // Common
    export type AnyFunc = () => void;
    export type ValidatorFunc = (input: unknown) => boolean;
    export type DispatchFunc<T> = (item: T) => void;

    export type ParamType =
    | object
    | string
    | number
    | boolean
    | Array<unknown>
    | Function;


    // Get/Set
    export type GetterFunc = (name: string) => unknown;
    export type SetterFunc = (name: string, input: unknown) => unknown;
    export type GetSetFunc<TProps> = (name: keyof TProps, val?: unknown, type?: ParamTypeName) => unknown;

    export interface GetSetter<TProps> {
        getset: GetSetFunc<TProps>;
    }


    // Events
    export type OnEventFunc<TEventTypes> = (type: TEventTypes, handler: EventHandlerFunc, data?: unknown, name?: string) => boolean;
    export type OffEventFunc<TEventTypes> = (type: TEventTypes, handlerOrName: EventHandlerFunc | string) => boolean;
    export type TriggerFunc<TEventTypes> = (type: TEventTypes, value?: unknown, originalTarget?: any) => void;

    export type EventHandlerFunc = (event: Event) => void;
    export type EventBubbleFunc = (
        event: EventType,
        sourceEvent: Event,
        target: Artifact
    ) => void;

    export type EventType = "none";

    export interface Eventer<TEventTypes> {
        on: OnEventFunc<TEventTypes>;
        off: OffEventFunc<TEventTypes>;
        trigger: TriggerFunc<TEventTypes>;
    }


    // OPTIONS

    export interface BaseOptions {
        external?: boolean;
    }

    export interface EventOptions {
        name: string;
        type: EventType;
        data?: unknown;
        target: Artifact;
        origTarget?: Artifact;
        value: unknown;
    }

    export interface Svidgetable {
        svidget: Root;
    }

    export interface Base<TProps, TEventTypes> extends GetSetter<TProps>, Eventer<TEventTypes> { }

    export interface Artifact {
        readonly __type: string;
        readonly parent: Artifact;
    }

    export interface WidgetArtifact extends Artifact {
        readonly name: string;
        readonly parent: WidgetArtifact;
        // Whether the artifact is accessible by the parent (synonymous with a private member of an object)
        external: boolean;
    }

    export interface ArtifactProps {
        name: string;
        external: boolean;
    }

    interface ArtifactCollectionProps extends ArtifactProps {
        type: string;
    }

    export interface ProxyProps extends Omit<ArtifactProps, "external">  {
        readonly name: string;
        readonly connected: boolean;
    }

    export interface ProxyOptions {
        name: string;
    }

    // Represents the interface that describes a Proxy
    export interface ProxyArtifact
        extends Omit<ProxyProps, "name">,
            WidgetArtifact {}

    export type ProxyEventTypes = "propertyChange";

    // null = read/write, undefined = read
    // update: we may not need this anymore
    export type ArtifactDescriptor<T> = Record<keyof T, null | undefined>;

    export interface BaseMixin<TProps, TEventTypes> {
        __configure: (base: Base<TProps, TEventTypes>) => void;
    }
}
