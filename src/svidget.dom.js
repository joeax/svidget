/*****************************************
svidget.core.js

Contains the core framework elements.

Dependencies:
(none)

Browser Support:
IE9+, FF?+, Chrome?+

Prerequisites:


******************************************/


// Valid Selectors
// element itself
// "someid" - reference to element
// "#someid" - reference to element
// ".someid" - reference to element class

// https://developer.mozilla.org/en-US/docs/Web/API/document.querySelectorAll

/* Svidget.DOM */

Svidget.DOM = {

	// REMARKS
	// Wrapper for getElementById
	get: function (sel) {
		return document.getElementById(sel);
	},

	getByName: function (tagName, asCollection) {
		return this.getChildrenByName(document, tagName, asCollection);
	},

	getByNameNS: function (namespace, tagName, asCollection) {
		var tags = document.getElementsByTagNameNS(namespace, tagName);
		if (asCollection) {
			return new Svidget.Collection(Svidget.array(tags));
		}
		return tags;
	},

	// Gets elements by tag name belonging to the svidget namespace
	getByNameSvidget: function (tagName, asCollection) {
		return this.getByNameNS(Svidget.Namespaces.svidget, tagName, asCollection);
	},

	getChildrenByName: function (source, tagName, asCollection) {
		var tags = source.getElementsByTagName(tagName);
		if (asCollection) {
			return new Svidget.Collection(Svidget.array(tags));
		}
		return tags;
	},

	// if sel is a string calls get()
	getElement: function (sel) {
		if (typeof sel == "string")
			return this.get(sel);
		else
			return sel;
	},

	// gets an element by ID and returns a DomItem
	getItem: function (sel) {
		return this.wrap(this.get(sel));
	},

	// returns a DomQuery object
	select: function (sel) {
		// todo: support jQuery selector if querySelectorAll fails, it might be loaded on the page so we might as well use it if we can
		if (!document.querySelectorAll) return null;
		if (sel == null) return null; // new Svidget.DomQuery();
		// use querySelectorAll
		var attrRX = /@[^=#\s]+/g;
		var hasAttr = attrRX.test(sel);
		var col = new Svidget.Collection();
		var res;
		// if selector has an attribute in it, split it first by comma
		if (hasAttr) {
			var parts = sel.split(",");
			for (var i = 0; i < parts.length; i++) {
				res = selectSingle(parts[i]);
				if (res) col.addRange(res);
			}
		}
		else {
			res = selectSingle(sel);
			// its possible selector was bad, in which case we get null, so check
			if (res) col.addRange(res);
		}

		var query = new Svidget.DOMQuery(col, sel);
		return query;

		// given a selector string free from any commas, looks up the elements/attributes for it
		// and returns a collection.
		function selectSingle(s) {
			if (s == null) return null;
			var attrRXEnd = /@([^=#\s]+)$/g;
			var sel = s;
			var attrName;
			var match = attrRXEnd.exec(s);
			if (match) {
				attrName = match[1]; // match the subgroup
				sel = sel.replace(match[0], ""); //strip out attr portion (i.e. @attr)
			}
			// query
			var eles;
			try {
				eles = document.querySelectorAll(sel);
			}
			catch (ex) {
				// seelctor was invalid, so just return null
				return null;
			}
			// build collection
			var col = [];
			for (var i = 0; i < eles.length; i++) {
				var ele = eles[i];
				var item;
				if (attrName) {
					var attr = Svidget.DOM.attr(ele, attrName);
					if (attr != null) {
						item = new Svidget.DOMItem(attr);
					}
				}
				else {
					item = new Svidget.DOMItem(ele);
				}
				if (item) {
					col.push(item);
				}
			}

			return new Svidget.Collection(col);
		}
	},

	// Returns the first DOM element in a query
	selectElement: function (sel) {
		if (typeof sel == "string") {
			var q = this.select(sel);
			if (q == null || q.length == 0) return null;
			return q.item(0).source();
		}
		else if (this.isElement(sel))
			return sel;
		else
			return null;
	},

	// returns a DomItem if ele is a element or attribute object
	// else returns the original item
	wrap: function (ele) {
		return new Svidget.DOMItem(ele);
	},

	// converts an HTML or SVG DOM node into a pure object literal used to transport
	transportize: function (ele) {
		return {
			name: ele.localName,
			namespace: ele.namespaceURI,
			value: ele.value,
			type: ele.nodeType == 1 ? Svidget.NodeType.element : ele.nodeType == 2 ? Svidget.NodeType.attribute : null
		};
	},

	// Elements

	root: function () {
		return document.documentElement;
	},

	rootItem: function () {
		// should we cache?
		return this.wrap(this.root());
	},

	attr: function (ele, attrName) {
		return ele.attributes[attrName];
	},

	attrValue: function (ele, attrName) {
		var a = this.attr(ele, attrName);
		if (a) return a.value;
		return null;
	},

	clone: function (item) {

	},

	cloneDetached: function (item) {
		// returns a clone DomItem without its underlying element/attribute, to be used as a transport
	},

	isDOMNode: function (source) {
		return (source.namespaceURI && source.localName && source.nodeType && source.value && (source.nodeType == 1 || source.nodeType == 2)); //!source.attributes || 
	},

	fromNodeType: function (type) {
		if (type == 1) return "element";
		if (type == 2) return "attribute";
		if (type == 3) return "text";
		return null;
	},

	// TEXT

	text: function (sel, text) {
		var obj = this.select(sel);
		if (text === undefined)
			return this.getText(obj);
		else
			this.setText(obj, text);
	},

	getText: function (obj) {
		if (obj.textContent)
			return obj.textContent;
		else if (obj.innerHTML)
			return obj.innerHTML;
		else
			return null;
	},

	setText: function (obj, text) {
		if (obj.textContent)
			obj.textContent = text + "";
		else if (obj.innerHTML)
			obj.innerHTML = text + "";
	},

	// VALIDATION

	// returns null - it means document hasn't loaded yet
	// returns undefined - it means document is loaded but not accessible due to security (cross domain) constraints
	getDocument: function (objOrWinEle) {
		try {
			var doc = objOrWinEle.contentDocument;
			// certain browsers (Chrome) returns a blank document instead of null
			if (doc != null && doc.URL == "about:blank") return null;
			return doc;
		}
		catch (ex) {
			return undefined;
		}
	},

	// determines if document for <object> or <iframe> is loaded and ready
	isElementDocumentReady: function (objOrWinEle) {
		return this.getDocument(objOrWinEle) !== null;
	},

	isElement: function (ele) {
		return ele instanceof HTMLElement;
	},

	// MANIPULATION
	// todo move to DomItem

	attach: function (containerEle, eles) {

	},

	// detaches an element from the DOM
	// RETURNS
	// The elements that were detached
	detach: function (sel) {

	},

	disable: function (ele) {
		ele.disabled = true;
	},

	enable: function (ele) {
		ele.disabled = false;
	},

	show: function (ele, val) {
		ele.style.display = "initial";
		ele.style.visibility = "visible";
	},

	hide: function (ele, val) {
		ele.style.display = "none";
		ele.style.visibility = "hidden";
	},

	// EVENTS

	// Note: todo: for on and off
	// wrap callback in compat layer with jQuery style event object

	// PARAMS
	// obj: object to attach listener to
	// name: type of event i.e. "click"
	// callback: function to call back
	// capture: whether in capture/bubble
	// RETURNS
	// true if successful
	// REMARKS
	// Note: this is for DOM events

	// todo: support for event delegation?

	on: function (obj, type, callback, capture) {
		capture = !!capture; // normalize to bool (default == false)
		var attached = false;
		if (obj.addEventListener) {
			// Supports DOM spec
			obj.addEventListener(type, callback, capture);
			attached = true;
		}
		else if (obj.attachEvent) {
			// IE8 and below
			obj.attachEvent("on" + type, callback);
			attached = true;
		}
		// obj doesn't support events
		return attached;
	},

	off: function (obj, type, callback, capture) {
		capture = !!capture; // normalize to bool (default == false)
		var detached = false;
		if (obj.addEventListener) {
			obj.removeEventListener(type, callback, false);
			detached = true;
		}
		else if (document.attachEvent) {
			document.detachEvent("on" + type, callback);
			detached = true;
		}
		// obj doesn't support events
		return detached;
	}

};


//var doc = document;
//var docele = document.documentElement;