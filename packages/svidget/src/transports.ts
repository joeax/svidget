// Transport interfaces for cross-window messaging and serialization

export interface WidgetTransport {
    id: string;
    enabled: boolean;
    params: ParamTransport[];
    actions: ActionTransport[];
    events: EventDescTransport[];
}

export interface ParamTransport {
    name: string;
    type?: string;
    value: any;
    enabled?: boolean;
    shortName?: string;
    coerce?: boolean;
    group?: string;
    defaultValue?: any;
    description?: string;
    subType?: string;
    typeData?: string;
}

export interface ActionTransport {
    name: string;
    description?: string;
    external: boolean;
    enabled: boolean;
    params: ActionParamTransport[];
}

export interface ActionParamTransport {
    name: string;
    actionName?: string;
    type: string;
    subtype?: string;
    typedata?: string;
    defaultValue?: any;
    description?: string;
}

export interface EventDescTransport {
    name: string;
    description?: string;
    external: boolean;
    enabled: boolean;
}
