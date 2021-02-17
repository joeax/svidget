/*****************************************
svidget.widget.js

Contains the core framework elements.

******************************************/

namespace Svidget {
    /**
     * Represents the widget on an HTML page.
     * @class
     * @mixes Svidget.ObjectPrototype
     * @augments Svidget.EventPrototype
     * @memberof Svidget
     */
    /*
    // note: Widget class should be decoupled from the DOM
    */
    export class WidgetBase
        implements WidgetCore, BaseMixin<WidgetProps, WidgetEventTypes> {
        /**
         * Gets the widget ID.
         * @method
         * @memberof Svidget.Widget.prototype
         * @returns {string} - The widget ID as a string.
         */
        get id(): string {
            return this.getset<string>("id");
        }

        /**
         * Gets whether the widget is enabled.
         * @method
         * @memberof Svidget.WidgetReference.prototype
         * @returns {boolean} - The enabled state.
         */
        get enabled(): boolean {
            // todo: make settable from the page?
            return this.getset<boolean>("enabled");
        }

        /**
         * Gets whether the widget is connected to a parent page.
         * If true, it means the page initialized the widget and is listening for events.
         * If false, it means the widget was loaded independently and/or outside of of the control of the framework (standalone mode).
         * @method
         * @memberof Svidget.Widget.prototype
         * @returns {Boolean} - Whether the widget is connected
         */
        get connected(): boolean {
            return this.getset<boolean>("connected");
        }

        get started(): boolean {
            return this.getset<boolean>("started");
        }
    }

    export interface WidgetBase
        extends ObjectBase<WidgetProps, WidgetEventTypes> {}
}
