namespace Svidget {
    export type PageWidgetMessageHandlerFunc = (name: string, widget: WidgetReference, payload: unknown) => void;

    // Represents the props that are stored internally by Params
    export interface RootProps extends ArtifactProps {
        loaded: boolean;
        connected: boolean;
    }

    export type RootEventTypes = "load" | "widgetloaded";
}
