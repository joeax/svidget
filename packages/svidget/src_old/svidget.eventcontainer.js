/*****************************************
svidget.eventcontainer.js

Acts as a container for event handlers.

Dependencies:
Svidget.EventPrototype

******************************************/

/**
 * Implements EventPrototype as a standalone object.
 * @class
 * @param {Array} typelist - An array of types that this event container accepts.
 * @param {object} target - The object instantiating this object that will be specified as the target when triggered.
 */
Svidget.EventContainer = function (typelist, target) {
	this.__type = "Svidget.EventContainer";
	Svidget.EventPrototype.apply(this, [typelist]);
	this.target = target;
}

Svidget.EventContainer.prototype = new Svidget.EventPrototype();
Svidget.extend(Svidget.EventContainer, {

	/**
	 * Gets the target object to use when triggering an event.
	 * @method
	 * @returns {object}
	*/
	getTarget: function () {
		return this.target;
	}

}, true);

	