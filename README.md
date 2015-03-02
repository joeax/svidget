Svidget.js
==========

Svidget.js (SVG + widget) is a robust and powerful framework for building complex data visualization widgets in SVG. 

Svidget is not another data visualization framework like [D3](https://github.com/mbostock/d3) or [SnapSVG](https://github.com/adobe-webplatform/Snap.svg). Rather, it is a framework for componetizing your data visualizations and exposing it as a widget to use you any HTML5 page. As a matter of fact, you can combine Svidget.js with D3 or any popular visualization framework, provided it can be embedded directly into an SVG file (see Compatibility below). Best of all, it is endorsed by Chuck Norris!*

<small>\* Just kidding</small>

> Svidget is currently in beta. It is functionally complete and stable. I am currently working on some complex demos, finalizing the unit tests, and getting all documentation ready. For more information visit the [Svidget.js Website](http://www.svidget.com).

###Download
Download the latest stable builds from the `dist` folder. The current version is **0.2.2**.

###Bower
Install from Bower:

    bower install svidget

###Using
To get started, consider this simple star SVG file.

![Star](https://raw.githubusercontent.com/joeax/svidget/master/demo/images/star.png)

And here's its SVG:
```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200">
	<defs>
		<linearGradient id="backgroundGradient" y1="0" y2="100%" x1="0" x2="0">
			<stop offset="0%" stop-color="#fff" stop-opacity="0.5" />
			<stop offset="100%" stop-color="#fff" stop-opacity="0.0" />
		</linearGradient>
	</defs>
	<g transform="translate(0 8)">
		<path id="starback" fill="cornflowerblue" stroke="white" stroke-width="6" stroke-linejoin="round" d="M 100 4 L 128.214 61.1672 L 191.301 70.3344 L 145.651 114.833 L 156.427 177.666 L 100 148 L 43.5726 177.666 L 54.3493 114.833 L 8.69857 70.3344 L 71.7863 61.1672 Z" />
		<path id="starfront" fill="url(#backgroundGradient)" stroke="midnightblue" stroke-width="6" stroke-linejoin="round" d="M 100 4 L 128.214 61.1672 L 191.301 70.3344 L 145.651 114.833 L 156.427 177.666 L 100 148 L 43.5726 177.666 L 54.3493 114.833 L 8.69857 70.3344 L 71.7863 61.1672 Z" />
	</g>
</svg>
```


Ok, thats great. But what if I want to add interactivity to this SVG document. Maybe I want to change its colors. And, I want to provide a way for a user to spin it. Oh, and I want to be notified when it's done spinning. 

The brute force approach would be to embed the SVG directly into the HTML, and write my script to manage user interaction and notifications. In the process, I would have intermingled SVG with HTML and JavaScript, and that gets messy in a hurry. 

With Svidget, you componentize your UI and its logic as a widget in a SVG file.

```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
xmlns:svidget="http://www.svidget.org/svidget"
width="200" height="200">

<svidget:params>
	<svidget:param name="borderColor" shortname="bd" type="string" subtype="color" binding="#starfront@stroke" />
	<svidget:param name="borderWidth" shortname="bw" type="number" binding="#starfront@stroke-width,#starback@stroke-width" />
	<svidget:param name="backgroundColor" shortname="bg" type="string" subtype="color" binding="#starback@fill" />
</svidget:params>

<svidget:actions>
	<svidget:action name="spin" external="true" binding="spin" description="Spins the star.">
		<svidget:actionparam name="power" type="number" default="5" description="The amount of power to exert on the star to begin its rotation."  />
	</svidget:action>
</svidget:actions>

<svidget:events>
	<svidget:event name="spinComplete" description="Triggered for a mouse over or touch hover on the shape." />
</svidget:events>

<script type="application/javascript" xlink:href="../scripts/svidget.js"></script>

<defs>
...
<!-- rest of SVG widget -->
```

As you can see Svidget allows you to use a simple declarative syntax with the SVG document itself.

There are 3 main objects in a widget: **params**, **actions**, and **events**. 

> **Params** - these are the data endpoints. They can be read from and set at any point during the widget's lifecycle.

> **Actions** - these are your action endpoints (aka methods). They are abstractions to underlying functionality in the widget. 

> **Events** - these represent notifications from the widget. 

In addition to these, params and actions also have events that you can subscribe to when they are set or invoked. See the API for more information.

Ok so now that we have an SVG widget, let's use it on a page:

```html
<object id="star" role="svidget" data="widgets/star.svg" type="image/svg+xml" width="200" height="200">
	<param name="borderColor" value="darkgreen" />
	<param name="backgroundColor" value="green" />
	<param name="borderWidth" value="10" />
</object>
```

That's it! In addition to this declarative syntax, you can also programatically add a widget to the page at any time:

```javascript
svidget.load("#widgetContainer", "widgets/star.svg", { 
	borderColor: "orange", 
	backgroundColor: "green",
	borderWidth: 10 
});
```

For more information, see the [Svidget website](http://www.svidget.com).



###Compatibility
These frameworks have been tested and shown to play nice with Svidget within an SVG file.

> - jQuery 2.x and above
> - D3.js
> - svg.js
> - snap.svg

Basically any JavaScript framework that can be embedded in an SVG file will work. 
A general rule is if the framework only supports IE9 and above it will work. Frameworks that try to support non-HTML5 browsers like IE6 probably won't.


####Falling Back
In non-HTML5 browsers, Svidget will attempt to fall back to fallback content specified in the <object> tag.


###Build
The latest builds are in the releases folder. Get started today! 

When reporting issues, please be as descriptive as possible, including steps to reproduce.

If you want to build it yourself, clone the project then follow these steps:

Install the Grunt CLI:

    npm install -g grunt-cli

Run this grunt command:

    grunt all


###Contribute
If you find Svidget fascinating and want to contribute, that's great! Please follow these guidelines:

- Please respect the coding conventions in place. Put a comment as to what you changed. Don't worry, comments get stripped out during the build. 
- Please do some basic testing of your code, including testing every button on the kitchen sink page. (unit tests coming soon)


###License
Licensed under [MIT](http://opensource.org/licenses/MIT).


