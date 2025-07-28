


/**
 * Gets all the values from the query string and returns the result as an object.
 * @static
 * @memberof Svidget
 * @param {bool} duplicates - if true, group duplicates into an array (default == false)
 * @param {} lastOneWins - if true, then last duplicate encountered will win, else first one will win (default == false)
 */

import { isArray } from "./core";
import { DOM, DOMElement, namespaces } from "./dom";

export interface QueryStringParams {
    [key: string]: string | string[];
}

/*
Adapted from SO answer: http://stackoverflow.com/a/2880929/242407
*/
export function parseQueryString(duplicates: boolean = false, lastOneWins: boolean = false): QueryStringParams {
	const urlParams: QueryStringParams = {};
	if (!window.location) return urlParams;
	const queryString =
        window.location.search == null || window.location.search.length > 0 ? window.location.search : '';
	let match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, ' '));
        },
        query = queryString.substring(1);

	while (match = search.exec(query)) {
		// index 1 and 2 because those are the subgroups in parens (), index 0 is the whole string match
		let name = decode(match[1]), value = decode(match[2]);
		if (duplicates) {
			if (urlParams[name] !== undefined) {
				if (isArray(urlParams[name]))
					(urlParams[name] as string[]).push(value);
				else
					urlParams[name] = [urlParams[name] as string, value];
			}
			else
				urlParams[name] = value;
		}
		else if (lastOneWins || urlParams[name] === undefined)
			urlParams[name] = value;
	}

	return urlParams;
}


export function isValidSvidgetElement(xele: DOMElement, name: string): boolean {
    return xele != null && xele.localName == name && xele.namespaceURI == namespaces.svidget;
}

export function fixSizing() {
    const root = DOM.root<SVGSVGElement>();
    // for iframes with viewBox, we need to ensure SVG content scales with iframe size, so we set width/height to 100%
    if (
        root &&
        root.viewBox &&
        root.viewBox.baseVal &&
        root.viewBox.baseVal.width > 0 &&
        root.viewBox.baseVal.height > 0
    ) {
        root.setAttribute('width', '100%');
        root.setAttribute('height', '100%');
    }
}

/**
 * Gets a svidget element by name in the xml svidget namespace.
 * @param name - the name of the svidget element to get i.e. "param", "action", "event"
 * @returns 
 */
export function getSvidgetElement(name: string): Element | null {
    // Replace Svidget.DOM.getByNameSvidget with your own DOM utility if needed
    const eles = getByNameSvidget(name, true);
    if (!eles || eles.length === 0) return null;
    return eles[0];
}

export function getByNameSvidget(tagName: string, asArray?: boolean): ArrayLike<Element> | null {
    return DOM.getByNameNS(namespaces.svidget, tagName, asArray);
}