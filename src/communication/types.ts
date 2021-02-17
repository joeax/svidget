namespace Svidget {

    export type ParentReceiveFunc = (name: string, payload: unknown) => void;
    export type WidgetReceiveFunc = (name: string, payload: unknown, widgetID: string) => void;

    export interface CrossMessage {
        name: string;
		payload: unknown;
		widget: string;
    }

}