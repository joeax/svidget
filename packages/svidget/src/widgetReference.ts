/**
 * WidgetReference class
 * Represents a reference to a widget instance, used for proxying metadata and access.
 * @module WidgetReference
 */
export class WidgetReference {
  /** Unique widget ID */
  id: string;
  /** Widget title (proxied from Widget) */
  title: string;
  /** Widget description (proxied from Widget) */
  description: string;
  /** Reference to the Widget instance */
  widget: any;

  /**
   * Constructs a WidgetReference instance.
   * @param id Widget ID
   * @param title Widget title
   * @param description Widget description
   * @param widget Reference to Widget instance
   */
  constructor(id: string, title: string, description: string, widget: any) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.widget = widget;
  }

  // TODO: Implement proxy logic for title/description and any additional methods per vibespec
}
