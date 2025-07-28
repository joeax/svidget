# Svidget

Svidget is a lightweight library for componentizing SVG widgets. It allows developers to create reusable, customizable SVG components that can be easily embedded in web applications. Svidget provides a simple API for defining widget parameters, actions, and events, making it easy to build interactive and dynamic user interfaces.

The goal of this vibespec is to convert the legacy codebase into a modern TypeScript codebase that adheres to best practices and is compatible with modern web standards. The new codebase will be split into two libraries: `svidget-widget` for widget functionality inside SVG files, and `svidget-page` for web page functionality.

## Requirements
- Supports only modern web browsers and standards (Chrome, Firefox, Safari, Edge)
- Support for ES6 modules
- Maintain or create JSDoc comments for all public methods and properties.
- All files must have a header that describes its purpose.
- Because libraries for page scope and widget scope will be built separately, code should be cleanly separated as possible.
- Migrate all legacy unit tests and add new unit tests using `jest` into `tests/unit` folder.
- All TypeScript files should be named with camelCase (i.e. `paramProxy.ts`).
- All class names must be named with PascalCase (i.e. `ParamProxy`).

### Future
- React wrapper library

## Data Model

### Entities

#### Widget
In-memory representation of a widget, running in a SVG file. (scope = `widget`)

##### Properties
- id (string): Unique identifier for the widget. Use mostly in the page context and is the `id` attribute of the `<object>` that loads the widget.
- title (string): The title of the widget, as specified in `<title>` element in the SVG. (Proxied to WidgetReference)
- description (string): The description of the widget, as specified in `<desc>` element in the SVG. (Proxied to WidgetReference)
- params (Param[]): Array of parameters passed to the widget.
- actions (Action[]): Array of actions available in the widget.
- events (Event[]): Array of events emitted by the widget.

##### Events
- `change`: Emitted when widget definition is changed.
- `pagepopulate`: Emitted when the widget is populated with data from the page.
- `paramvaluechange`: Emitted when a parameter value is changed.
- `paramset`: Emitted when a parameter is set.
- `paramchange`: Emitted when a parameter definition is changed.
- `paramadd`: Emitted when a new parameter is added.
- `paramremove`: Emitted when a parameter is removed.
- `actioninvoke`: Emitted when an action is invoked.
- `actionchange`: Emitted when an action definition is changed.
- `actionadd`: Emitted when a new action is added.
- `actionremove`: Emitted when an action is removed.
- `eventtrigger`: Emitted when an event is triggered.
- `eventchange`: Emitted when an event definition is changed.
- `eventadd`: Emitted when a new event is added.
- `eventremove`: Emitted when an event is removed.

#### Param
Represents a parameter that can be set on a widget. (scope = `widget`)

##### Properties
- name (string): Name of the parameter.
- shortName (string): Short name for the parameter, typically used when passing params via query string to standalone widget.
- value (any): Value of the parameter.
- defaultValue (any): Default value of the parameter. (formerly "defvalue").
- type (ParamType): Type of the parameter (e.g., "string", "number", "boolean").
- subType (ParamSubType): Subtype of the parameter (e.g., "array", "object").
- description (string): Description of the parameter.
- typedata (string): When subType is choice, contains pipe-delimited list of choices.
- coerce (boolean): Whether to coerce the value to the specified type.
- group (string): Group name for the parameter, used for organizing parameters in the widget.
- sanitizer (function | string): Function to sanitize the parameter value before setting it. This is either an actual function or the name of a function in the global scope.

##### Events
- `change`: Emitted when param definition is changed.
- `set`: Emitted when the param value is changed.

#### Action
Represents an action that can be invoked on a widget. (scope = widget)

##### Properties
- name (string): Name of the action.
- description (string): Description of the action.
- params (ActionParam[]): Array of parameters for the action.
- handler (function): Function to execute when the action is invoked.

##### Events
- `invoke`: Emitted when the action is invoked.
- `change`: Emitted when the action definition is changed.
- `paramchange`: Emitted when an action param is changed.
- `paramadd`: Emitted when a new action param is added.
- `paramremove`: Emitted when an action param is removed.

#### Event
Represents an event emitted by a widget, not to be confused with the native browser Event class. Formerly `EventDesc`. (scope = widget)

##### Properties
- name (string): Name of the event.
- description (string): Description of the event.
- external (boolean): Whether the event can be listened to from outside the widget.

##### Events
- `change`: Emitted when the event definition is changed.
- `trigger`: Emitted when the event is triggered.

#### ParamType
Possible param types.

```typescript
type ParamType = "string" | "number" | "boolean" | "object" | "array";
```

#### ParamSubType
Possible param subtypes.

```typescript
type ParamSubType = "color" | "integer" | "date" | "time" | "datetime" | "regex" | "choice";
``` 

### Notes
- for all events, there are corresponding `on` and `off` event registration methods i.e. `onTrigger`. `on` and `off` base methods are also provided and can be invoked i.e. `on("trigger")`


## Architecture
The Svidget library is split into two main libraries: `svidget-svg` and `svidget-page`. Each library has its own scope and functionality.
- `svidget-svg`: Functionality for working inside of SVG widgets.
- `svidget-page`: Functionality for working with the web page and loading widgets.

### Considerations
- `svidget` global object: is of type `PageRoot` in the page scope and `WidgetRoot` in the widget scope.
- Use `<iframe>` when embedding Svidget components from other origins.

### Widget Library
The `svidget-svg` library is responsible for the functionality of Svidget widgets inside of SVG files. It should not be used outside of SVG files. It should throw an error if used outside of an SVG file. A global object `svidget` is created at load time is is an instance of `Svidget.Widget`.

#### Functionality
- When the DOM is loaded, the `svidget` global object is created as an instance of `Svidget.WidgetRoot`. 
- All `<svidget:*>` elements are processed and converted into their corresponding JavaScript objects.
- The `Widget` object is loaded and exposed as read-only property of `WidgetRoot.current`
- User must declare `svidget` xml namespace in `<svg>` root: `xmlns:svidget="http://www.svidget.org/svidget"`
- `<title>` and `<desc>` elements are used to provide metadata about the widget.

#### Widget Example
```svg
<?xml version="1.0" encoding="utf-8" ?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svidget="http://www.svidget.org/svidget"
		 width="200" height="200">

	<title>My Widget</title>
	<desc>Example with params, actions, and events.</desc>

	<svidget:params>
		<svidget:param name="backgroundColor" shortname="bg" type="string" subtype="color" binding="#starback@fill" />
	</svidget:params>

	<svidget:actions>
		<svidget:action name="spin" external="true" binding="spin" description="Spins the star.">
			<svidget:actionparam name="rotations" type="number" defvalue="4" description="The total number of rotations."  />
		</svidget:action>
	</svidget:actions>

	<svidget:events>
		<svidget:event name="spinComplete" description="Triggered when the spinning has completed." />
	</svidget:events>

	<script type="application/javascript" xlink:href="path/to/svidget.svg.js"></script>

  ...

</svg>
```

#### Binding Selector Syntax
The binding selector syntax uses standard CSS selectors with one twist: the ability to bind to attributes.
Examples:
- `#starback@fill`: Binds to the `fill` attribute of the element with ID `starback`.
- `.myclass@stroke`: Binds to the `stroke` attribute of elements with class `myclass`.
- `rect@width`: Binds to the `width` attribute of all `<rect>` elements.
- `.container > circle.fun@cx`: Binds to the `cx` attribute of all `<circle class="fun">` elements in the `.container` element.

### Page Library
The `svidget-page` library is responsible for the functionality of Svidget widgets on the web page. It provides methods for loading and managing widgets in the web context. Since this library is loaded using ES syntax, it is the default library.

#### Functionality
- When the page is loaded, the `svidget` global object is created as an instance of `Svidget.PageRoot`.
- When the DOM is loaded, the global object scans for `<object data-svidget>` (formerly `<object role="svidget">`) elements and loads them as Svidget widgets.
- The global object provides methods for managing the lifecycle of these widgets, including creation, updates, and destruction.
- The global object detects changes to the DOM when new `<object data-svidget>` elements are added or removed, and updates the widget list accordingly.

### Communication Flow

#### Widget to Page
When events are triggered in the widget context, they are communicated to the page context.

##### Param Example
- When a param is set (value changed) in the widget context, it triggers the `set` event.
- The widget subscribes to all param events, so it receives the event.
- The widget calls the signal method on the `WidgetRoot` instance to notify the page context of the change.
- The signal method invoke the parent directly or through XSM to send a message to the page context.
- The page context receives the message and routes the message to the corresponding `WidgetReference` instance.
- The `WidgetReference` instance locates the target param and emits its `set` event and also triggers the `paramset` event for listeners listening to all widgets and params.

## Folder Structure
- `src/`: Contains the source code for the Svidget library.
- `src_old/`: Contains the old legacy code for the widget library that is being converted.
- `tests/unit`: Contains the unit tests for the Svidget library.
- `tests/unit_old`: Contains the old legacy unit tests that is being converted.

## Implementation

### Legacy Code Conversion
- Convert all code to TypeScript with modern ES syntax and strict type checking.
- Convert all code to use ES6 modules.
- Remove polyfills that are no longer needed as they are widely available in modern browsers (i.e. `Svidget.isArray`).
- Remove any code marked deprecated or unused code.
- Remove support for old browsers (i.e. IE11).
- Convert all Svidget enums to TypeScript union types, and place in module called `types.ts`. For non-enums (like `Namespace`), leave as objects.
- Use TypeScript class syntax in all modules that were previously using prototypes.
- Eliminate the `Collection` and `ObjectCollection` classes and use native JavaScript Arrays. Move the functions defined in `svidget.collection.js` and `svidget.objectcollection.js` to the `collections` modules and implement as exported util functions.
- Eliminate the `EventPrototype` and just implement the event registration functionality directly on the `Proxy` classes.
- Eliminate the `Communicator` as a class and just implement as exportable functions.
- Eliminate the `Svidget.Root` base class and just implement the functionality directly in the `PageRoot` class and `WidgetRoot` class. Move any common functions into `common.ts` module.
- Class members marked private in code or comments should be converted to private members of the class.
- Always use built-in DOM methods like `querySelectorAll` and ignore any code (or even TODO's) that mention `jquery`. This includes removing any code that references `jquery` or uses `jquery` methods.
- Prefer implementing todo's that you find.
- All classes no longer need to namespaced with `Svidget` i.e. `Svidget.EventDesc` should be just `EventDesc`.
- Existing event registration methods like `ontrigger` should be renamed in pascal-case like `onTrigger`.
- Child classes like `Param` should no longer accept `parent` argument in constructor, but instead should pass a handler for receiving events.
- Rename `toTransport` to `serialize`.
- In classes where there were getter/setter methods defined, implement them as properties with `get` and `set` accessors.
- `Action`, `EventDesc`, `Param` classes should have an `options` argument that is an object with properties that match the class properties as string from the element (i.e. `<svidget:param>`).

### Files
- `action.ts`: Contains the `Action` class, which represents an action that can be invoked on a widget.
- `actionParam.ts`: Contains the `ActionParam` class, which represents a parameter for an action.
- `actionParamProxy.ts`: Contains the `ActionParamProxy` class, which represents a proxy for an action param.
- `actionProxy.ts`: Contains the `ActionProxy` class, which represents a proxy for an action.
- `event.ts`: Contains the `Event` class, which represents an event emitted by a widget.
- `collections.ts`: Contains utility functions for working with collections of widgets, parameters, actions, and events.
- `common.ts`: Contains the common functionality for both page and widget contexts.
- `communicator.ts`: Contains functions for messages between the widget and the web page.
- `conversion.ts`: Contains utility functions for converting between different data types and structures used in Svidget.
- `core.ts`: Contains the core functions for Svidget.
- `dom.ts`: Contains utility functions for working with the DOM in the widget context. Contains the `DOMQuery` and `DOMItem` classes.
- `event.ts`: Contains the `Event` class, which represents an event emitted by a widget. Not to be confused with `WidgetEvent`, which is DOM-specific event used for messaging.
- `index.ts`: Contains the main Svidget class for interacting with widgets on the web page. Entrypoint for the page library. Also the default entrypoint.
- `index.widget.ts`: Contains the main Svidget class for interacting with widgets in the widget context. Entrypoint for the widget library.
- `log.ts`: Contains the logging functionality for Svidget.
- `param.ts`: Contains the `Param` class, which represents a parameter of a widget.
- `paramBase.ts`: Contains the `ParamBase` class, which is the base class for `Param` and `ActionParam`.
- `pageRoot.ts`: Contains the main Svidget class for interacting with widgets on the web page. (old file `svidget.root.page.js`).
- `widgetRoot.ts`: Contains the main Svidget class for interacting with widgets in the widget context. (old file `svidget.root.widget.js`).
- `types.ts`: Contains TypeScript union types for Svidget enums.
- `widget.ts`: Contains the `Widget` class, which represents a widget singleton instance in the widget scope.
- `widgetEvent.ts`: Contains the `WidgetEvent` class.
- `widgetReference.ts`: Contains the `WidgetReference` class, which represents a reference to a widget instance.

### Classes
- `Widget`: Represents a widget instance.
- `WidgetReference`: Represents a reference to a widget instance.
- `EventableBase`: Base class for classes that support event handling and emit events.
- `Param`: Represents a parameter of a widget.
- `ParamBase`: Represents the base class for `Param` and `ActionParam`.
- `Action`: Represents an action that can be invoked on a widget.
- `ActionParam`: Represents an action param for an action.
- `EventDesc`: Represents an event emitted by a widget.
- `DOMQuery`: Represents a query result for DOM elements in the widget context.
- `DOMItem`: Represents a single DOM element in the widget context.
- `WidgetEvent`: Represents an event emitted. <!-- Subclass of `Event` that adds additional functionality.--> Contains a factory function (formerly DOMEvent). Derived from `svidget.event`.
- `PageRoot`: Represents the main Svidget class for interacting with widgets on the web page.
- `WidgetRoot`: Represents the main Svidget class for interacting with widgets in the widget (SVG) context.

#### Proxy Classes
- `Proxy`: Represents a base proxy class in the web context. Contains all the base event registration logic.
- `ParamProxy`: Represents a widget param in the web context, allowing interaction with the widget's parameters, actions, and events.
- `ActionProxy`: Represents a widget action in the web context, allowing invocation of actions on the widget.
- `EventProxy`: Represents a widget event in the web context, allowing subscription to events emitted by the widget.
- `ActionParamProxy`: Represents a action param in the web context, allowing interaction with the action's parameters.

For proxy classes, look at the corresponding widget class in the existing code. You will find a static array declared on the class (i.e. `Svidget.Param.allProxyProperties`) that lists all the properties that should be proxied, also modifiable ones in `writableProxyProperties`. The proxy class should implement the same properties and methods as the widget class, but with the added functionality of event registration and invocation.

## Deployment
<!-- dependency: "*workspace" ? -->
Build 2 files (both minified):
- `svidget.svg.js`: The widget library for use inside SVG files.
- `svidget.js`: The page library for use on the web page.

The whole package will be deployed manually to `npm` once manual testing is complete.

## Glossary
- **Widget**: A self-contained SVG component that can be embedded in a web page or application.
- **Param**: A data endpoint that can be read from and set at any point during the widget's lifecycle.
- **Action**: An action endpoint (aka method) that abstracts underlying functionality in the widget that can be invoked at the page level.
- **Event**: A notification from the widget that can be subscribed to by the page.
- **Native Event**: An actual event emitted by the browser or through a custom event (e.g., `click`, `keydown`).
- **Scope**: The location context where the library is running, either in a widget (SVG) `widget` scope, or on the web page (HTML) `page` scope.
- **Proxy**: A wrapper around a widget or its properties that allows for event registration and invocation in the web context.
- **Binding Selector**: A special syntax used to bind widget parameters to SVG attributes or elements, allowing for dynamic updates and interactions.
- **Standalone**: A mode in which the widget is loaded on the page but no communication link is established, or when SVG is navigated to directly in the browser.
- **Declared Event**: An event handler defined on the element itself as a string i.e. `<object onchange="foo()">`.

## References

### External

- [SVG Specification](https://www.w3.org/TR/SVG2/)