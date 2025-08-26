import { EventableBase } from './eventableBase';

// Root Events
export const RootBaseEventTypes = ["load"] as const;
export type RootBaseEventType = (typeof RootBaseEventTypes)[number];

/**
 * RootBase class
 * Base for WidgetRoot and PageRoot. Handles shared state, comms, and event logic.
 */
export abstract class RootBase<TEventType extends string> extends EventableBase<TEventType> {
    /** Communication object (stub for now) */
    protected comm: any = null;
    /** Connected state */
    protected _connected: boolean = false;
    /** Loaded state */
    protected _loaded: boolean = false;

    /**
     * Gets or sets whether the root is connected to a parent page.
     */
    get connected(): boolean {
        return this._connected;
    }
    set connected(val: boolean) {
        this._connected = val;
    }

    /**
     * Gets or sets whether the root is loaded.
     */
    get loaded(): boolean {
        return this._loaded;
    }
    set loaded(val: boolean) {
        this._loaded = val;
    }

    /**
     * Triggers a load event (for compatibility with legacy root)
     */
    protected triggerLoad(): void {
        this.trigger('load' as TEventType, undefined);
    }

    /**
     * Triggers a widgetload event (for compatibility with legacy root)
     */
    protected triggerWidgetLoad(widgetID?: string): void {
        this.trigger('widgetload' as TEventType, widgetID);
    }

    /**
     * Mark as loaded and trigger load event if not already loaded
     */
    protected markLoaded(): void {
        if (this.loaded) return;
        this.loaded = true;
        this.triggerLoad();
    }

    receiveFromParent(name: string, payload: any): void {
        // overriden in root.widget
    }
}
