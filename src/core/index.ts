/*****************************************
svidget.core.js

Contains the core framework elements.

Dependencies:
(none)

******************************************/

/* Global Namespace */

var VERSION = "0.5.0";

// define window and document if needed
// note: global declared by closure
var window = global;
var document = window.document || {} as Document;

namespace Svidget {
    /* REGION Common Properties */

    export const root = null; // set in Svidget.Root, this is the singleton instance to the global "svidget" object.
    //export const global = global; // In server side environments will === global, in browser === window
    export const version = VERSION;
    export const declaredHandlerName = "_declared";
    export const emptyArray = []; // todo: do we need?
    export const defaultType = "object";

    export function createRoot(): Root {

    }
}
