/*****************************************
svidget.root.page.js

Contains the root object definition for the page level.

Dependencies:
Svidget.Core
Svidget.Root

******************************************/

// 7/22: add more Svidget.log to analyze order of signals, also figure out why params not populated on
// widget and circle changing to green

/// <reference path="root.ts" />
/// <reference path="types.ts" />
/// <reference path="../communication/communicator.ts" />

namespace Svidget {

    export class PageWidgetCommunicator {
        //private readonly root: Root;
        //private readonly comm2: Communicator;

        constructor(private readonly comm: Communicator, private readonly messageHandler: PageWidgetMessageHandlerFunc) {
            //this.root = root;
            //this.comm = comm;
        }
        // ***********************************
        // REGION: Communication

        public receiveFromWidget(
            name: string,
            payload: unknown,
            widget: WidgetReference
        ): void {
            Svidget.log(`page: receiveFromWidget {name: ${name}, widgetID: ${widget.id}}`);
            //const widget = this.root.getWidget(widgetID);
            //if (widget == null && name != "initialized") return; // widgetID may be null if widget hasn't been assigned an ID
            // invoke handler for message
            switch (name) {
                // params handlers
                // payload == param transport { name: "background", type: "", value: 3 }
                case "paramadded":
                    this.handleReceiveWidgetParamAdded(widget, payload as ParamCore);
                    break;
                case "paramremoved":
                    this.handleReceiveWidgetParamRemoved(widget, payload as ParamCore);
                    break;
                case "paramchanged":
                    this.handleReceiveWidgetParamChanged(widget, payload as ParamCore);
                    break;
                case "paramset":
                    this.handleReceiveWidgetParamSet(widget, payload as ParamCore);
                    break;
                // actions handlers
                case "actionadded":
                    this.handleReceiveWidgetActionAdded(widget, payload);
                    break;
                case "actionremoved":
                    this.handleReceiveWidgetActionRemoved(widget, payload);
                    break;
                case "actionchanged":
                    this.handleReceiveWidgetActionChanged(widget, payload);
                    break;
                case "actioninvoked":
                    this.handleReceiveWidgetActionInvoked(widget, payload);
                    break;
                case "actionparamadded":
                    this.handleReceiveWidgetActionParamAdded(widget, payload);
                    break;
                case "actionparamremoved":
                    this.handleReceiveWidgetActionParamRemoved(widget, payload);
                    break;
                case "actionparamchanged":
                    this.handleReceiveWidgetActionParamChanged(widget, payload);
                    break;
                // events handlers
                case "eventadded":
                    this.handleReceiveWidgetEventAdded(widget, payload);
                    break;
                case "eventremoved":
                    this.handleReceiveWidgetEventRemoved(widget, payload);
                    break;
                case "eventchanged":
                    this.handleReceiveWidgetEventChanged(widget, payload);
                    break;
                case "eventtriggered":
                    this.handleReceiveWidgetEventTriggered(widget, payload);
                    break;
                default: 
                    this.messageHandler && this.messageHandler(name, widget, payload);
                // acks
                //case "startack":
                //    this.handleReceiveWidgetStartAck(widget, payload);
                //    break;
            }
        }

        /* Signaling */

        // signal widget to start, effectively establishing a connection from parent to it
        signalStart(widgetRef, paramValues) {
            Svidget.log(
                "page: signalStart {id: " +
                    widgetRef.id() +
                    ", url: " +
                    widgetRef.url() +
                    ", tag: " +
                    widgetRef.element().tagName +
                    "}"
            );
            //var paramValues = {};
            var payload = {
                id: widgetRef.id(),
                params: paramValues,
                connected: widgetRef.connected(),
            };
            this.comm.signalWidget(widgetRef, "start", payload);
        }

        signalPropertyChange(widgetRef, obj, objType, propName, propValue) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log(
                "page: signalPropertyChange {id: " +
                widgetRef.id() +
                ", type: " +
                objType +
                "}"
            );
            var payload = {
                type: objType,
                name: obj.name(),
                propertyName: propName,
                value: propValue,
            };
            this.comm.signalWidget(widgetRef, "propertychange", payload);
        }

        signalActionInvoke(widgetRef, actionProxy, argList) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log(
                "page: signalActionInvoke {id: " +
                    widgetRef.id() +
                    ", url: " +
                    widgetRef.url() +
                    "}"
            );
            //var paramValues = {};
            var payload = { action: actionProxy.name(), args: argList };
            this.comm.signalWidget(widgetRef, "actioninvoke", payload);
        }

        signalEventTrigger(widgetRef, eventDescProxy, data) {
            if (!widgetRef.started() || !widgetRef.connected()) return;
            Svidget.log(
                "page: signalEventTrigger {id: " + widgetRef.id() + "}"
            );
            var payload = { event: eventDescProxy.name(), data: data };
            this.comm.signalWidget(widgetRef, "eventtrigger", payload);
        }

        /* Signal Handlers */




        // Handle: Params

        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetParamAdded(widgetRef: WidgetReference, paramPayload: ParamTransport) {
            Svidget.log(
                "page: handleReceiveWidgetParamAdded {param: " +
                    paramPayload.name +
                    "}"
            );
            // paramPayload == param transport
            // add the paramProxy from param transport, this will trigger any events associated with the add
            widgetRef.addParamProxy(paramPayload.name, paramPayload); // paramPayload == options
        }

        // invoked by widget to notify parent that a param was removed
        handleReceiveWidgetParamRemoved(widgetRef: WidgetReference, paramName: string) {
            Svidget.log(
                "page: handleReceiveWidgetParamRemoved {param: " +
                    paramName +
                    "}"
            );
            // remove the paramProxy, this will trigger any events associated with the add
            widgetRef.removeParamProxy(paramName);
        }

        // changeData: { name: actionName, property: "enabled", value: val }
        handleReceiveWidgetParamChanged(widgetRef, changePayload) {
            Svidget.log(
                "page: handleReceiveWidgetParamChanged {param: " +
                    changePayload.name +
                    "}"
            );
            var param = widgetRef.param(changePayload.name);
            if (param == null) return;
            param.notifyPropertyChange(
                changePayload.property,
                changePayload.value
            );
        }

        // valueData: { name: actionName, value: val }
        handleReceiveWidgetParamSet(widgetRef, setPayload) {
            Svidget.log(
                "page: handleReceiveWidgetParamSet {param: " +
                    setPayload.name +
                    "}"
            );
            var param = widgetRef.param(setPayload.name);
            if (param == null) return;
            param.notifyValueChange(setPayload.value);
        }

        // Handle: Actions

        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetActionAdded(widgetRef, actionPayload) {
            Svidget.log(
                "page: handleReceiveWidgetActionAdded {action: " +
                    actionPayload.name +
                    "}"
            );
            // actionPayload == action transport
            // add the actionProxy from action transport, this will trigger any events associated with the add
            widgetRef.addActionProxy(actionPayload.name, actionPayload); // actionPayload == options
        }

        // invoked by widget to notify parent that a param was removed
        handleReceiveWidgetActionRemoved(widgetRef, actionName) {
            Svidget.log(
                "page: handleReceiveWidgetActionRemoved {action: " +
                    actionName +
                    "}"
            );
            // remove the paramProxy, this will trigger any events associated with the add
            widgetRef.removeActionProxy(actionName);
        }

        // changeData: { name: actionName, property: "enabled", value: val }
        handleReceiveWidgetActionChanged(widgetRef, changePayload) {
            Svidget.log(
                "page: handleReceiveWidgetActionChanged {action: " +
                    changePayload.name +
                    "}"
            );
            var action = widgetRef.action(changePayload.name);
            if (action == null) return;
            action.notifyPropertyChange(
                changePayload.property,
                changePayload.value
            );
        }

        // actionReturnPayload = { name: actionName, returnValue: "value returned from action" }
        handleReceiveWidgetActionInvoked(widgetRef, actionReturnPayload) {
            Svidget.log(
                "page: handleReceiveWidgetActionInvoked {action: " +
                    actionReturnPayload.name +
                    "}"
            );
            var action = widgetRef.action(actionReturnPayload.name);
            if (action == null) return;
            action.invokeFromWidget(actionReturnPayload.returnValue);
        }

        // invoked by widget to notify parent that a param was added
        handleReceiveWidgetActionParamAdded(widgetRef, actionParamPayload) {
            Svidget.log(
                "page: handleReceiveWidgetActionParamAdded {actionparam: " +
                    actionParamPayload.name +
                    "}"
            );
            // actionPayload == action transport
            // add the actionProxy from action transport, this will trigger any events associated with the add
            var action = widgetRef.action(actionParamPayload.actionName);
            if (action == null) return;
            action.addParam(actionParamPayload.name, actionParamPayload); // actionParamPayload == options
        }

        // invoked by widget to notify parent that a param was removed
        // { name: actionParamName, actionName: actionName }
        handleReceiveWidgetActionParamRemoved(
            widgetRef,
            actionParamNamePayload
        ) {
            Svidget.log(
                "page: handleReceiveWidgetActionParamRemoved {actionparam: " +
                    actionParamNamePayload +
                    "}"
            );
            // remove the paramProxy, this will trigger any events associated with the add
            var action = widgetRef.action(actionParamNamePayload.actionName);
            if (action == null) return;
            action.removeParam(actionParamNamePayload.name);
        }

        // changeData: { name: actionParamName, actionName: actionName, property: "enabled", value: val }
        handleReceiveWidgetActionParamChanged(widgetRef, changePayload) {
            Svidget.log(
                "page: handleReceiveWidgetActionParamChanged {actionparam: " +
                    changePayload.name +
                    "}"
            );
            var action = widgetRef.action(changePayload.actionName);
            if (action == null) return;
            var actionParam = action.param(changePayload.name);
            if (actionParam == null) return;
            actionParam.notifyPropertyChange(
                changePayload.property,
                changePayload.value
            );
        }

        // Handle: Events

        handleReceiveWidgetEventAdded(widgetRef, eventDescPayload) {
            Svidget.log(
                "page: handleReceiveWidgetEventAdded {event: " +
                    eventDescPayload.name +
                    "}"
            );
            // eventPayload == eventDesc transport
            // add the eventDescProxy from eventDesc transport, this will trigger any events associated with the add
            widgetRef.addEventProxy(eventDescPayload.name, eventDescPayload);
        }

        handleReceiveWidgetEventRemoved(widgetRef, eventDescName) {
            Svidget.log(
                "page: handleReceiveWidgetEventRemoved {event: " +
                    eventDescName +
                    "}"
            );
            // eventPayload == eventDesc.name
            // remove the eventDescProxy by its name, this will trigger any events associated with the remove
            widgetRef.removeEventProxy(eventDescName);
        }

        // changeData: { name: eventName, property: "enabled", value: val }
        handleReceiveWidgetEventChanged(widgetRef, changePayload) {
            Svidget.log(
                "page: handleReceiveWidgetEventChanged {event: " +
                    changePayload.name +
                    "}"
            );
            var ev = widgetRef.event(changePayload.name);
            if (ev == null) return;
            ev.notifyPropertyChange(
                changePayload.property,
                changePayload.value
            );
        }

        // invoked by widget to notify parent that an event was triggered
        handleReceiveWidgetEventTriggered(widgetRef, eventDataPayload) {
            Svidget.log(
                "page: handleReceiveWidgetEventTriggered {event: " +
                    eventDataPayload.name +
                    "}"
            );
            //{ "name": eventDesc.name(), "value": value };
            var ev = widgetRef.event(eventDataPayload.name);
            if (ev == null) return;
            ev.triggerEventFromWidget(eventDataPayload.value);
            // widgetRef.triggerFromWidget("eventtrigger", eventData.value); // not needed, we bubble from eventDescProxy to WidgetReference
        }
    }
}
