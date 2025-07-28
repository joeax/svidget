import { logInfo } from "./logging";
import { Widget } from "./widget";

export class WidgetSignaler {
    private widget: Widget | null = null;
    
    constructor(widget: Widget, communicator: ) {
        this.widget = widget;
    }

    //signalInitialized() {
    //	logInfo("widget: signalInitialized");
    //	// at this stage we don't know our ID yet nor do we have any payload
    //	signalParent("initialized", null, null); //this.current().toTransport());
    //}

    //signalLoaded() {
    //	// note: id can be null, it means it hasn't been assigned yet (widget DOM loaded before start called)
    //	logInfo("widget: signalLoaded {id: " + this.current().id() + "}");
    //	signalParent("loaded", this.current().toTransport(), this.current().id());
    //}

    signalStartAck() {
        logInfo('widget: signalStartAck {id: ' + this.widget?.id + '}');
        var t = this.widget?.serialize();
        signalParent('startack', t, this.widget?.id);
    }

    // for any other signals, if widget isn't connected then don't signal

    // Params

    signalParamAdded(param: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalParamAdded {id: ' + this.current().id() + '}');
        var transport = param.toTransport();
        signalParent('paramadded', transport, this.current().id());
    }

    signalParamRemoved(paramName: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalParamRemoved {id: ' + this.current().id() + '}');
        //var transport = param.name();
        signalParent('paramremoved', paramName, this.current().id());
    }

    signalParamChanged(param: any, changeData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalParamChanged {id: ' + this.current().id() + '}');
        changeData.name = param.name(); // add param name
        signalParent('paramchanged', changeData, this.current().id());
    }

    signalParamSet(param: any, changeData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalParamSet {id: ' + this.current().id() + '}');
        changeData.name = param.name(); // add param name
        signalParent('paramset', changeData, this.current().id());
    }

    // Actions/Action Params

    signalActionAdded(action: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionAdded {id: ' + this.current().id() + '}');
        var transport = action.toTransport();
        signalParent('actionadded', transport, this.current().id());
    }

    signalActionRemoved(actionName: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionRemoved {id: ' + this.current().id() + '}');
        //var t = action.name();
        signalParent('actionremoved', actionName, this.current().id());
    }

    // changeData: { name: actionName, property: "enabled", value: val }
    signalActionChanged(action: any, changeData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionChanged {id: ' + this.current().id() + '}');
        changeData.name = action.name(); // add action name
        signalParent('actionchanged', changeData, this.current().id());
    }

    // returnData: { name: actionName, returnValue: "enabled", value: val }
    signalActionInvoked(action: any, returnData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionInvoked {id: ' + this.current().id() + '}');
        //var transport = { name: action.name(), retu: argObj };
        returnData.name = action.name();
        signalParent('actioninvoked', returnData, this.current().id());
    }

    signalActionParamAdded(actionParam: any, actionName: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionParamAdded {id: ' + this.current().id() + '}');
        var transport = actionParam.toTransport();
        transport.actionName = actionName;
        signalParent('actionparamadded', transport, this.current().id());
    }

    signalActionParamRemoved(actionParamName: any, actionName: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionParamRemoved {id: ' + this.current().id() + '}');
        //var t = action.name();
        var transport = { name: actionParamName, actionName: actionName };
        signalParent('actionparamremoved', transport, this.current().id());
    }

    signalActionParamChanged(actionParam: any, action: any, changeData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalActionParamChanged {id: ' + this.current().id() + '}');
        changeData.name = actionParam.name(); // add actionparam name
        changeData.actionName = action.name(); // add actionparam name
        signalParent('actionparamchanged', changeData, this.current().id());
    }

    // Events

    signalEventAdded(eventDesc: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalEventAdded {id: ' + this.current().id() + '}');
        var transport = eventDesc.toTransport();
        signalParent('eventadded', transport, this.current().id());
    }

    signalEventRemoved(eventDescName: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalEventRemoved {id: ' + this.current().id() + '}');
        //var transport = eventDesc.name();
        signalParent('eventremoved', eventDescName, this.current().id());
    }

    signalEventChanged(eventDesc: any, changeData: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalEventChanged {id: ' + this.current().id() + '}');
        changeData.name = eventDesc.name(); // add event name
        signalParent('eventchanged', changeData, this.current().id());
    }

    signalEventTriggered(eventDesc: any, value: any) {
        if (!this.connected()) return; // no signaling if not connected
        logInfo('widget: signalEventTriggered {id: ' + this.current().id() + '}');
        var transport = { name: eventDesc.name(), value: value };
        signalParent('eventtriggered', transport, this.current().id());
    }
}
