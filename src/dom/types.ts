namespace Svidget {

    export type DOMNode = HTMLElement | SVGElement | Attr;

    export interface DOMObject {
        name: string;
        namespace: string;
        value: string;
        type?: Svidget.NodeTypes;
        elements?: DOMObject[];
        attributes?: DOMObject[];
    }

    export type DOMAny = DOMNode | DOMObject;
}
