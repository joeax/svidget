# Contributing

This is the current roadmap of items under consideration.

## 0.3.x
- add global catch all events to svidget at page level (i.e. svidget.on("eventtrigger"))
- move populate code from WidgetReference to Root.Page (deferred, possibly 1.1)
- add declarative event wiring for paramchange and paramset at widget level (from <svidget:params> element), actions and events too
- if param/action/event is orphaned (removed from parent), then throw error when trying to access or invoke a member on it
- widget/svidget.onconnect event
- widget.onstart event (from both page and widget; update: at page level this is just onwidgetload)
- move writable properties to bottom of class

## 0.4.x
- actionparam.arbitrary - the actionparam receives all remaining args (think params in .net), actionparam's after it are ignored (called rest params in ES6)
- data-allowresize: if widget requests a resize (probably just do resize for now)
- data-allowmove: if widget requests a move (not sure if we need as this is an attribute of the page, the widget may not need to know its location)
- widget x/y/width/height properties
- add toJSON calls along with existing toTransport calls
- loader on top of widget in case it takes a long time to load
- string/date type/subtype
- type array with subtype as number,string,etc to enforce all elements are that type
- ability to pass functions as params
- condensify various common properties like enabled, description (into common Prototype class); cleaning up repetitve code
- for action.invoke() should return an object like task or promise (instead of true/false); same behavior for action and actionproxy
- ability to map parameter to a global scope variable (i.e. _data)
- ability to use true object literal, property name without quotes in conversion.toObject { foo: 'bar' } (consider moving JSON stuff to its own class)
- standalone/connected should be togglable from the parent so as to turn on/off communication
- implement param() per the (SVG params spec)[http://www.w3.org/TR/SVGParamPrimer/]
- test and handle downgrading case when browser doesn't support SVG (no SVG support, non-HTML5)
- number/range type/subtype, typedata="0-100" or "0-100,-100--50,1000-1005"
- group attribute for param, action, events to group common items together (useful for inspector tool)
- remove old useless code in root.page (i.e. waitForWidgets, handleReceiveWidgetLoaded, checkUnfinishedWidgetReferences, etc)
- come up with something much better than the pagepopulate event to tell widget developer whether widget is standalone or not

## Other
- think about coercion rules, should number/integer coerce to 0 if null/undefined? should this be handled at conversion level or value() call?
- data-fallback attribute
- theming/skinning: widget.css property, allow advanced css injection, automatically emits/updates a <style> tag (widget authors will supply css reference docs for class names for their widget)

