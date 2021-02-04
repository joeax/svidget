/*****************************************
svidget.enums.js

Contains enum objects.

Dependencies:
(none)


******************************************/

// Enums

namespace Svidget {
    /**
     * Represents the DOM document type.
     * @enum
     * @readonly
     */
    export enum DocType {
        html = 0,
        svg = 1,
    }

    /**
     * Represents the ready state for a document.
     * @enum
     * @readonly
     */
    /*
// http://www.whatwg.org/specs/web-apps/current-work/multipage/dom.html#document
*/
    // todo = inherit from commom lib

    export enum DocReadyState {
        loading = 0, //'loading',
        interactive = 1, //'interactive',
        complete = 2, //'complete'
    }

    /**
     * Represents the ready state for an element.
     * @enum
     * @readonly
     */
    // todo = inherit from commom lib
    export enum ElementReadyState {
        uninitialized = 0,
        loading = 1,
        loaded = 2,
        interactive = 3,
        complete = 4,
    }

    /**
     * Represents the core types for a Param object.
     * @enum
     * @readonly
     */
    export enum ParamTypes {
        object = 0,
        string = 1,
        number = 2,
        boolean = 3,
        bool = 3, // deprecate
        array = 4,
        function = 5, // reserved for future use
    }
    export type ParamTypeName = keyof typeof ParamTypes;

    /**
     * Represents the core subtypes for a Param object.
     * @enum
     * @readonly
     * TODO = move to params area
     */
    export enum ParamSubTypes {
        none = 0,
        color = 1,
        integer = 2,
        regex = 3,
        choice = 4,
    }
    export type ParamSubTypeName = keyof typeof ParamSubTypes;

    /**
     * Represents the item type for an xml node.
     * Prior to 0.5.0, numbering started at 0 for element.
     * @enum
     * @readonly
     */
    export enum NodeTypes {
        none = 0,
        element = 1,
        attribute = 2,
        text = 3,
    }
    export type NodeTypeName = keyof typeof NodeTypes;

    /**
     * Represents xml namespaces used by this framework.
     */
    export enum Namespaces {
        html = "http://www.w3.org/1999/xhtml", // also used for HTML5
        svidget = "http://www.svidget.org/svidget",
        svg = "http://www.w3.org/2000/svg",
        xlink = "http://www.w3.org/1999/xlink",
    }
    export type NamespaceName = keyof typeof Namespaces;
}
